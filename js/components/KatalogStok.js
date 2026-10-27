/**
 * SITTA UT - Komponen Katalog & Datatable Stok Bahan Ajar
 * Memenuhi Indikator:
 * 1. Vue Component & Template
 * 2. Menampilkan Data (Mustaches, v-text, v-html)
 * 3. Conditional (v-if, v-else-if, v-else, v-show)
 * 4. Data Binding (v-bind, v-model) & Property (Computed, Methods)
 * 5. Watchers (Watcher searchQuery & filter)
 * 6. v-for zero-based number index
 * 7. Formatting data via Filter (rupiah, uppercase)
 * 8. Mouse (@click, @mouseenter, @mouseleave) & Keyboard (@keyup.enter) event handling
 */
Vue.component('katalog-stok', {
    props: {
        stokList: {
            type: Array,
            required: true
        },
        upbjjList: {
            type: Array,
            required: true
        },
        kategoriList: {
            type: Array,
            required: true
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            searchQuery: '',
            filterKategori: '',
            filterUpbjj: '',
            filterStatus: '',
            sortBy: 'kode',
            sortOrder: 'asc', // 'asc' atau 'desc'
            currentPage: 1,
            perPage: 5,
            perPageOptions: [5, 10, 20],
            showAdvancedFilter: false,
            hoverLokasi: ''
        };
    },
    watch: {
        // Watcher 1: Memantau perubahan input pencarian -> otomatis reset ke halaman 1
        searchQuery: function (newVal, oldVal) {
            this.currentPage = 1;
        },
        // Watcher 2: Memantau filter kategori -> otomatis reset ke halaman 1
        filterKategori: function () {
            this.currentPage = 1;
        },
        // Watcher 3: Memantau filter UPBJJ -> otomatis reset ke halaman 1
        filterUpbjj: function () {
            this.currentPage = 1;
        },
        // Watcher 4: Memantau filter Status Stok -> otomatis reset ke halaman 1
        filterStatus: function () {
            this.currentPage = 1;
        }
    },
    computed: {
        // Computed Property: Memfilter dan Mengurutkan Stok Bahan Ajar
        filteredStok: function () {
            let result = [...this.stokList];

            // 1. Pencarian Teks (Kode, Judul, Lokasi Rak)
            if (this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase().trim();
                result = result.filter(item => 
                    item.kode.toLowerCase().includes(q) ||
                    item.judul.toLowerCase().includes(q) ||
                    item.lokasiRak.toLowerCase().includes(q)
                );
            }

            // 2. Filter Kategori
            if (this.filterKategori !== '') {
                result = result.filter(item => item.kategori === this.filterKategori);
            }

            // 3. Filter UPBJJ
            if (this.filterUpbjj !== '') {
                result = result.filter(item => item.upbjj === this.filterUpbjj);
            }

            // 4. Filter Status Ketersediaan
            if (this.filterStatus === 'aman') {
                result = result.filter(item => item.qty >= item.safety);
            } else if (this.filterStatus === 'kritis') {
                result = result.filter(item => item.qty > 0 && item.qty < item.safety);
            } else if (this.filterStatus === 'habis') {
                result = result.filter(item => item.qty === 0);
            }

            // 5. Sorting Multi-Kolom
            result.sort((a, b) => {
                let valA = a[this.sortBy];
                let valB = b[this.sortBy];

                if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
                return 0;
            });

            return result;
        },

        // Computed Property: Menghitung Total Halaman untuk Datatable
        totalPages: function () {
            return Math.ceil(this.filteredStok.length / this.perPage) || 1;
        },

        // Computed Property: Slice data untuk halaman aktif (Pagination)
        paginatedStok: function () {
            const start = (this.currentPage - 1) * this.perPage;
            return this.filteredStok.slice(start, start + this.perPage);
        },

        // Computed Property: Index awal baris aktif
        startIndex: function () {
            if (this.filteredStok.length === 0) return 0;
            return (this.currentPage - 1) * this.perPage + 1;
        },

        // Computed Property: Index akhir baris aktif
        endIndex: function () {
            const end = this.currentPage * this.perPage;
            return end > this.filteredStok.length ? this.filteredStok.length : end;
        }
    },
    methods: {
        // Method: Mengatur Kolom & Arah Sorting
        changeSort: function (col) {
            if (this.sortBy === col) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortBy = col;
                this.sortOrder = 'asc';
            }
        },

        // Method: Pindah Halaman Pagination
        goToPage: function (page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },

        // Method: Reset Semua Filter
        resetFilter: function () {
            this.searchQuery = '';
            this.filterKategori = '';
            this.filterUpbjj = '';
            this.filterStatus = '';
            this.currentPage = 1;
        },

        // Method: Menambah Bahan Ajar ke Keranjang Pemesanan
        pesanModul: function (item) {
            this.$emit('tambah-ke-pesanan', item);
        },

        // Method: Membuka Modal Detail Buku
        lihatDetail: function (item) {
            this.$emit('lihat-detail', item);
        },

        // Method: Keyboard handler Enter pada search
        handleEnterSearch: function () {
            if (this.paginatedStok.length === 1) {
                this.lihatDetail(this.paginatedStok[0]);
            }
        }
    },
    template: `
    <div class="space-y-6">
        
        <!-- Header Judul & Deskripsi -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <!-- SVG Icon Buku/Gudang -->
                    <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span>Katalog & Persediaan Bahan Ajar SITTA</span>
                </h1>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Kelola ketersediaan tiras bahan ajar, pantau batas safety stock, dan lokasi rak penyimpanan di gudang UT.
                </p>
            </div>

            <!-- Tombol Toggle Filter Lanjutan & Reset -->
            <div class="flex items-center space-x-2">
                <button 
                    @click="showAdvancedFilter = !showAdvancedFilter"
                    class="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 transition">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    <span>Filter Lanjutan</span>
                    <span v-if="filterKategori || filterUpbjj || filterStatus" class="w-2 h-2 rounded-full bg-blue-600"></span>
                </button>

                <button 
                    v-if="searchQuery || filterKategori || filterUpbjj || filterStatus"
                    @click="resetFilter"
                    class="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition">
                    Reset Filter
                </button>
            </div>
        </div>

        <!-- Panel Filter & Search Bar Datatable -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
            
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <!-- Search Input dengan Keyboard Handler (@keyup.enter) -->
                <div class="md:col-span-6 relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        v-model="searchQuery"
                        @keyup.enter="handleEnterSearch"
                        placeholder="Cari kode modul, judul buku, atau rak (Tekan Enter)..."
                        class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                </div>

                <!-- Dropdown Kategori -->
                <div class="md:col-span-3">
                    <select 
                        v-model="filterKategori"
                        class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option value="">Semua Kategori MK</option>
                        <option v-for="kat in kategoriList" :key="kat" :value="kat">{{ kat }}</option>
                    </select>
                </div>

                <!-- Dropdown UPBJJ -->
                <div class="md:col-span-3">
                    <select 
                        v-model="filterUpbjj"
                        class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option value="">Semua Sentra UPBJJ</option>
                        <option v-for="u in upbjjList" :key="u" :value="u">UPBJJ {{ u }}</option>
                    </select>
                </div>
            </div>

            <!-- Panel Filter Lanjutan (Menerapkan v-show) -->
            <div v-show="showAdvancedFilter" class="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status Ketersediaan Stok:</label>
                    <select 
                        v-model="filterStatus"
                        class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                        <option value="">Semua Status Stok</option>
                        <option value="aman">Stok Aman (Di atas Safety)</option>
                        <option value="kritis">Stok Kritis (Di bawah Safety)</option>
                        <option value="habis">Stok Habis (0)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Jumlah Baris Per Halaman:</label>
                    <select 
                        v-model.number="perPage"
                        class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100">
                        <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }} baris per halaman</option>
                    </select>
                </div>

                <div class="flex items-end">
                    <p class="text-xs text-slate-500 dark:text-slate-400 italic">
                        Tips: Klik judul kolom tabel untuk mengurutkan (Sort A-Z / Nilai Tertinggi).
                    </p>
                </div>
            </div>

        </div>

        <!-- Notifikasi Hover Lokasi Rak Gudang (Event Mouseenter/Mouseleave) -->
        <div v-if="hoverLokasi" class="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center space-x-2 animate-pulse">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Lokasi Rak Terfokus: <strong>{{ hoverLokasi }}</strong> (Gudang Sentra SITTA UT)</span>
        </div>

        <!-- Datatable Card Modern -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            
            <!-- Lazy Loading Skeleton State (Menerapkan v-if="isLoading") -->
            <div v-if="isLoading" class="p-6 space-y-4">
                <div class="h-6 skeleton-box rounded-md w-1/3"></div>
                <div class="space-y-3">
                    <div v-for="n in 4" :key="n" class="h-12 skeleton-box rounded-lg w-full"></div>
                </div>
            </div>

            <!-- Tabel Data Utama (Menerapkan v-else) -->
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <!-- Table Head dengan Sortable Header -->
                    <thead class="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th class="px-4 py-3.5 w-12 text-center">No</th>
                            
                            <!-- Kolom Kode Modul (Sortable) -->
                            <th @click="changeSort('kode')" class="px-4 py-3.5 cursor-pointer hover:text-blue-600 select-none">
                                <div class="flex items-center space-x-1">
                                    <span>Kode Modul</span>
                                    <svg class="w-3.5 h-3.5" :class="sortBy === 'kode' ? 'text-blue-600 font-bold' : 'text-slate-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path v-if="sortBy === 'kode' && sortOrder === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                </div>
                            </th>

                            <!-- Kolom Judul & Kategori (Sortable) -->
                            <th @click="changeSort('judul')" class="px-4 py-3.5 cursor-pointer hover:text-blue-600 select-none">
                                <div class="flex items-center space-x-1">
                                    <span>Judul Bahan Ajar</span>
                                    <svg class="w-3.5 h-3.5" :class="sortBy === 'judul' ? 'text-blue-600 font-bold' : 'text-slate-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path v-if="sortBy === 'judul' && sortOrder === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                </div>
                            </th>

                            <!-- Kolom UPBJJ & Lokasi Rak -->
                            <th class="px-4 py-3.5">Sentra / Rak</th>

                            <!-- Kolom Harga (Sortable) -->
                            <th @click="changeSort('harga')" class="px-4 py-3.5 cursor-pointer hover:text-blue-600 select-none text-right">
                                <div class="flex items-center justify-end space-x-1">
                                    <span>Harga</span>
                                    <svg class="w-3.5 h-3.5" :class="sortBy === 'harga' ? 'text-blue-600 font-bold' : 'text-slate-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path v-if="sortBy === 'harga' && sortOrder === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                </div>
                            </th>

                            <!-- Kolom Stok & Status (Sortable) -->
                            <th @click="changeSort('qty')" class="px-4 py-3.5 cursor-pointer hover:text-blue-600 select-none text-center">
                                <div class="flex items-center justify-center space-x-1">
                                    <span>Stok / Safety</span>
                                    <svg class="w-3.5 h-3.5" :class="sortBy === 'qty' ? 'text-blue-600 font-bold' : 'text-slate-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path v-if="sortBy === 'qty' && sortOrder === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                </div>
                            </th>

                            <!-- Kolom Catatan Khusus (v-html) -->
                            <th class="px-4 py-3.5">Catatan Edisi</th>

                            <!-- Kolom Aksi -->
                            <th class="px-4 py-3.5 text-right w-36">Aksi</th>
                        </tr>
                    </thead>

                    <!-- Table Body: Zero-based Array Iteration (v-for="(item, index) in paginatedStok") -->
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr 
                            v-for="(item, index) in paginatedStok" 
                            :key="item.kode"
                            @mouseenter="hoverLokasi = item.lokasiRak"
                            @mouseleave="hoverLokasi = ''"
                            class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                            
                            <!-- Nomor Urut Dinamis (Zero-based calculation) -->
                            <td class="px-4 py-3.5 text-center text-xs font-semibold text-slate-400">
                                {{ (currentPage - 1) * perPage + index + 1 }}
                            </td>

                            <!-- Kode Modul (Menerapkan Filter 'uppercase') -->
                            <td class="px-4 py-3.5 whitespace-nowrap">
                                <span class="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    {{ item.kode | uppercase }}
                                </span>
                            </td>

                            <!-- Judul & Kategori -->
                            <td class="px-4 py-3.5">
                                <div class="font-semibold text-slate-900 dark:text-white leading-snug">
                                    {{ item.judul }}
                                </div>
                                <div class="mt-0.5">
                                    <span class="inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        {{ item.kategori }}
                                    </span>
                                </div>
                            </td>

                            <!-- Sentra UPBJJ & Rak Gudang -->
                            <td class="px-4 py-3.5 whitespace-nowrap">
                                <div class="text-xs font-medium text-slate-800 dark:text-slate-200">
                                    UPBJJ {{ item.upbjj }}
                                </div>
                                <div class="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                    <span>Rak: <strong>{{ item.lokasiRak }}</strong></span>
                                </div>
                            </td>

                            <!-- Harga (Menerapkan Filter 'rupiah') -->
                            <td class="px-4 py-3.5 whitespace-nowrap text-right font-semibold text-slate-900 dark:text-white">
                                {{ item.harga | rupiah }}
                            </td>

                            <!-- Stok & Conditional Status (v-if, v-else-if, v-else) -->
                            <td class="px-4 py-3.5 whitespace-nowrap text-center">
                                <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {{ item.qty }} eks
                                </div>
                                <div class="text-[10px] text-slate-400 mb-1">
                                    Safety: {{ item.safety }}
                                </div>

                                <!-- Pengandaian Status Stok Sesuai Kriteria 1.3 -->
                                <span 
                                    v-if="item.qty === 0" 
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                    Habis
                                </span>
                                <span 
                                    v-else-if="item.qty < item.safety" 
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                                    Menipis (Reorder)
                                </span>
                                <span 
                                    v-else 
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    Stok Aman
                                </span>
                            </td>

                            <!-- Catatan Khusus dengan Directive v-html Sesuai Indikator 2 -->
                            <td class="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                                <div v-html="item.catatanHTML" class="leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60"></div>
                            </td>

                            <!-- Tombol Aksi: Pesan & Detail -->
                            <td class="px-4 py-3.5 whitespace-nowrap text-right space-x-1.5">
                                <button 
                                    @click="lihatDetail(item)"
                                    class="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                    title="Lihat Detail Modul">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                
                                <button 
                                    @click="pesanModul(item)"
                                    :disabled="item.qty === 0"
                                    :class="[
                                        'px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition shadow-sm',
                                        item.qty > 0 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    ]"
                                    :title="item.qty > 0 ? 'Pesan Bahan Ajar Ini' : 'Stok Kosong'">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    <span>Pesan</span>
                                </button>
                            </td>

                        </tr>

                        <!-- Empty State Jika Tidak Ada Hasil Filter (Menerapkan v-if="paginatedStok.length === 0") -->
                        <tr v-if="paginatedStok.length === 0">
                            <td colspan="8" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                <div class="max-w-xs mx-auto space-y-2">
                                    <svg class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p class="font-medium text-slate-700 dark:text-slate-300">Data bahan ajar tidak ditemukan</p>
                                    <p class="text-xs">Silakan periksa kembali kata kunci pencarian atau sesuaikan filter UPBJJ dan Kategori.</p>
                                    <button @click="resetFilter" class="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 underline">Reset Pencarian</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Footer Datatable: Counter & Pagination Controls (Menerapkan v-text) -->
            <div class="px-4 py-3.5 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                
                <!-- Counter Status Teks Menggunakan v-text Sesuai Indikator 2 -->
                <div class="text-slate-500 dark:text-slate-400">
                    <span v-text="'Menampilkan ' + startIndex + ' sampai ' + endIndex + ' dari total ' + filteredStok.length + ' modul bahan ajar'"></span>
                </div>

                <!-- Pagination Buttons -->
                <div class="flex items-center space-x-1">
                    <!-- Tombol Prev -->
                    <button 
                        @click="goToPage(currentPage - 1)"
                        :disabled="currentPage === 1"
                        class="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                        Sebelumnya
                    </button>

                    <!-- Tombol Halaman Number -->
                    <div class="flex items-center space-x-1">
                        <button 
                            v-for="p in totalPages" 
                            :key="p"
                            @click="goToPage(p)"
                            :class="[
                                'w-8 h-8 rounded-lg font-semibold text-xs transition',
                                currentPage === p 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            ]">
                            {{ p }}
                        </button>
                    </div>

                    <!-- Tombol Next -->
                    <button 
                        @click="goToPage(currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                        Selanjutnya
                    </button>
                </div>
            </div>

        </div>

    </div>
    `
});
