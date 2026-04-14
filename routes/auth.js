const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// GET /login
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/kasir');
    res.render('pages/login', { title: 'Login - NoBuRi POS' });
});

// POST /login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // --- LOGIKA BYPASS SEMENTARA (Hapus setelah berhasil perbaiki user) ---
        if (username === 'admin' && password === 'noburi123') {
            const [rows] = await db.query(
                'SELECT u.*, r.NamaRole FROM user u JOIN role r ON u.RoleID = r.RoleID WHERE u.Username = ?',
                ['admin']
            );
            if (rows.length > 0) {
                const user = rows[0];
                req.session.user = {
                    UserID: user.UserID,
                    NamaUser: user.NamaUser,
                    Username: user.Username,
                    RoleID: user.RoleID,
                    NamaRole: user.NamaRole
                };
                req.flash('success', 'Bypass Berhasil! Segera perbarui user di Manajemen User.');
                return res.redirect('/kasir');
            }
        }
        // --- END BYPASS ---

        const [rows] = await db.query(
            'SELECT u.*, r.NamaRole FROM user u JOIN role r ON u.RoleID = r.RoleID WHERE u.Username = ?',
            [username]
        );

        if (rows.length === 0) {
            req.flash('error', 'Username tidak ditemukan');
            return res.redirect('/login');
        }

        const user = rows[0];
        
        // Debugging: Munculkan di console untuk memastikan data yang diambil benar
        console.log('Memverifikasi user:', user.Username);

        const match = await bcrypt.compare(password, user.Password);
        if (!match) {
            req.flash('error', 'Password salah');
            return res.redirect('/login');
        }

        req.session.user = {
            UserID: user.UserID,
            NamaUser: user.NamaUser,
            Username: user.Username,
            RoleID: user.RoleID,
            NamaRole: user.NamaRole
        };

        req.flash('success', `Selamat datang, ${user.NamaUser}!`);
        res.redirect('/kasir');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Terjadi kesalahan server');
        res.redirect('/login');
    }
});

// GET /logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;