/**
 * SITTA UT - Root Application Instance
 * Sistem Informasi Tiras & Transaksi Bahan Ajar Universitas Terbuka
 * Single Page Application (SPA) berbasis Vue.js 2.7
 */

new Vue({
    el: '#app',
    data: {
        // Status Halaman Aktif (SPA Navigation)
        activeTab: 'katalog', // 'katalog' | 'pemesanan' | 'tracking' | 'dashboard'

        // Status Lazy Loading Simulator
        isLoading: true,

        // Status Tema Mode Gelap / Terang (Light Mode by default)
        isDarkMode: false,

        // Sumber Data Utama SITTA UT
        upbjjList: [],
        kategoriList: [],
        pengirimanList: [],
        paketList: [],
        stokList: [],
        trackingList: [],

        // Keranjang Pemesanan Modul Lepas
        cart: [],

        // State Modal Pop-up
        isModalOpen: false,
        modalType: 'buku',
        modalData: null,

        // Nomor DO Terpilih untuk Navigasi Cepat
        selectedDoNumber: '',

        // Notifikasi Toast
        toastMessage: '',
        showToast: false
    },
    watch: {
        // Watcher Tema: Mengatur class 'dark' pada element <html> dan simpan di localStorage
        isDarkMode: function (val) {
            if (val) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('sitta_theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('sitta_theme', 'light');
            }
        }
    },
    computed: {
        // Menghitung Jumlah Modul yang Stoknya di Bawah Batas Safety
        stokKritisCount: function () {
            return this.stokList.filter(item => item.qty < item.safety).length;
        }
    },
    created: function () {
        // 1. Cek Preferensi Tema Tersimpan atau Parameter URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dark') === 'true') {
            this.isDarkMode = true;
            document.documentElement.classList.add('dark');
        } else {
            const savedTheme = localStorage.getItem('sitta_theme');
            if (savedTheme === 'dark') {
                this.isDarkMode = true;
                document.documentElement.classList.add('dark');
            } else {
                this.isDarkMode = false;
                document.documentElement.classList.remove('dark');
            }
        }

        // Cek Parameter Tab URL
        if (urlParams.get('tab')) {
            this.activeTab = urlParams.get('tab');
        }

        // 2. Muat Data Bahan Ajar
        this.fetchDataBahanAjar();

        // 3. Cek Parameter Modal untuk Demonstrasi / Screenshot
        if (urlParams.get('modal') === 'buku') {
            setTimeout(() => {
                if (this.stokList && this.stokList.length > 0) {
                    this.handleLihatDetail(this.stokList[0]);
                }
            }, 600);
        } else if (urlParams.get('modal') === 'do') {
            setTimeout(() => {
                this.handleBukaCetakDO({
                    doNumber: 'DO2025-0001',
                    data: (this.trackingList[0] && this.trackingList[0]['DO2025-0001']) ? this.trackingList[0]['DO2025-0001'] : window.DATA_BAHAN_AJAR_FALLBACK.tracking[0]['DO2025-0001']
                });
            }, 600);
        }
    },
    methods: {
        // Memuat Data dari dataBahanAjar.json dengan Fallback Aman
        fetchDataBahanAjar: function () {
            this.isLoading = true;

            fetch('./dataBahanAjar.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Gagal memuat file dataBahanAjar.json');
                    }
                    return response.json();
                })
                .then(data => {
                    this.applyData(data);
                })
                .catch(err => {
                    console.warn('Menggunakan fallback dataset lokal (CORS/Offline fallback):', err);
                    if (window.DATA_BAHAN_AJAR_FALLBACK) {
                        this.applyData(window.DATA_BAHAN_AJAR_FALLBACK);
                    }
                })
                .finally(() => {
                    // Simulasi efek lazy loading transisi visual selama 350ms
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 350);
                });
        },

        // Menerapkan Data ke State Vue
        applyData: function (data) {
            this.upbjjList = data.upbjjList || [];
            this.kategoriList = data.kategoriList || [];
            this.pengirimanList = data.pengirimanList || [];
            this.paketList = data.paket || [];
            this.stokList = data.stok || [];
            this.trackingList = data.tracking || [];
        },

        // Navigasi Pindah Tab SPA
        switchTab: function (tabId) {
            this.activeTab = tabId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        // Toggle Dark Mode
        toggleDarkMode: function () {
            this.isDarkMode = !this.isDarkMode;
        },

        // Tambah Modul dari Katalog ke Keranjang & Beralih ke Form Pemesanan
        handleTambahKePesanan: function (item) {
            const existing = this.cart.find(c => c.kode === item.kode);
            if (existing) {
                if (existing.jumlah < item.qty) {
                    existing.jumlah++;
                    this.triggerToast('Jumlah pemesanan modul ' + item.kode + ' ditambahkan ke keranjang.');
                } else {
                    alert('Jumlah pemesanan sudah mencapai batas stok maksimal yang tersedia (' + item.qty + ' eks).');
                    return;
                }
            } else {
                this.cart.push({
                    kode: item.kode,
                    judul: item.judul,
                    harga: item.harga,
                    jumlah: 1
                });
                this.triggerToast('Modul ' + item.judul + ' dimasukkan ke keranjang.');
            }

            // Alihkan ke tab form pemesanan
            this.switchTab('pemesanan');
        },

        // Hapus Item dari Keranjang
        handleHapusItemKeranjang: function (index) {
            this.cart.splice(index, 1);
            this.triggerToast('Modul dihapus dari keranjang pemesanan.');
        },

        // Tambah Item Lepas Langsung dari Form Pemesanan
        handleTambahItemKeranjang: function (payload) {
            const { item, jumlah } = payload;
            const existing = this.cart.find(c => c.kode === item.kode);
            if (existing) {
                existing.jumlah += jumlah;
            } else {
                this.cart.push({
                    kode: item.kode,
                    judul: item.judul,
                    harga: item.harga,
                    jumlah: jumlah
                });
            }
            this.triggerToast('Buku ' + item.judul + ' berhasil ditambahkan.');
        },

        // Proses Pembuatan Delivery Order Baru (Submit Pesanan)
        handleSubmitPesanan: function (pesananBaru) {
            // 1. Simpan pesanan ke daftar tracking
            this.trackingList.unshift({
                doNumber: pesananBaru.doNumber,
                data: pesananBaru.data
            });

            // 2. Kurangi stok bahan ajar terkait secara otomatis
            if (pesananBaru.data.paket === 'MODUL-SATUAN') {
                this.cart.forEach(cartItem => {
                    const buku = this.stokList.find(s => s.kode === cartItem.kode);
                    if (buku && buku.qty >= cartItem.jumlah) {
                        buku.qty -= cartItem.jumlah;
                    }
                });
                this.cart = [];
            } else {
                const paket = this.paketList.find(p => p.kode === pesananBaru.data.paket);
                if (paket) {
                    paket.isi.forEach(kodeBuku => {
                        const buku = this.stokList.find(s => s.kode === kodeBuku);
                        if (buku && buku.qty > 0) {
                            buku.qty -= 1;
                        }
                    });
                }
            }

            this.selectedDoNumber = pesananBaru.doNumber;
            this.triggerToast('Delivery Order ' + pesananBaru.doNumber + ' berhasil diterbitkan!');
        },

        // Buka Tab Tracking untuk Nomor DO Tertentu
        handleLihatTracking: function (doNumber) {
            this.selectedDoNumber = doNumber;
            this.switchTab('tracking');
        },

        // Buka Modal Detail Bahan Ajar
        handleLihatDetail: function (item) {
            this.modalType = 'buku';
            this.modalData = item;
            this.isModalOpen = true;
        },

        // Buka Modal Cetak Resi DO
        handleBukaCetakDO: function (payload) {
            this.modalType = 'do';
            this.modalData = payload;
            this.isModalOpen = true;
        },

        // Tutup Modal
        closeModal: function () {
            this.isModalOpen = false;
            this.modalData = null;
        },

        // Menampilkan Notifikasi Toast Sederhana
        triggerToast: function (msg) {
            this.toastMessage = msg;
            this.showToast = true;
            setTimeout(() => {
                this.showToast = false;
            }, 3000);
        }
    }
});
