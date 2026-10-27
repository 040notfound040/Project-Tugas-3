/**
 * SITTA UT - Komponen Dashboard & Rekapitulasi Statistik
 * Memenuhi Indikator:
 * 1. Vue Component & Template
 * 2. Menampilkan Data (Mustaches, v-text)
 * 3. Conditional Rendering
 * 4. Computed Property & Event Emitting
 */
Vue.component('dashboard-stats', {
    props: {
        stokList: {
            type: Array,
            required: true
        },
        paketList: {
            type: Array,
            required: true
        },
        trackingList: {
            type: Array,
            required: true
        },
        upbjjList: {
            type: Array,
            required: true
        }
    },
    computed: {
        // Total Eksemplar Stok Bahan Ajar di Seluruh Sentra
        totalQtyStok() {
            return this.stokList.reduce((sum, item) => sum + item.qty, 0);
        },
        // Jumlah Modul yang Mendekati atau di Bawah Batas Safety Stock
        modulKritisList() {
            return this.stokList.filter(item => item.qty < item.safety);
        },
        // Total Nilai Aset Bahan Ajar
        totalNilaiAset() {
            return this.stokList.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        }
    },
    methods: {
        goToTab(tabName) {
            this.$emit('switch-tab', tabName);
        }
    },
    template: `
    <div class="space-y-6">

        <!-- Header Dashboard -->
        <div class="pb-2 border-b border-slate-200 dark:border-slate-800">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Dashboard & Rekapitulasi Distribusi SITTA UT</span>
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Ringkasan eksekutif ketersediaan tiras bahan ajar, status pemesanan delivery order, dan pemantauan stok kritis.
            </p>
        </div>

        <!-- 4 Grid Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Card 1: Total Judul Modul -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
                <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                </div>
                <div>
                    <span class="text-xs font-semibold text-slate-400">Total Judul Buku</span>
                    <div class="text-xl font-extrabold text-slate-900 dark:text-white">{{ stokList.length }} Judul</div>
                </div>
            </div>

            <!-- Card 2: Total Stok Eksemplar -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
                <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
                <div>
                    <span class="text-xs font-semibold text-slate-400">Total Fisik Gudang</span>
                    <div class="text-xl font-extrabold text-slate-900 dark:text-white">{{ totalQtyStok }} Eks</div>
                </div>
            </div>

            <!-- Card 3: Stok Kritis Reorder -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
                <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <div>
                    <span class="text-xs font-semibold text-slate-400">Perlu Reorder Segera</span>
                    <div class="text-xl font-extrabold text-amber-600 dark:text-amber-400">{{ modulKritisList.length }} Modul</div>
                </div>
            </div>

            <!-- Card 4: Nilai Total Aset Tiras -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
                <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <div>
                    <span class="text-xs font-semibold text-slate-400">Estimasi Nilai Tiras</span>
                    <div class="text-xl font-extrabold text-slate-900 dark:text-white">{{ totalNilaiAset | rupiah }}</div>
                </div>
            </div>

        </div>

        <!-- Tabel Perhatian Stok Kritis & Aksi Cepat -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Tabel Modul di Bawah Safety Stock -->
            <div class="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h2 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>Daftar Modul Perlu Reorder Tiras (Stok di Bawah Batas Safety)</span>
                    </h2>
                    <span class="text-xs font-semibold text-slate-400">{{ modulKritisList.length }} Modul</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-semibold">
                            <tr>
                                <th class="p-2.5">Kode</th>
                                <th class="p-2.5">Judul Modul</th>
                                <th class="p-2.5">Sentra UPBJJ</th>
                                <th class="p-2.5 text-center">Sisa Stok</th>
                                <th class="p-2.5 text-center">Batas Safety</th>
                                <th class="p-2.5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr v-for="m in modulKritisList" :key="m.kode" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td class="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{{ m.kode }}</td>
                                <td class="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{{ m.judul }}</td>
                                <td class="p-2.5 text-slate-500">UPBJJ {{ m.upbjj }} (Rak: {{ m.lokasiRak }})</td>
                                <td class="p-2.5 text-center font-bold text-rose-600">{{ m.qty }} eks</td>
                                <td class="p-2.5 text-center font-semibold text-slate-400">{{ m.safety }} eks</td>
                                <td class="p-2.5 text-center">
                                    <span v-if="m.qty === 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Habis</span>
                                    <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Menipis</span>
                                </td>
                            </tr>
                            <tr v-if="modulKritisList.length === 0">
                                <td colspan="6" class="p-4 text-center text-emerald-600 font-medium">Seluruh modul bahan ajar berada dalam kondisi aman di atas batas safety stock!</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Shortcut Aksi & Bantuan Alur Sistem -->
            <div class="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Aksi Cepat SITTA UT
                </h2>

                <div class="space-y-2">
                    <button 
                        @click="goToTab('pemesanan')"
                        class="w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900 text-left transition flex items-center justify-between">
                        <div>
                            <div class="font-bold text-xs text-blue-900 dark:text-blue-300">Buat Delivery Order (DO) Baru</div>
                            <div class="text-[11px] text-slate-500">Pemesanan paket semester / buku lepas</div>
                        </div>
                        <span class="text-blue-600 text-sm font-bold">→</span>
                    </button>

                    <button 
                        @click="goToTab('katalog')"
                        class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition flex items-center justify-between">
                        <div>
                            <div class="font-bold text-xs text-slate-900 dark:text-white">Buka Datatable Katalog Stok</div>
                            <div class="text-[11px] text-slate-500">Pencarian, filter UPBJJ, dan sortir data</div>
                        </div>
                        <span class="text-slate-400 text-sm font-bold">→</span>
                    </button>

                    <button 
                        @click="goToTab('tracking')"
                        class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition flex items-center justify-between">
                        <div>
                            <div class="font-bold text-xs text-slate-900 dark:text-white">Lacak Kiriman Bahan Ajar</div>
                            <div class="text-[11px] text-slate-500">Timeline nomor resi dan surat jalan DO</div>
                        </div>
                        <span class="text-slate-400 text-sm font-bold">→</span>
                    </button>
                </div>

                <!-- Info Kontak Sentra Distribusi UT -->
                <div class="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p>Sentra Distribusi Bahan Ajar UT Pondok Cabe, Tangerang Selatan.</p>
                    <p>Hotline SITTA UT: (021) 7490941 ext. 1234</p>
                </div>
            </div>

        </div>

    </div>
    `
});
