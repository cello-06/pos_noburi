# NoBuRi POS System 🍱

Point of Sale System untuk usaha Rice Burger **NoBuRi** — Bandung.
Dibuat dengan **Node.js + Express + EJS + MySQL**.

---

## 📋 Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org) versi 16+
- [XAMPP](https://www.apachefriends.org) (Apache + MySQL + phpMyAdmin)

---

## 🚀 Cara Instalasi

### 1. Copy folder project
Salin folder `noburi_app` ke direktori pilihan Anda, misalnya:
```
C:\VSCode\noburi_app
```

### 2. Setup Database di phpMyAdmin
1. Buka XAMPP → Start **Apache** dan **MySQL**
2. Buka browser → `http://localhost/phpmyadmin`
3. Klik tab **SQL** di bagian atas
4. Copy seluruh isi file `database.sql`
5. Paste ke kolom SQL → klik **Go**
6. Database `db_noburi` otomatis terbuat beserta semua tabel dan data awal

### 3. Konfigurasi koneksi database
Buka file `db.js`, sesuaikan jika perlu:
```js
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',        // isi jika MySQL Anda pakai password
  database: 'db_noburi',
});
```

### 4. Install dependencies
Buka terminal di folder `noburi_app`, jalankan:
```bash
npm install
```

### 5. Jalankan aplikasi
```bash
# Mode production
npm start

# Mode development (auto-restart saat ada perubahan)
npm run dev
```

### 6. Buka di browser
```
http://localhost:3000
```

---

## 🔑 Akun Default

| Username | Password | Role |
|----------|----------|------|
| `admin` | `noburi123` | Admin |
| `owner` | `noburi123` | Owner |
| `kasir1` | `noburi123` | Kasir |

---

## 📁 Struktur Folder

```
noburi_app/
├── app.js              ← Entry point utama
├── db.js               ← Koneksi database MySQL
├── database.sql        ← Script SQL (import ke phpMyAdmin)
├── package.json
│
├── routes/
│   ├── auth.js         ← Login & logout
│   ├── kasir.js        ← Proses transaksi
│   ├── menu.js         ← CRUD menu & update stok
│   ├── laporan.js      ← Laporan penjualan
│   └── user.js         ← Manajemen user
│
├── views/
│   ├── partial/
│   │   ├── head.ejs    ← HTML head + CSS
│   │   ├── navbar.ejs  ← Sidebar navigasi
│   │   └── flash.ejs   ← Alert flash message
│   └── pages/
│       ├── login.ejs
│       ├── kasir.ejs           ← Halaman kasir utama
│       ├── menu.ejs            ← Daftar menu & stok
│       ├── menu-form.ejs       ← Form tambah/edit menu
│       ├── laporan.ejs         ← Laporan penjualan
│       ├── laporan-detail.ejs  ← Detail transaksi
│       ├── user.ejs            ← Manajemen user
│       └── 404.ejs
│
└── public/
    └── css/
        └── style.css   ← Stylesheet utama
```

---

## ✨ Fitur Aplikasi

### 🛒 Kasir
- Tampil semua menu beserta stok real-time
- Filter menu per kategori (Rice Burger, Minuman, Side Dish)
- Tambah item ke keranjang, atur jumlah
- Hitung kembalian otomatis
- Pilih metode bayar: Tunai / QRIS / Transfer Bank
- Struk transaksi setelah bayar
- Stok otomatis berkurang setelah transaksi

### 🍱 Menu & Stok
- Lihat semua menu dengan status stok (Tersedia / Hampir Habis / Habis)
- Tambah menu baru (Admin/Owner)
- Edit menu (Admin/Owner)
- Hapus menu (Admin/Owner)
- Update stok dengan keterangan/log

### 📊 Laporan Penjualan
- Summary penjualan hari ini
- Filter laporan by rentang tanggal
- Menu terlaris
- Riwayat semua transaksi
- Detail per transaksi

### 👥 Manajemen User (Admin/Owner)
- Daftar semua user
- Tambah user baru dengan role
- Hapus user

---

## 🗃️ Struktur Database

| Tabel | Fungsi |
|-------|--------|
| `role` | Master role (Admin, Kasir, Owner) |
| `user` | Data user/akun |
| `kategori_menu` | Kategori menu makanan |
| `menu` | Data menu & stok |
| `transaksi` | Header transaksi |
| `detail_transaksi` | Detail item per transaksi |
| `stok_log` | Log history perubahan stok |

---

## 🔧 Troubleshooting

**Error: ER_ACCESS_DENIED_ERROR**
→ Cek username/password MySQL di `db.js`

**Error: ER_BAD_DB_ERROR (Unknown database)**
→ Pastikan sudah import `database.sql` ke phpMyAdmin

**Port 3000 sudah dipakai**
→ Ubah port di `app.js`: `const PORT = 3001`

**npm install error**
→ Pastikan Node.js sudah terinstall, cek dengan `node -v`
