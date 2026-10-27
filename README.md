# SITTA UT — Sistem Informasi Tiras dan Transaksi Bahan Ajar<Br>
### Tugas Praktik 3 (STSI4209 Pemrograman Berbasis Web)<Br>
**Program Studi S1 Sistem Informasi - Universitas Terbuka**<Br>
LAPORAN TUGAS 3 TUTORIAL ONLINE MATA KULIAH PEMROGRAMAN BERBASIS WEB STSI4209<Br>
DISUSUN OLEH<Br>
NAMA	: FADLILLAH<Br>
NIM	: 051908447<Br>
---

## 📌 Ringkasan Proyek
Aplikasi **SITTA UT** adalah sistem antarmuka berbasis web *Single Page Application* (SPA) yang dirancang untuk mengelola proses katalogisasi, pemesanan, dan pelacakan distribusi bahan ajar (modul perkuliahan) di lingkungan Universitas Terbuka (UT).

Proyek ini dibangun menggunakan **Framework Vue.js** (CDN) dengan styling modern dan clean menggunakan **Tailwind CSS**, tanpa ketergantungan *build tools* yang rumit, sehingga dapat dijalankan secara instan di browser.

---

## 🌟 Fitur Utama & Pemenuhan Indikator Tugas

| No | Indikator Penilaian | Implementasi Fitur pada Aplikasi SITTA UT |
|:--:|---|---|
| **1** | **Arsitektur & Komponen Modular** | Pemisahan kode menjadi komponen-komponen mandiri (`app-navbar`, `katalog-stok`, `form-pemesanan`, `tracking-do`, `modal-detail`, `dashboard-stats`). |
| **2** | **Menampilkan Data** | Penggunaan mustaches `{{ }}`, directive `v-text` (counter status baris tabel), dan directive `v-html` (merender `catatanHTML` seperti `<em>`, `<strong>`, `<u>`, `<i>`). |
| **3** | **Conditional Rendering** | Directive `v-if`, `v-else-if`, `v-else` untuk status ketersediaan stok (*Aman, Menipis/Reorder, Habis*) dan status pelacakan DO (*Terkirim, Dalam Perjalanan*). Serta directive `v-show` untuk membuka/tutup panel filter lanjutan. |
| **4** | **Data Binding & Property** | One-way data binding (`v-bind` / `:`), Two-way data binding (`v-model`), Computed properties (`filteredStok`, `paginatedStok`, `totalBiaya`, `isFormValid`), dan Methods. |
| **5** | **Watchers (Minimal 2 Watcher)** | - **Watcher 1 (`searchQuery`)**: Otomatis mereset pagination ke halaman 1 saat pencarian diubah.<br>- **Watcher 2 (`form.nim`)**: Otomatis membersihkan karakter non-angka dan memvalidasi panjang 9 digit NIM UT.<br>- **Watcher 3 (`form.paketKode`)**: Otomatis memuat modul dalam paket dan memeriksa ketersediaan stok di UPBJJ.<br>- **Watcher 4 (`isDarkMode`)**: Sinkronisasi tema light/dark ke `localStorage`. |
| **6** | **Pengolahan Array & Object (`v-for`)** | - **Zero-based number index**: Baris datatable dengan nomor urut dinamis `(currentPage - 1) * perPage + index + 1`, kartu paket, dan timeline pengiriman.<br>- **Name-based index (Object Key-Value)**: Perulangan object tracking berdasarkan nomor DO (`v-for="(val, key) in filteredTrackingObject"`) dan ringkasan DO (`v-for="(nilai, namaKunci) in ringkasanKeyValue"`). |
| **7** | **Formatting Teks via Filter** | Filter `rupiah` (`Rp 120.000`), filter `formatTanggal` (`25 Agustus 2025`), filter `uppercase` (`EKMA4116`), dan filter `truncate`. |
| **8** | **Interaksi & Validasi Input** | - **Mouse Event**: `@click` (navigasi, sorting header, cetak DO), `@mouseenter` & `@mouseleave` (sorot lokasi rak gudang).<br>- **Keyboard Event**: `@keyup.enter` (pencarian instan), `@keydown.esc` (tutup modal pop-up).<br>- **Validasi Form**: Pengecekan NIM 9 digit angka, nama lengkap, UPBJJ, dan ketersediaan stok fisik gudang. |

---

## 📁 Struktur Direktori Proyek

```text
Project Tugas 3/
├── index.html                      # File utama Single Page Application (SPA)
├── dataBahanAjar.json              # File dataset tiruan resmi SITTA UT
├── README.md                       # Dokumentasi gambaran umum proyek
├── PANDUAN_VIDEO_DAN_LAPORAN.md    # Naskah skrip narasi & panduan rekaman video
├── css/
│   └── style.css                   # Gaya kustom, efek shimmer skeleton, timeline & print style
└── js/
    ├── app.js                      # Inisialisasi Root Vue Instance & State Management
    ├── dataFallback.js             # Dataset cadangan offline & perlindungan CORS
    ├── filters.js                  # Filter formatting teks (rupiah, formatTanggal, uppercase)
    └── components/
        ├── Navbar.js               # Komponen header navigasi & toggle tema
        ├── KatalogStok.js          # Komponen Datatable stok bahan ajar
        ├── FormPemesanan.js        # Komponen formulir penerbitan Delivery Order
        ├── TrackingDO.js           # Komponen pelacakan status pengiriman DO
        ├── ModalDetail.js          # Komponen modal detail bahan ajar & surat jalan DO
        └── DashboardStats.js       # Komponen statistik eksekutif pergudangan tiras
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini bersifat *client-side* murni berbasis CDN, sehingga sangat fleksibel:

### Cara 1: Langsung Buka di Browser (Paling Praktis)
1. Buka folder proyek di File Explorer.
2. Klik dua kali (**Double-click**) file [index.html](file:///index.html).
3. Aplikasi akan langsung berjalan di browser Anda dengan proteksi fallback data otomatis.

### Cara 2: Menggunakan Live Server / Local Web Server
1. Buka terminal pada folder proyek ini.
2. Jalankan perintah server lokal (contoh dengan Python):
   ```bash
   python -m http.server 8080
   ```
3. Buka browser dan akses alamat:
   ```text
   http://localhost:8080/index.html
   ```

---

## 🎨 Penyesuaian Khusus yang Diterapkan
- **Ikon**: Hanya menggunakan **inline SVG** yang ringan, tajam, dan tidak memerlukan pustaka ikon eksternal yang berat.
- **Single Page Application (SPA)**: Pergantian antar menu (Katalog, Pemesanan, Tracking, Statistik) terjadi mulus tanpa memuat ulang (*reload*) halaman.
- **Tampilan Modern & Responsif**: Palet warna resmi biru dongker khas Universitas Terbuka dengan sentuhan modern Tailwind CSS, rapi baik di layar *smartphone*, tablet, maupun desktop monitor.
- **Datatable Interaktif**: Pencarian multi-kolom, filter dropdown kategori & UPBJJ, sortir kolom ascending/descending, pilihan jumlah baris per halaman, serta indikator pagination.
- **Dukungan Light & Dark Mode**: Dilengkapi tombol pengalih tema terang dan gelap yang tersimpan di memori peramban (*localStorage*).
