const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// ─── View Engine ───────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Middleware ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'noburi_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 jam
}));

app.use(flash());

// ─── Global variables for views ────────────────────────────
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ─── Auth Middleware ────────────────────────────────────────
const isLogin = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

// ─── Routes ─────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const kasirRoutes    = require('./routes/kasir');
const menuRoutes     = require('./routes/menu');
const laporanRoutes  = require('./routes/laporan');
const userRoutes     = require('./routes/user');

app.use('/', authRoutes);
app.use('/kasir', isLogin, kasirRoutes);
app.use('/menu', isLogin, menuRoutes);
app.use('/laporan', isLogin, laporanRoutes);
app.use('/user', isLogin, userRoutes);

// ─── Root redirect ──────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/kasir');
  res.redirect('/login');
});

// ─── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Halaman Tidak Ditemukan' });
});

// ─── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NoBuRi POS berjalan di http://localhost:${PORT}`);
});
