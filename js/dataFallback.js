/**
 * SITTA UT - Data Fallback
 * Berfungsi sebagai cadangan data jika file dataBahanAjar.json dibuka via file:// protocol (CORS restriction),
 * serta memastikan aplikasi tetap berjalan optimal di segala lingkungan pengujian.
 */
window.DATA_BAHAN_AJAR_FALLBACK = {
    "upbjjList": [
        "Jakarta",
        "Surabaya",
        "Makassar",
        "Padang",
        "Denpasar"
    ],
    "kategoriList": [
        "MK Wajib",
        "MK Pilihan",
        "Praktikum",
        "Problem-Based"
    ],
    "pengirimanList": [
        {
            "kode": "REG",
            "nama": "Reguler (3-5 hari)",
            "tarif": 15000
        },
        {
            "kode": "EXP",
            "nama": "Ekspres (1-2 hari)",
            "tarif": 30000
        }
    ],
    "paket": [
        {
            "kode": "PAKET-UT-001",
            "nama": "PAKET IPS Dasar",
            "isi": [
                "EKMA4116",
                "EKMA4115"
            ],
            "harga": 120000,
            "deskripsi": "Paket hemat bahan ajar Program Studi Manajemen & Akuntansi semester awal."
        },
        {
            "kode": "PAKET-UT-002",
            "nama": "PAKET IPA Dasar",
            "isi": [
                "BIOL4201",
                "FISIP4001"
            ],
            "harga": 140000,
            "deskripsi": "Paket modul praktikum sains dasar dan pengantar ilmu sosial terpadu."
        }
    ],
    "stok": [
        {
            "kode": "EKMA4116",
            "judul": "Pengantar Manajemen",
            "kategori": "MK Wajib",
            "upbjj": "Jakarta",
            "lokasiRak": "R1-A3",
            "harga": 65000,
            "qty": 28,
            "safety": 20,
            "catatanHTML": "<em>Edisi 2024, cetak ulang</em>"
        },
        {
            "kode": "EKMA4115",
            "judul": "Pengantar Akuntansi",
            "kategori": "MK Wajib",
            "upbjj": "Jakarta",
            "lokasiRak": "R1-A4",
            "harga": 60000,
            "qty": 7,
            "safety": 15,
            "catatanHTML": "<strong>Cover baru</strong>"
        },
        {
            "kode": "BIOL4201",
            "judul": "Biologi Umum (Praktikum)",
            "kategori": "Praktikum",
            "upbjj": "Surabaya",
            "lokasiRak": "R3-B2",
            "harga": 80000,
            "qty": 12,
            "safety": 10,
            "catatanHTML": "Butuh <u>pendingin</u> untuk kit basah"
        },
        {
            "kode": "FISIP4001",
            "judul": "Dasar-Dasar Sosiologi",
            "kategori": "MK Pilihan",
            "upbjj": "Makassar",
            "lokasiRak": "R2-C1",
            "harga": 55000,
            "qty": 2,
            "safety": 8,
            "catatanHTML": "Stok <i>menipis</i>, prioritaskan reorder"
        },
        {
            "kode": "MKDU4110",
            "judul": "Bahasa Indonesia",
            "kategori": "MK Wajib",
            "upbjj": "Padang",
            "lokasiRak": "R1-B1",
            "harga": 45000,
            "qty": 35,
            "safety": 15,
            "catatanHTML": "<strong>Materi kurikulum terbaru 2024</strong>"
        },
        {
            "kode": "STSI4209",
            "judul": "Pemrograman Berbasis Web",
            "kategori": "MK Wajib",
            "upbjj": "Denpasar",
            "lokasiRak": "R4-D2",
            "harga": 85000,
            "qty": 18,
            "safety": 10,
            "catatanHTML": "Dilengkapi <u>studi kasus Vue.js</u> dan REST API"
        }
    ],
    "tracking": [
        {
            "DO2025-0001": {
                "nim": "123456789",
                "nama": "Rina Wulandari",
                "status": "Dalam Perjalanan",
                "ekspedisi": "JNE Express",
                "tanggalKirim": "2025-08-25",
                "paket": "PAKET-UT-001",
                "total": 120000,
                "upbjj": "Jakarta",
                "perjalanan": [
                    {
                        "waktu": "2025-08-25 08:30:00",
                        "keterangan": "Pesanan diproses di Sentra Distribusi Bahan Ajar UT Pondok Cabe"
                    },
                    {
                        "waktu": "2025-08-25 10:12:20",
                        "keterangan": "Penerimaan di Loket: TANGSEL"
                    },
                    {
                        "waktu": "2025-08-25 18:45:10",
                        "keterangan": "Diteruskan ke Hub Distribusi Ekspedisi Jakarta Selatan"
                    }
                ]
            }
        },
        {
            "DO2025-0002": {
                "nim": "042981723",
                "nama": "Budi Santoso",
                "status": "Terkirim",
                "ekspedisi": "POS Indonesia",
                "tanggalKirim": "2025-08-22",
                "paket": "PAKET-UT-002",
                "total": 140000,
                "upbjj": "Surabaya",
                "perjalanan": [
                    {
                        "waktu": "2025-08-22 09:15:00",
                        "keterangan": "Penerimaan Paket di Kantor Pos Serpong"
                    },
                    {
                        "waktu": "2025-08-23 14:20:00",
                        "keterangan": "Tiba di Sentra Pengolahan Pos Surabaya"
                    },
                    {
                        "waktu": "2025-08-24 11:05:00",
                        "keterangan": "Terkirim ke alamat tujuan, diterima oleh yang bersangkutan"
                    }
                ]
            }
        }
    ]
};
