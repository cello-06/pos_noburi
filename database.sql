-- ============================================
-- NoBuRi POS Database
-- Import file ini di phpMyAdmin
-- ============================================

CREATE DATABASE IF NOT EXISTS db_noburi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_noburi;

-- -----------------------------
-- Tabel: role
-- -----------------------------
CREATE TABLE IF NOT EXISTS `role` (
  `RoleID` varchar(20) NOT NULL PRIMARY KEY,
  `NamaRole` varchar(50) NOT NULL
);

INSERT INTO `role` VALUES
  ('Admin', 'Administrator'),
  ('Kasir', 'Kasir'),
  ('Owner', 'Owner');

-- -----------------------------
-- Tabel: user
-- -----------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `UserID` varchar(15) NOT NULL PRIMARY KEY,
  `NamaUser` varchar(100) NOT NULL,
  `Username` varchar(50) NOT NULL UNIQUE,
  `Password` varchar(255) NOT NULL,
  `RoleID` varchar(20) NOT NULL,
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`RoleID`) REFERENCES `role`(`RoleID`)
);

-- Password default: noburi123 (bcrypt hash)
INSERT INTO `user` VALUES
  ('USR-001', 'Admin NoBuRi', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Admin', NOW()),
  ('USR-002', 'Owner NoBuRi', 'owner', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Owner', NOW()),
  ('USR-003', 'Kasir 1', 'kasir1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Kasir', NOW());

-- -----------------------------
-- Tabel: kategori_menu
-- -----------------------------
CREATE TABLE IF NOT EXISTS `kategori_menu` (
  `KategoriID` varchar(10) NOT NULL PRIMARY KEY,
  `NamaKategori` varchar(50) NOT NULL
);

INSERT INTO `kategori_menu` VALUES
  ('KAT-001', 'Rice Burger'),
  ('KAT-002', 'Minuman'),
  ('KAT-003', 'Side Dish');

-- -----------------------------
-- Tabel: menu
-- -----------------------------
CREATE TABLE IF NOT EXISTS `menu` (
  `MenuID` varchar(15) NOT NULL PRIMARY KEY,
  `NamaMenu` varchar(100) NOT NULL,
  `KategoriID` varchar(10) NOT NULL,
  `Harga` decimal(10,0) NOT NULL,
  `Stok` int(11) NOT NULL DEFAULT 0,
  `Deskripsi` text,
  `Status` enum('Tersedia','Habis') NOT NULL DEFAULT 'Tersedia',
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`KategoriID`) REFERENCES `kategori_menu`(`KategoriID`)
);

INSERT INTO `menu` VALUES
  ('MNU-001', 'Nobu Chicken Delight', 'KAT-001', 24000, 50, 'Rice burger dengan isian chicken nugget dan bakso kepiting, dilengkapi timun, telur, dan saus mayo-cuka. Disajikan dengan nasi crispy dan nori.', 'Tersedia', NOW()),
  ('MNU-002', 'Nobu YakiBeef Spesial', 'KAT-001', 27000, 40, 'Rice burger dengan isian yakiniku beef tumis bawang, saus yakiniku, timun, telur, dan mayonnaise. Disajikan dalam nasi goreng ketan dan nori sebagai pembungkus.', 'Tersedia', NOW()),
  ('MNU-003', 'Es Teh Manis', 'KAT-002', 5000, 100, 'Es teh manis segar', 'Tersedia', NOW()),
  ('MNU-004', 'Air Mineral', 'KAT-002', 3000, 100, 'Air mineral botol 600ml', 'Tersedia', NOW()),
  ('MNU-005', 'Kentang Goreng', 'KAT-003', 10000, 30, 'Kentang goreng crispy', 'Tersedia', NOW());

-- -----------------------------
-- Tabel: transaksi
-- -----------------------------
CREATE TABLE IF NOT EXISTS `transaksi` (
  `TransaksiID` varchar(20) NOT NULL PRIMARY KEY,
  `TanggalTransaksi` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UserID` varchar(15) NOT NULL,
  `TotalHarga` decimal(12,0) NOT NULL,
  `TotalBayar` decimal(12,0) NOT NULL,
  `Kembalian` decimal(12,0) NOT NULL,
  `MetodeBayar` enum('Tunai','QRIS','Transfer') NOT NULL DEFAULT 'Tunai',
  `Status` enum('Selesai','Batal') NOT NULL DEFAULT 'Selesai',
  FOREIGN KEY (`UserID`) REFERENCES `user`(`UserID`)
);

-- -----------------------------
-- Tabel: detail_transaksi
-- -----------------------------
CREATE TABLE IF NOT EXISTS `detail_transaksi` (
  `DetailID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `TransaksiID` varchar(20) NOT NULL,
  `MenuID` varchar(15) NOT NULL,
  `NamaMenu` varchar(100) NOT NULL,
  `Harga` decimal(10,0) NOT NULL,
  `Qty` int(11) NOT NULL,
  `Subtotal` decimal(12,0) NOT NULL,
  FOREIGN KEY (`TransaksiID`) REFERENCES `transaksi`(`TransaksiID`),
  FOREIGN KEY (`MenuID`) REFERENCES `menu`(`MenuID`)
);

-- -----------------------------
-- Tabel: stok_log (history perubahan stok)
-- -----------------------------
CREATE TABLE IF NOT EXISTS `stok_log` (
  `LogID` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `MenuID` varchar(15) NOT NULL,
  `NamaMenu` varchar(100) NOT NULL,
  `StokLama` int(11) NOT NULL,
  `StokBaru` int(11) NOT NULL,
  `Keterangan` varchar(200),
  `UserID` varchar(15) NOT NULL,
  `TanggalLog` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`MenuID`) REFERENCES `menu`(`MenuID`),
  FOREIGN KEY (`UserID`) REFERENCES `user`(`UserID`)
);
