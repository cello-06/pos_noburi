const express = require('express');
const router = express.Router();
const db = require('../db');

const isAdminOrOwner = (req, res, next) => {
  const role = req.session.user.RoleID;
  if (role !== 'Admin' && role !== 'Owner') {
    req.flash('error', 'Akses ditolak');
    return res.redirect('/kasir');
  }
  next();
};

// GET /menu - daftar menu & stok
router.get('/', async (req, res) => {
  try {
    const [menus] = await db.query(
      `SELECT m.*, k.NamaKategori 
       FROM menu m 
       JOIN kategori_menu k ON m.KategoriID = k.KategoriID 
       ORDER BY k.NamaKategori, m.NamaMenu`
    );
    const [kategoris] = await db.query('SELECT * FROM kategori_menu ORDER BY NamaKategori');
    res.render('pages/menu', { title: 'Menu & Stok - NoBuRi POS', menus, kategoris });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat data');
    res.redirect('/kasir');
  }
});

// GET /menu/tambah
router.get('/tambah', isAdminOrOwner, async (req, res) => {
  const [kategoris] = await db.query('SELECT * FROM kategori_menu ORDER BY NamaKategori');
  res.render('pages/menu-form', { title: 'Tambah Menu', menu: null, kategoris });
});

// POST /menu/tambah
router.post('/tambah', isAdminOrOwner, async (req, res) => {
  const { NamaMenu, KategoriID, Harga, Stok, Deskripsi } = req.body;
  try {
    const [last] = await db.query("SELECT MenuID FROM menu ORDER BY MenuID DESC LIMIT 1");
    let newNum = 1;
    if (last.length > 0) {
      newNum = parseInt(last[0].MenuID.split('-')[1]) + 1;
    }
    const menuID = 'MNU-' + String(newNum).padStart(3, '0');
    const status = parseInt(Stok) > 0 ? 'Tersedia' : 'Habis';

    await db.query(
      `INSERT INTO menu (MenuID, NamaMenu, KategoriID, Harga, Stok, Deskripsi, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [menuID, NamaMenu, KategoriID, Harga, Stok, Deskripsi, status]
    );
    req.flash('success', `Menu "${NamaMenu}" berhasil ditambahkan`);
    res.redirect('/menu');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menambah menu: ' + err.message);
    res.redirect('/menu/tambah');
  }
});

// GET /menu/edit/:id
router.get('/edit/:id', isAdminOrOwner, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM menu WHERE MenuID = ?', [req.params.id]);
    if (rows.length === 0) { req.flash('error', 'Menu tidak ditemukan'); return res.redirect('/menu'); }
    const [kategoris] = await db.query('SELECT * FROM kategori_menu ORDER BY NamaKategori');
    res.render('pages/menu-form', { title: 'Edit Menu', menu: rows[0], kategoris });
  } catch (err) {
    req.flash('error', 'Gagal memuat data menu');
    res.redirect('/menu');
  }
});

// POST /menu/edit/:id
router.post('/edit/:id', isAdminOrOwner, async (req, res) => {
  const { NamaMenu, KategoriID, Harga, Stok, Deskripsi } = req.body;
  const status = parseInt(Stok) > 0 ? 'Tersedia' : 'Habis';
  try {
    await db.query(
      `UPDATE menu SET NamaMenu=?, KategoriID=?, Harga=?, Stok=?, Deskripsi=?, Status=? WHERE MenuID=?`,
      [NamaMenu, KategoriID, Harga, Stok, Deskripsi, status, req.params.id]
    );
    req.flash('success', `Menu "${NamaMenu}" berhasil diperbarui`);
    res.redirect('/menu');
  } catch (err) {
    req.flash('error', 'Gagal memperbarui menu');
    res.redirect('/menu/edit/' + req.params.id);
  }
});

// POST /menu/update-stok/:id
router.post('/update-stok/:id', async (req, res) => {
  const { stokBaru, keterangan } = req.body;
  const userID = req.session.user.UserID;
  try {
    const [rows] = await db.query('SELECT * FROM menu WHERE MenuID = ?', [req.params.id]);
    if (rows.length === 0) return res.json({ success: false, message: 'Menu tidak ditemukan' });
    const menu = rows[0];
    const status = parseInt(stokBaru) > 0 ? 'Tersedia' : 'Habis';
    await db.query('UPDATE menu SET Stok=?, Status=? WHERE MenuID=?', [stokBaru, status, req.params.id]);
    await db.query(
      `INSERT INTO stok_log (MenuID, NamaMenu, StokLama, StokBaru, Keterangan, UserID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, menu.NamaMenu, menu.Stok, stokBaru, keterangan || 'Update stok manual', userID]
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// DELETE /menu/hapus/:id
router.delete('/hapus/:id', isAdminOrOwner, async (req, res) => {
  try {
    await db.query('DELETE FROM menu WHERE MenuID = ?', [req.params.id]);
    req.flash('success', 'Menu berhasil dihapus');
  } catch (err) {
    req.flash('error', 'Gagal menghapus menu (mungkin sudah digunakan dalam transaksi)');
  }
  res.redirect('/menu');
});

module.exports = router;
