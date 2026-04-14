const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /kasir - halaman kasir utama
router.get('/', async (req, res) => {
  try {
    const [menus] = await db.query(
      `SELECT m.*, k.NamaKategori 
       FROM menu m 
       JOIN kategori_menu k ON m.KategoriID = k.KategoriID 
       ORDER BY k.NamaKategori, m.NamaMenu`
    );
    const [kategoris] = await db.query('SELECT * FROM kategori_menu ORDER BY NamaKategori');
    res.render('pages/kasir', {
      title: 'Kasir - NoBuRi POS',
      menus,
      kategoris
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat data menu');
    res.redirect('/');
  }
});

// POST /kasir/transaksi - proses pembayaran
router.post('/transaksi', async (req, res) => {
  const { items, totalHarga, totalBayar, metodeBayar } = req.body;
  const userID = req.session.user.UserID;

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Generate TransaksiID
    const [lastTrx] = await conn.query(
      "SELECT TransaksiID FROM transaksi ORDER BY TransaksiID DESC LIMIT 1"
    );
    let newNum = 1;
    if (lastTrx.length > 0) {
      const lastNum = parseInt(lastTrx[0].TransaksiID.split('-')[1]) || 0;
      newNum = lastNum + 1;
    }
    const transaksiID = 'TRX-' + String(newNum).padStart(5, '0');
    const kembalian = parseInt(totalBayar) - parseInt(totalHarga);

    // Insert transaksi
    await conn.query(
      `INSERT INTO transaksi (TransaksiID, UserID, TotalHarga, TotalBayar, Kembalian, MetodeBayar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transaksiID, userID, totalHarga, totalBayar, kembalian, metodeBayar || 'Tunai']
    );

    // Parse items
    const parsedItems = JSON.parse(items);

    for (const item of parsedItems) {
      // Insert detail transaksi
      await conn.query(
        `INSERT INTO detail_transaksi (TransaksiID, MenuID, NamaMenu, Harga, Qty, Subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [transaksiID, item.MenuID, item.NamaMenu, item.Harga, item.Qty, item.Subtotal]
      );

      // Kurangi stok
      const [menuData] = await conn.query('SELECT Stok FROM menu WHERE MenuID = ?', [item.MenuID]);
      const stokLama = menuData[0].Stok;
      const stokBaru = stokLama - item.Qty;

      await conn.query(
        'UPDATE menu SET Stok = ?, Status = ? WHERE MenuID = ?',
        [stokBaru, stokBaru <= 0 ? 'Habis' : 'Tersedia', item.MenuID]
      );

      // Log stok
      await conn.query(
        `INSERT INTO stok_log (MenuID, NamaMenu, StokLama, StokBaru, Keterangan, UserID)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [item.MenuID, item.NamaMenu, stokLama, stokBaru, `Terjual via transaksi ${transaksiID}`, userID]
      );
    }

    await conn.commit();
    res.json({ success: true, transaksiID, kembalian });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.json({ success: false, message: err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
