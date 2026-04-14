const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /laporan
router.get('/', async (req, res) => {
  try {
    const { dari, sampai } = req.query;
    const tglDari  = dari   || new Date().toISOString().slice(0, 10);
    const tglSampai = sampai || new Date().toISOString().slice(0, 10);

    // Summary hari ini
    const [summaryToday] = await db.query(
      `SELECT 
         COUNT(*) as totalTrx,
         COALESCE(SUM(TotalHarga), 0) as totalPenjualan,
         COALESCE(AVG(TotalHarga), 0) as rataRata
       FROM transaksi 
       WHERE DATE(TanggalTransaksi) = CURDATE() AND Status = 'Selesai'`
    );

    // Transaksi berdasarkan filter tanggal
    const [transaksis] = await db.query(
      `SELECT t.*, u.NamaUser
       FROM transaksi t
       JOIN user u ON t.UserID = u.UserID
       WHERE DATE(t.TanggalTransaksi) BETWEEN ? AND ?
       AND t.Status = 'Selesai'
       ORDER BY t.TanggalTransaksi DESC`,
      [tglDari, tglSampai]
    );

    // Menu terlaris
    const [terlaris] = await db.query(
      `SELECT dt.NamaMenu, SUM(dt.Qty) as totalQty, SUM(dt.Subtotal) as totalPenjualan
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.TransaksiID = t.TransaksiID
       WHERE DATE(t.TanggalTransaksi) BETWEEN ? AND ?
       AND t.Status = 'Selesai'
       GROUP BY dt.MenuID, dt.NamaMenu
       ORDER BY totalQty DESC
       LIMIT 5`,
      [tglDari, tglSampai]
    );

    // Penjualan per hari (7 hari terakhir)
    const [perHari] = await db.query(
      `SELECT DATE(TanggalTransaksi) as tanggal, 
              COUNT(*) as jumlahTrx,
              SUM(TotalHarga) as totalPenjualan
       FROM transaksi
       WHERE TanggalTransaksi >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       AND Status = 'Selesai'
       GROUP BY DATE(TanggalTransaksi)
       ORDER BY tanggal ASC`
    );

    res.render('pages/laporan', {
      title: 'Laporan - NoBuRi POS',
      summaryToday: summaryToday[0],
      transaksis,
      terlaris,
      perHari,
      tglDari,
      tglSampai
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat laporan');
    res.redirect('/kasir');
  }
});

// GET /laporan/detail/:id
router.get('/detail/:id', async (req, res) => {
  try {
    const [trx] = await db.query(
      `SELECT t.*, u.NamaUser FROM transaksi t JOIN user u ON t.UserID = u.UserID WHERE t.TransaksiID = ?`,
      [req.params.id]
    );
    if (trx.length === 0) { req.flash('error', 'Transaksi tidak ditemukan'); return res.redirect('/laporan'); }
    const [details] = await db.query(
      'SELECT * FROM detail_transaksi WHERE TransaksiID = ?',
      [req.params.id]
    );
    res.render('pages/laporan-detail', {
      title: `Detail Transaksi ${req.params.id}`,
      trx: trx[0],
      details
    });
  } catch (err) {
    req.flash('error', 'Gagal memuat detail');
    res.redirect('/laporan');
  }
});

module.exports = router;
