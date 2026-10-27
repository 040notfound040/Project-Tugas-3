/**
 * SITTA UT - Komponen Formulir Pemesanan Delivery Order (DO)
 * Memenuhi Indikator:
 * 1. Vue Component & Template
 * 2. Data Binding (One-way v-bind, Two-way v-model)
 * 3. Computed Property (subtotal, ongkos kirim, total biaya, status validitas form)
 * 4. Methods Property (submitPesanan, tambahSatuan, resetForm)
 * 5. Watchers (Watcher form.nim, Watcher form.paketKode, Watcher form.upbjj)
 * 6. v-for Array (zero-based index) dan Object (name-based index)
 * 7. Formatting data via Filter (rupiah)
 * 8. Form input & validasi input komprehensif
 */
Vue.component('form-pemesanan', {
    props: {
        stokList: {
            type: Array,
            required: true
        },
        paketList: {
            type: Array,
            required: true
        },
        pengirimanList: {
            type: Array,
            required: true
        },
        upbjjList: {
            type: Array,
            required: true
        },
        cart: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            tipePemesanan: 'paket', // 'paket' atau 'satuan'
            form: {
                nim: '',
                nama: '',
                upbjj: 'Jakarta',
                paketKode: 'PAKET-UT-001',
                pengirimanKode: 'REG',
                ekspedisi: 'JNE Express',
                alamat: '',
                catatan: ''
            },
            ekspedisiList: ['JNE Express', 'POS Indonesia', 'SiCepat'],
            selectedSatuanKode: '',
            selectedSatuanQty: 1,
            errors: {
                nim: '',
                nama: '',
                upbjj: '',
                alamat: '',
                items: ''
            },
            watcherFeedbackPaket: '',
            watcherFeedbackNIM: '',
            isSubmitting: false,
            submitSuccess: false,
            lastOrderDO: ''
        };
    },
    watch: {
        // Watcher 1: Memantau Perubahan Input NIM Mahasiswa
        // Berfungsi untuk auto-cleansing format hanya angka & memvalidasi panjang 9 digit NIM UT
        'form.nim': function (newVal, oldVal) {
            // Bersihkan karakter non-angka
            const cleanVal = newVal.replace(/[^0-9]/g, '');
            if (cleanVal !== newVal) {
                this.form.nim = cleanVal;
            }

            if (!cleanVal) {
                this.errors.nim = 'NIM wajib diisi.';
                this.watcherFeedbackNIM = '';
            } else if (cleanVal.length < 9) {
                this.errors.nim = 'NIM mahasiswa UT harus 9 digit angka (saat ini: ' + cleanVal.length + ' digit).';
                this.watcherFeedbackNIM = 'Menunggu kelengkapan 9 digit...';
            } else if (cleanVal.length > 9) {
                this.form.nim = cleanVal.slice(0, 9);
                this.errors.nim = '';
                this.watcherFeedbackNIM = 'NIM valid (9 digit).';
            } else {
                this.errors.nim = '';
                this.watcherFeedbackNIM = 'NIM valid (Format Terverifikasi UT).';
            }
        },

        // Watcher 2: Memantau Perubahan Pilihan Paket Bahan Ajar
        // Berfungsi otomatis memuat rincian paket, menghitung modul terkait, dan memverifikasi ketersediaan
        'form.paketKode': function (newVal) {
            const pkt = this.paketList.find(p => p.kode === newVal);
            if (pkt) {
                const bukuJudul = pkt.isi.map(kode => {
                    const b = this.stokList.find(s => s.kode === kode);
                    return b ? b.judul + ' (' + kode + ')' : kode;
                }).join(', ');
                this.watcherFeedbackPaket = 'Paket terpilih: "' + pkt.nama + '" berisi modul: ' + bukuJudul;
            } else {
                this.watcherFeedbackPaket = '';
            }
        },

        // Watcher 3: Memantau Perubahan Sentra UPBJJ
        // Berfungsi memverifikasi ketersediaan stok buku paket di UPBJJ tujuan
        'form.upbjj': function (newUpbjj) {
            if (this.tipePemesanan === 'paket' && this.selectedPaketDetail) {
                const outOfStock = this.selectedPaketDetail.isi.filter(kode => {
                    const item = this.stokList.find(s => s.kode === kode && s.upbjj === newUpbjj);
                    return !item || item.qty === 0;
                });
                if (outOfStock.length > 0) {
                    this.errors.items = 'Perhatian: Ada modul paket yang stoknya habis di UPBJJ ' + newUpbjj + ': ' + outOfStock.join(', ');
                } else {
                    this.errors.items = '';
                }
            }
        }
    },
    computed: {
        // Computed: Mendapatkan Objek Rincian Paket yang Dipilih
        selectedPaketDetail: function () {
            return this.paketList.find(p => p.kode === this.form.paketKode) || null;
        },

        // Computed: Mendapatkan Daftar Objek Buku yang Termasuk dalam Paket
        paketModules: function () {
            if (!this.selectedPaketDetail) return [];
            return this.selectedPaketDetail.isi.map(kode => {
                const modul = this.stokList.find(s => s.kode === kode);
                return modul || { kode: kode, judul: 'Modul ' + kode, harga: 0, qty: 0 };
            });
        },

        // Computed: Menghitung Biaya Pengiriman Berdasarkan Opsi Terpilih
        biayaPengiriman: function () {
            const pengiriman = this.pengirimanList.find(p => p.kode === this.form.pengirimanKode);
            if (pengiriman && pengiriman.tarif) {
                return pengiriman.tarif;
            }
            return this.form.pengirimanKode === 'EXP' ? 30000 : 15000;
        },

        // Computed: Menghitung Subtotal Biaya Bahan Ajar (Paket atau Keranjang Satuan)
        subtotalBahanAjar: function () {
            if (this.tipePemesanan === 'paket') {
                return this.selectedPaketDetail ? this.selectedPaketDetail.harga : 0;
            } else {
                return this.cart.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
            }
        },

        // Computed: Menghitung Total Biaya Akhir (Subtotal + Biaya Kirim)
        totalBiaya: function () {
            return this.subtotalBahanAjar + this.biayaPengiriman;
        },

        // Computed: Menghasilkan Rincian Ringkasan dalam Bentuk Object Key-Value
        // (Digunakan untuk mendemonstrasikan Name-based index iteration v-for)
        ringkasanKeyValue: function () {
            return {
                "Nama Mahasiswa": this.form.nama || "-",
                "Nomor Induk (NIM)": this.form.nim || "-",
                "Sentra UPBJJ": "UPBJJ UT " + this.form.upbjj,
                "Jenis Layanan": this.tipePemesanan === 'paket' ? "Paket Bahan Ajar Semester" : "Bahan Ajar Lepas/Satuan",
                "Metode Pengiriman": (this.form.pengirimanKode === 'EXP' ? 'Ekspres (1-2 hari)' : 'Reguler (3-5 hari)') + ' via ' + this.form.ekspedisi,
                "Alamat Penerima": this.form.alamat || "-"
            };
        },

        // Computed: Memeriksa Kelayakan Validitas Formulir
        isFormValid: function () {
            const hasValidNIM = this.form.nim && this.form.nim.length === 9;
            const hasValidNama = this.form.nama && this.form.nama.trim().length >= 3;
            const hasValidAlamat = this.form.alamat && this.form.alamat.trim().length >= 10;
            const hasValidItems = this.tipePemesanan === 'paket' 
                ? !!this.selectedPaketDetail 
                : this.cart.length > 0;

            return hasValidNIM && hasValidNama && hasValidAlamat && hasValidItems && !this.errors.items;
        }
    },
    methods: {
        // Method: Menambah Bahan Ajar Lepas ke Keranjang
        tambahItemSatuan: function () {
            if (!this.selectedSatuanKode) return;
            const item = this.stokList.find(s => s.kode === this.selectedSatuanKode);
            if (!item) return;

            if (item.qty < this.selectedSatuanQty) {
                alert('Stok tidak mencukupi! Tersedia hanya ' + item.qty + ' eksemplar.');
                return;
            }

            this.$emit('tambah-item-keranjang', {
                item: item,
                jumlah: this.selectedSatuanQty
            });

            this.selectedSatuanKode = '';
            this.selectedSatuanQty = 1;
        },

        // Method: Hapus Item dari Keranjang
        hapusItemKeranjang: function (index) {
            this.$emit('hapus-item-keranjang', index);
        },

        // Method: Validasi Manual & Submit Pesanan Delivery Order
        submitPesanan: function () {
            // Validasi Input Sederhana
            this.errors = { nim: '', nama: '', upbjj: '', alamat: '', items: '' };

            if (!this.form.nim || this.form.nim.length !== 9) {
                this.errors.nim = 'NIM mahasiswa UT wajib 9 digit angka.';
            }
            if (!this.form.nama || this.form.nama.trim().length < 3) {
                this.errors.nama = 'Nama lengkap mahasiswa wajib diisi (minimal 3 karakter).';
            }
            if (!this.form.alamat || this.form.alamat.trim().length < 10) {
                this.errors.alamat = 'Alamat pengiriman lengkap wajib diisi (minimal 10 karakter).';
            }
            if (this.tipePemesanan === 'satuan' && this.cart.length === 0) {
                this.errors.items = 'Keranjang pemesanan satuan masih kosong! Silakan pilih modul terlebih dahulu.';
            }

            // Jika ada error, batalkan submit
            if (this.errors.nim || this.errors.nama || this.errors.alamat || this.errors.items) {
                return;
            }

            this.isSubmitting = true;

            // Simulasi proses pengolahan pesanan DO SITTA
            setTimeout(() => {
                // Generate Nomor DO Unik (Contoh: DO2025-0003)
                const randomNum = Math.floor(1000 + Math.random() * 9000);
                const doNumber = 'DO2025-' + randomNum;

                const tanggalHariIni = new Date().toISOString().split('T')[0];
                const jamSekarang = new Date().toLocaleTimeString('id-ID');

                // Siapkan Objek Pesanan DO Baru
                const pesananBaru = {
                    doNumber: doNumber,
                    data: {
                        nim: this.form.nim,
                        nama: this.form.nama,
                        status: 'Dalam Perjalanan',
                        ekspedisi: this.form.ekspedisi,
                        tanggalKirim: tanggalHariIni,
                        paket: this.tipePemesanan === 'paket' ? this.form.paketKode : 'MODUL-SATUAN',
                        total: this.totalBiaya,
                        upbjj: this.form.upbjj,
                        alamat: this.form.alamat,
                        catatan: this.form.catatan || 'Pesanan bahan ajar mandiri via portal SITTA UT',
                        perjalanan: [
                            {
                                waktu: tanggalHariIni + ' ' + jamSekarang,
                                keterangan: 'Penerimaan Order & Verifikasi Pembayaran di SITTA UT UPBJJ ' + this.form.upbjj
                            },
                            {
                                waktu: tanggalHariIni + ' ' + jamSekarang,
                                keterangan: 'Pengemasan bahan ajar di Gudang Sentra UT'
                            }
                        ]
                    }
                };

                // Emit event ke Root App untuk simpan pesanan & potong stok
                this.$emit('submit-pesanan', pesananBaru);

                this.isSubmitting = false;
                this.submitSuccess = true;
                this.lastOrderDO = doNumber;

                // Reset form
                this.resetForm();
            }, 600);
        },

        // Method: Reset Nilai Form
        resetForm: function () {
            this.form.nim = '';
            this.form.nama = '';
            this.form.alamat = '';
            this.form.catatan = '';
            this.errors = { nim: '', nama: '', upbjj: '', alamat: '', items: '' };
            this.watcherFeedbackNIM = '';
        }
    },
    template: `
    <div class="space-y-6">

        <!-- Header Form Pemesanan -->
        <div class="pb-2 border-b border-slate-200 dark:border-slate-800">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <span>Formulir Pemesanan Bahan Ajar (Delivery Order SITTA)</span>
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Layanan pemesanan tiras paket semester dan modul mata kuliah mandiri Universitas Terbuka secara terintegrasi.
            </p>
        </div>

        <!-- Banner Sukses Jika Pesanan Baru Saja Dibuat -->
        <div v-if="submitSuccess" class="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start justify-between">
            <div class="flex items-start space-x-3">
                <div class="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-emerald-900 dark:text-emerald-200 text-base">Pesanan Delivery Order Berhasil Diterbitkan!</h3>
                    <p class="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                        Nomor DO Anda: <strong class="font-mono text-sm underline">{{ lastOrderDO }}</strong>. Stok di gudang telah dialokasikan dan status pengiriman dapat dipantau di tab Pelacakan.
                    </p>
                    <button 
                        @click="$emit('lihat-tracking', lastOrderDO)" 
                        class="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition">
                        Lacak Kiriman {{ lastOrderDO }} Sekarang →
                    </button>
                </div>
            </div>
            <button @click="submitSuccess = false" class="text-emerald-600 hover:text-emerald-900 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <!-- Layout 2 Kolom: Form Input (Kiri) & Ringkasan / Live Calculation (Kanan) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <!-- Kolom Kiri: Form Input & Validasi -->
            <div class="lg:col-span-7 space-y-5">
                <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    
                    <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Identitas Mahasiswa & Sentra UT</span>
                    </h2>

                    <!-- Grid Data Mahasiswa: NIM, Nama, UPBJJ -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <!-- Input NIM Mahasiswa dengan Watcher 1 Real-time Feedback -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Nomor Induk Mahasiswa (NIM) <span class="text-rose-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                v-model="form.nim" 
                                maxlength="9"
                                placeholder="Contoh: 042981723"
                                :class="[
                                    'w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition focus:outline-none focus:ring-2',
                                    errors.nim 
                                        ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-rose-400' 
                                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500'
                                ]"
                            />
                            <!-- Pesan Error / Feedback Watcher NIM -->
                            <p v-if="errors.nim" class="text-[11px] text-rose-500 mt-1 font-medium">{{ errors.nim }}</p>
                            <p v-else-if="watcherFeedbackNIM" class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center space-x-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                <span>{{ watcherFeedbackNIM }}</span>
                            </p>
                        </div>

                        <!-- Input Nama Mahasiswa -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Nama Lengkap Mahasiswa <span class="text-rose-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                v-model="form.nama" 
                                placeholder="Nama sesuai kartu mahasiswa UT"
                                :class="[
                                    'w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2',
                                    errors.nama 
                                        ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-rose-400' 
                                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500'
                                ]"
                            />
                            <p v-if="errors.nama" class="text-[11px] text-rose-500 mt-1 font-medium">{{ errors.nama }}</p>
                        </div>

                        <!-- Pilihan Sentra UPBJJ -->
                        <div class="sm:col-span-2">
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Sentra Layanan UT (UPBJJ Asal Distribusi) <span class="text-rose-500">*</span>
                            </label>
                            <select 
                                v-model="form.upbjj"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                <option v-for="u in upbjjList" :key="u" :value="u">UPBJJ Universitas Terbuka {{ u }}</option>
                            </select>
                        </div>

                    </div>

                    <!-- Pilihan Tipe Pemesanan (Paket vs Satuan) -->
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Pilihan Jenis Pemesanan Bahan Ajar:
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <button 
                                type="button"
                                @click="tipePemesanan = 'paket'"
                                :class="[
                                    'p-3 rounded-xl border text-left transition flex items-center space-x-2.5',
                                    tipePemesanan === 'paket' 
                                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 ring-2 ring-blue-500/20' 
                                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                ]">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                <div>
                                    <div class="font-bold text-xs">Paket Hemat Semester</div>
                                    <div class="text-[10px] text-slate-500 dark:text-slate-400">Bundling modul praktis</div>
                                </div>
                            </button>

                            <button 
                                type="button"
                                @click="tipePemesanan = 'satuan'"
                                :class="[
                                    'p-3 rounded-xl border text-left transition flex items-center space-x-2.5',
                                    tipePemesanan === 'satuan' 
                                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 ring-2 ring-blue-500/20' 
                                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                ]">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                <div>
                                    <div class="font-bold text-xs">Modul Lepas / Satuan</div>
                                    <div class="text-[10px] text-slate-500 dark:text-slate-400">Pilih per mata kuliah</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Area Pilihan Paket (Menerapkan v-if="tipePemesanan === 'paket'") -->
                    <div v-if="tipePemesanan === 'paket'" class="space-y-3 pt-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Pilih Paket Bahan Ajar UT:
                        </label>
                        <select 
                            v-model="form.paketKode"
                            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            <option v-for="pkt in paketList" :key="pkt.kode" :value="pkt.kode">
                                {{ pkt.kode }} - {{ pkt.nama }} ({{ pkt.harga | rupiah }})
                            </option>
                        </select>

                        <!-- Feedback dari Watcher Paket Sesuai Kriteria 1.5 -->
                        <div v-if="watcherFeedbackPaket" class="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                            <div class="font-semibold flex items-center gap-1.5">
                                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Informasi Watcher Paket Terpilih:</span>
                            </div>
                            <p class="mt-1 leading-relaxed">{{ watcherFeedbackPaket }}</p>
                        </div>

                        <!-- Daftar Rincian Modul yang Ada di Dalam Paket (v-for zero-based) -->
                        <div class="mt-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Rincian Modul dalam Paket:</span>
                            <div class="space-y-1.5">
                                <div v-for="(m, idx) in paketModules" :key="m.kode" class="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-700/50 last:border-none">
                                    <div class="flex items-center space-x-2">
                                        <span class="font-bold text-slate-400 text-[10px]">{{ idx + 1 }}.</span>
                                        <span class="font-mono text-blue-600 dark:text-blue-400 font-bold">{{ m.kode }}</span>
                                        <span class="text-slate-700 dark:text-slate-300 font-medium">{{ m.judul }}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-slate-500 text-[11px]">{{ m.kategori }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Area Pemesanan Satuan / Keranjang (Menerapkan v-else) -->
                    <div v-else class="space-y-3 pt-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            Pilih Modul & Tambahkan ke Daftar:
                        </label>
                        <div class="flex gap-2">
                            <select 
                                v-model="selectedSatuanKode"
                                class="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs">
                                <option value="">-- Pilih Buku Bahan Ajar --</option>
                                <option v-for="b in stokList" :key="b.kode" :value="b.kode" :disabled="b.qty === 0">
                                    {{ b.kode }} - {{ b.judul }} ({{ b.harga | rupiah }}) {{ b.qty === 0 ? '[HABIS]' : '' }}
                                </option>
                            </select>

                            <input 
                                type="number" 
                                v-model.number="selectedSatuanQty" 
                                min="1" 
                                max="10" 
                                class="w-16 px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-center text-xs font-bold"
                            />

                            <button 
                                type="button" 
                                @click="tambahItemSatuan"
                                :disabled="!selectedSatuanKode"
                                class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-xs font-semibold shadow-sm transition">
                                Tambah
                            </button>
                        </div>

                        <!-- Daftar Item Satuan dalam Keranjang -->
                        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-2">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                                    <tr>
                                        <th class="p-2">Modul</th>
                                        <th class="p-2 text-center">Qty</th>
                                        <th class="p-2 text-right">Subtotal</th>
                                        <th class="p-2 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(c, cIdx) in cart" :key="c.kode" class="border-t border-slate-100 dark:border-slate-800">
                                        <td class="p-2 font-medium">{{ c.judul }} ({{ c.kode }})</td>
                                        <td class="p-2 text-center font-bold">{{ c.jumlah }}</td>
                                        <td class="p-2 text-right font-semibold">{{ (c.harga * c.jumlah) | rupiah }}</td>
                                        <td class="p-2 text-center">
                                            <button @click="hapusItemKeranjang(cIdx)" class="text-rose-500 hover:text-rose-700 font-bold">×</button>
                                        </td>
                                    </tr>
                                    <tr v-if="cart.length === 0">
                                        <td colspan="4" class="p-4 text-center text-slate-400 italic">Belum ada modul yang ditambahkan ke keranjang.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Bagian Pengiriman & Ekspedisi -->
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-xs font-bold">2</span>
                            <span>Pengiriman & Alamat Tujuan</span>
                        </h2>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <!-- Pilihan Layanan Kirim (REG vs EXP) -->
                            <div>
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Kecepatan Pengiriman:
                                </label>
                                <select 
                                    v-model="form.pengirimanKode"
                                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                    <option v-for="p in pengirimanList" :key="p.kode" :value="p.kode">
                                        {{ p.nama }} ({{ (p.tarif || (p.kode === 'EXP' ? 30000 : 15000)) | rupiah }})
                                    </option>
                                </select>
                            </div>

                            <!-- Pilihan Ekspedisi Kurir -->
                            <div>
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Penyedia Ekspedisi Mitra UT:
                                </label>
                                <select 
                                    v-model="form.ekspedisi"
                                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                    <option v-for="eksp in ekspedisiList" :key="eksp" :value="eksp">{{ eksp }}</option>
                                </select>
                            </div>

                            <!-- Alamat Pengiriman Lengkap -->
                            <div class="sm:col-span-2">
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Alamat Penerima Lengkap <span class="text-rose-500">*</span>
                                </label>
                                <textarea 
                                    v-model="form.alamat" 
                                    rows="2"
                                    placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kab, Kode Pos"
                                    :class="[
                                        'w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2',
                                        errors.alamat 
                                            ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-rose-400' 
                                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500'
                                    ]"></textarea>
                                <p v-if="errors.alamat" class="text-[11px] text-rose-500 mt-1 font-medium">{{ errors.alamat }}</p>
                            </div>

                            <!-- Catatan Pengiriman Tambahan -->
                            <div class="sm:col-span-2">
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Catatan Tambahan untuk Petugas Gudang (Opsional):
                                </label>
                                <input 
                                    type="text" 
                                    v-model="form.catatan" 
                                    placeholder="Contoh: Titipkan di pos satpam jika rumah tutup"
                                    class="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <!-- Kolom Kanan: Live Calculation & Ringkasan Pesanan (Name-based Object Iteration) -->
            <div class="lg:col-span-5 space-y-5">
                
                <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-20">
                    
                    <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <span>Ringkasan DO & Biaya</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Realtime
                        </span>
                    </h2>

                    <!-- Implementasi Name-based index / Object Key-Value Iteration Sesuai Indikator 6 -->
                    <div class="space-y-2 text-xs">
                        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verifikasi Informasi DO:</span>
                        
                        <div 
                            v-for="(nilai, namaKunci, index) in ringkasanKeyValue" 
                            :key="namaKunci"
                            class="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                            <span class="text-slate-500 dark:text-slate-400">{{ namaKunci }}:</span>
                            <span class="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate" :title="nilai">{{ nilai }}</span>
                        </div>
                    </div>

                    <!-- Rincian Biaya (Kalkulasi Otomatis Computed Property) -->
                    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div class="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Subtotal Bahan Ajar:</span>
                            <span class="font-semibold">{{ subtotalBahanAjar | rupiah }}</span>
                        </div>
                        <div class="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Ongkos Kirim ({{ form.pengirimanKode }}):</span>
                            <span class="font-semibold">{{ biayaPengiriman | rupiah }}</span>
                        </div>
                        <div class="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                            <span class="font-bold text-slate-900 dark:text-white">Total Tagihan DO:</span>
                            <span class="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                                {{ totalBiaya | rupiah }}
                            </span>
                        </div>
                    </div>

                    <!-- Tombol Eksekusi Submit Pesanan DO -->
                    <div class="pt-2">
                        <button 
                            type="button"
                            @click="submitPesanan"
                            :disabled="!isFormValid || isSubmitting"
                            :class="[
                                'w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all',
                                isFormValid && !isSubmitting
                                    ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white transform hover:-translate-y-0.5' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            ]">
                            <svg v-if="isSubmitting" class="animate-spin w-4 h-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{{ isSubmitting ? 'Memproses DO...' : 'Terbitkan Delivery Order (DO)' }}</span>
                        </button>
                        
                        <p v-if="!isFormValid" class="text-[11px] text-slate-400 text-center mt-2 italic">
                            Pastikan NIM (9 digit), nama, alamat lengkap, dan bahan ajar terisi dengan benar.
                        </p>
                    </div>

                </div>

            </div>

        </div>

    </div>
    `
});
