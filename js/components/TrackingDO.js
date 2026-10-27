/**
 * SITTA UT - Komponen Pelacakan Pengiriman (Tracking Delivery Order)
 * Memenuhi Indikator:
 * 1. Vue Component & Template
 * 2. Menampilkan Data (Mustaches, v-text)
 * 3. Conditional Rendering (v-if, v-else-if, v-else)
 * 4. Data Binding & Property (v-model, computed, methods)
 * 5. Watchers (Watcher searchDO otomatis uppercase & verifikasi prefix DO)
 * 6. v-for: Name-based index (Object Key-Value iteration) & Zero-based index (Timeline)
 * 7. Formatting data via Filter (rupiah, formatTanggal, uppercase)
 * 8. Mouse & Keyboard handling (@keyup.enter, @click)
 */
Vue.component('tracking-do', {
    props: {
        trackingList: {
            type: Array,
            required: true
        },
        selectedDoNumber: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            searchDO: '',
            activeDONumber: '',
            filterStatus: '',
            watcherSearchLog: ''
        };
    },
    watch: {
        // Watcher 1: Memantau Input Nomor DO untuk Auto-Formatting & Realtime Matching
        searchDO: function (newVal) {
            if (newVal) {
                // Otomatis ubah menjadi huruf kapital (Contoh: do2025 -> DO2025)
                const upper = newVal.toUpperCase().trim();
                if (upper !== newVal) {
                    this.searchDO = upper;
                }

                // Cek apakah ada nomor DO yang cocok di sistem
                if (this.normalizedTrackingObject[upper]) {
                    this.activeDONumber = upper;
                    this.watcherSearchLog = 'Nomor ' + upper + ' ditemukan dalam basis data SITTA UT!';
                } else {
                    this.watcherSearchLog = 'Mencari pengiriman dengan nomor: ' + upper;
                }
            } else {
                this.watcherSearchLog = '';
            }
        },
        // Watcher 2: Sinkronisasi jika ada prop selectedDoNumber yang dikirim dari form/notifikasi
        selectedDoNumber: {
            immediate: true,
            handler: function (newVal) {
                if (newVal) {
                    this.activeDONumber = newVal;
                    this.searchDO = newVal;
                }
            }
        }
    },
    computed: {
        // Computed: Menormalkan struktur data tracking dari array of objects [{"DO...": {...}}]
        // Menjadi satu Object terpadu { "DO2025-0001": {...}, "DO2025-0002": {...} }
        // Untuk penerapan Name-based index iteration (v-for="(val, key) in obj")
        normalizedTrackingObject: function () {
            const obj = {};
            this.trackingList.forEach((entry, idx) => {
                // Entry bisa berbentuk { "DO2025-0001": { ... } } atau { doNumber: "...", data: { ... } }
                if (entry.doNumber && entry.data) {
                    obj[entry.doNumber] = entry.data;
                } else {
                    for (let key in entry) {
                        // Jika ada duplikasi nomor di dummy asli, berikan suffix agar tetap terbaca rapi
                        let finalKey = key;
                        if (obj[finalKey] && idx > 0) {
                            finalKey = key + '-B';
                        }
                        obj[finalKey] = entry[key];
                    }
                }
            });
            return obj;
        },

        // Computed: Filter Object Pengiriman DO berdasarkan Status (Best Practice v-for Object)
        filteredTrackingObject: function () {
            const result = {};
            for (let doKey in this.normalizedTrackingObject) {
                const item = this.normalizedTrackingObject[doKey];
                if (!this.filterStatus || (item && item.status === this.filterStatus)) {
                    result[doKey] = item;
                }
            }
            return result;
        },

        // Computed: Data Pengiriman DO yang sedang aktif ditampilkan
        activeTrackingData: function () {
            if (this.activeDONumber && this.normalizedTrackingObject[this.activeDONumber]) {
                return this.normalizedTrackingObject[this.activeDONumber];
            }
            // Default pilih entri pertama jika belum ada yang dipilih
            const firstKey = Object.keys(this.normalizedTrackingObject)[0];
            if (firstKey) {
                this.activeDONumber = firstKey;
                return this.normalizedTrackingObject[firstKey];
            }
            return null;
        }
    },
    methods: {
        // Method: Memilih nomor DO yang ingin ditampilkan
        pilihDO: function (doNumber) {
            this.activeDONumber = doNumber;
            this.searchDO = doNumber;
        },

        // Method: Manual Trigger via tombol atau keyboard Enter (@keyup.enter)
        cariDOManual: function () {
            const q = this.searchDO.trim().toUpperCase();
            if (this.normalizedTrackingObject[q]) {
                this.activeDONumber = q;
            } else {
                alert('Nomor Delivery Order (DO) "' + q + '" tidak ditemukan dalam arsip pengiriman.');
            }
        },

        // Method: Cetak Surat Jalan / Bukti DO
        cetakDO: function () {
            this.$emit('buka-cetak-do', {
                doNumber: this.activeDONumber,
                data: this.activeTrackingData
            });
        }
    },
    template: `
    <div class="space-y-6">

        <!-- Header Pelacakan DO -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4l3 3v5a1 1 0 01-1 1h-1"></path>
                    </svg>
                    <span>Pelacakan Distribusi & Delivery Order (DO)</span>
                </h1>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Pantau posisi fisik kiriman bahan ajar UT secara realtime mulai dari sentra pengolahan hingga tiba di alamat mahasiswa.
                </p>
            </div>

            <div class="flex items-center space-x-2" v-if="activeTrackingData">
                <button 
                    @click="cetakDO" 
                    class="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 shadow-sm transition">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    <span>Cetak Bukti DO</span>
                </button>
            </div>
        </div>

        <!-- Kolom Pencarian Nomor DO & Watcher Realtime Feedback -->
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex-1 relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        v-model="searchDO"
                        @keyup.enter="cariDOManual"
                        placeholder="Ketik Nomor DO (Contoh: DO2025-0001) dan tekan Enter..."
                        class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                <button 
                    @click="cariDOManual" 
                    class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition">
                    Lacak Kiriman
                </button>
            </div>

            <!-- Pesan Feedback Watcher Search -->
            <div v-if="watcherSearchLog" class="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{{ watcherSearchLog }}</span>
            </div>
        </div>

        <!-- Grid Layout: Daftar Nomor DO (Name-Based Iteration) di Kiri & Timeline Perjalanan di Kanan -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <!-- Kolom Kiri: Daftar Resi / DO Aktif Menggunakan Name-Based Object v-for -->
            <div class="lg:col-span-4 space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Daftar Pengiriman DO:
                    </span>
                    <select 
                        v-model="filterStatus"
                        class="text-[11px] px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <option value="">Semua Status</option>
                        <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                        <option value="Terkirim">Terkirim</option>
                    </select>
                </div>

                <!-- Penerapan Name-based index (Object Key-Value Iteration) Sesuai Indikator 6:
                     v-for="(itemData, doKey, index) in filteredTrackingObject" -->
                <div class="space-y-2">
                    <div 
                        v-for="(itemData, doKey, index) in filteredTrackingObject" 
                        :key="doKey"
                        @click="pilihDO(doKey)"
                        :class="[
                            'p-3.5 rounded-2xl border cursor-pointer transition-all',
                            activeDONumber === doKey 
                                ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-500' 
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        ]">
                        
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="font-mono font-bold text-xs text-blue-700 dark:text-blue-300">
                                {{ doKey | uppercase }}
                            </span>
                            
                            <!-- Conditional Status Badge (v-if / v-else-if / v-else) -->
                            <span 
                                v-if="itemData.status === 'Terkirim'" 
                                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Terkirim
                            </span>
                            <span 
                                v-else-if="itemData.status === 'Dalam Perjalanan'" 
                                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 animate-pulse">
                                Dalam Perjalanan
                            </span>
                            <span 
                                v-else 
                                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                {{ itemData.status }}
                            </span>
                        </div>

                        <div class="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {{ itemData.nama }}
                        </div>
                        <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span>NIM: {{ itemData.nim }}</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-300">{{ itemData.total | rupiah }}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                            <span>{{ itemData.ekspedisi }}</span>
                            <span>{{ itemData.tanggalKirim | formatTanggal }}</span>
                        </div>

                    </div>

                    <div v-if="Object.keys(filteredTrackingObject).length === 0" class="p-6 text-center text-xs text-slate-400 italic bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        Tidak ada pengiriman DO dengan status tersebut.
                    </div>
                </div>

            </div>

            <!-- Kolom Kanan: Rincian Lengkap & Timeline Perjalanan (Zero-based Array Iteration) -->
            <div class="lg:col-span-8 space-y-5">
                
                <div v-if="activeTrackingData" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
                    
                    <!-- Header Rincian DO Terpilih -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="font-mono text-lg font-extrabold text-blue-900 dark:text-blue-300">
                                    {{ activeDONumber | uppercase }}
                                </span>
                                <!-- Status Badge Pengiriman -->
                                <span 
                                    v-if="activeTrackingData.status === 'Terkirim'" 
                                    class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    Terkirim / Selesai
                                </span>
                                <span 
                                    v-else-if="activeTrackingData.status === 'Dalam Perjalanan'" 
                                    class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                                    Sedang Dikirim
                                </span>
                                <span 
                                    v-else 
                                    class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                    {{ activeTrackingData.status }}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Ekspedisi: <strong>{{ activeTrackingData.ekspedisi }}</strong> • Tanggal Mulai: {{ activeTrackingData.tanggalKirim | formatTanggal }}
                            </p>
                        </div>

                        <div class="text-right">
                            <span class="text-xs text-slate-400 block">Total Biaya Pemesanan:</span>
                            <span class="text-base font-extrabold text-blue-700 dark:text-blue-400">
                                {{ activeTrackingData.total | rupiah }}
                            </span>
                        </div>
                    </div>

                    <!-- Informasi Penerima & Paket -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Identitas Mahasiswa:</span>
                            <div class="font-bold text-slate-900 dark:text-white text-sm">{{ activeTrackingData.nama }}</div>
                            <div class="text-slate-600 dark:text-slate-300 mt-0.5">NIM: <span class="font-mono font-semibold">{{ activeTrackingData.nim }}</span></div>
                            <div class="text-slate-500 dark:text-slate-400 mt-0.5" v-if="activeTrackingData.upbjj">Sentra: UPBJJ {{ activeTrackingData.upbjj }}</div>
                        </div>

                        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Bahan Ajar yang Dipesan:</span>
                            <div class="font-bold text-blue-700 dark:text-blue-400 text-sm font-mono">{{ activeTrackingData.paket }}</div>
                            <div class="text-slate-600 dark:text-slate-300 mt-0.5" v-if="activeTrackingData.alamat">
                                Alamat: <span class="font-normal">{{ activeTrackingData.alamat }}</span>
                            </div>
                            <div class="text-[11px] text-slate-400 mt-0.5" v-if="activeTrackingData.catatan">
                                Catatan: <em>{{ activeTrackingData.catatan }}</em>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Riwayat Perjalanan Pengiriman (v-for Zero-Based Number Index) -->
                    <div class="space-y-4 pt-2">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Riwayat Perjalanan Ekspedisi Bahan Ajar (Timeline):</span>
                        </h3>

                        <!-- Zero-based array iteration: v-for="(langkah, idx) in activeTrackingData.perjalanan" -->
                        <div class="relative pl-2 space-y-6">
                            <div 
                                v-for="(langkah, idx) in activeTrackingData.perjalanan" 
                                :key="idx"
                                class="timeline-item relative flex items-start space-x-4">
                                
                                <!-- Icon Pin / Titik Timeline -->
                                <div :class="[
                                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm font-bold text-xs',
                                    idx === activeTrackingData.perjalanan.length - 1
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50' 
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                ]">
                                    {{ idx + 1 }}
                                </div>

                                <!-- Konten Langkah Timeline -->
                                <div class="flex-1 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                                    <div class="flex items-center justify-between text-xs mb-1">
                                        <span class="font-bold text-slate-900 dark:text-white">
                                            {{ langkah.keterangan }}
                                        </span>
                                        <span class="font-mono text-[11px] text-slate-400 font-medium">
                                            {{ langkah.waktu }}
                                        </span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                                        Status tercatat secara otomatis oleh sistem pertukaran data SITTA UT ekspedisi {{ activeTrackingData.ekspedisi }}.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                <!-- Empty State jika Tidak Ada Data Tracking -->
                <div v-else class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
                    <p class="font-semibold text-slate-700 dark:text-slate-300">Belum ada Delivery Order yang dipilih</p>
                    <p class="text-xs mt-1">Pilih salah satu nomor DO dari daftar di sebelah kiri atau ketikkan nomor DO pada kolom pencarian.</p>
                </div>

            </div>

        </div>

    </div>
    `
});
