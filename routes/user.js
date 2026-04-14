const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

const isAdmin = (req, res, next) => {
  if (req.session.user.RoleID !== 'Admin' && req.session.user.RoleID !== 'Owner') {
    req.flash('error', 'Akses ditolak. Hanya Admin/Owner.');
    return res.redirect('/kasir');
  }
  next();
};

// GET /user
router.get('/', isAdmin, async (req, res) => {
  const [users] = await db.query(
    'SELECT u.*, r.NamaRole FROM user u JOIN role r ON u.RoleID = r.RoleID ORDER BY u.CreatedAt DESC'
  );
  const [roles] = await db.query('SELECT * FROM role');
  res.render('pages/user', { title: 'Manajemen User - NoBuRi POS', users, roles });
});

// POST /user/tambah
router.post('/tambah', isAdmin, async (req, res) => {
  const { NamaUser, Username, Password, RoleID } = req.body;
  try {
    const [last] = await db.query("SELECT UserID FROM user ORDER BY UserID DESC LIMIT 1");
    let newNum = 1;
    if (last.length > 0) newNum = parseInt(last[0].UserID.split('-')[1]) + 1;
    const userID = 'USR-' + String(newNum).padStart(3, '0');
    const hash = await bcrypt.hash(Password, 10);
    await db.query(
      'INSERT INTO user (UserID, NamaUser, Username, Password, RoleID) VALUES (?, ?, ?, ?, ?)',
      [userID, NamaUser, Username, hash, RoleID]
    );
    req.flash('success', `User "${NamaUser}" berhasil ditambahkan`);
  } catch (err) {
    req.flash('error', 'Gagal menambah user: ' + (err.code === 'ER_DUP_ENTRY' ? 'Username sudah digunakan' : err.message));
  }
  res.redirect('/user');
});

// DELETE /user/hapus/:id
router.delete('/hapus/:id', isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM user WHERE UserID = ?', [req.params.id]);
    req.flash('success', 'User berhasil dihapus');
  } catch (err) {
    req.flash('error', 'Gagal menghapus user');
  }
  res.redirect('/user');
});

module.exports = router;
