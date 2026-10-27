/**
 * SITTA UT - Komponen Navbar (AppNavbar)
 * Menerapkan konsep Vue Component, event handling mouse (@click),
 * two-way status visual, dan integrasi SVG icons.
 */
Vue.component('app-navbar', {
    props: {
        activeTab: {
            type: String,
            required: true
        },
        cartCount: {
            type: Number,
            default: 0
        },
        stokKritisCount: {
            type: Number,
            default: 0
        },
        isDarkMode: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isMobileMenuOpen: false
        };
    },
    methods: {
        setTab(tabId) {
            this.$emit('switch-tab', tabId);
            this.isMobileMenuOpen = false;
        },
        toggleDarkMode() {
            this.$emit('toggle-dark-mode');
        }
    },
    template: `
    <header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                
                <!-- Brand / Logo SITTA UT -->
                <div class="flex items-center space-x-3 cursor-pointer" @click="setTab('katalog')">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-md text-white">
                        <!-- SVG Logo UT SITTA Buku & Topi Akademik -->
                        <svg class="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            <path d="M9 7h6"></path>
                            <path d="M9 11h6"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="flex items-center space-x-1.5">
                            <span class="font-extrabold text-lg tracking-tight text-blue-900 dark:text-blue-400">SITTA</span>
                            <span class="font-semibold text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700">UT</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Sistem Informasi Tiras & Transaksi Bahan Ajar</p>
                    </div>
                </div>

                <!-- Navigasi Desktop (SPA Tabs) -->
                <nav class="hidden md:flex items-center space-x-1">
                    <!-- Tab 1: Katalog & Stok -->
                    <button 
                        @click="setTab('katalog')"
                        :class="[
                            'px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
                            activeTab === 'katalog' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        ]">
                        <!-- SVG Icon Datatable / Rak Buku -->
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                        </svg>
                        <span>Katalog & Stok</span>
                        <span v-if="stokKritisCount > 0" class="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-white font-bold" title="Stok Perlu Reorder">
                            {{ stokKritisCount }}
                        </span>
                    </button>

                    <!-- Tab 2: Formulir Pemesanan DO -->
                    <button 
                        @click="setTab('pemesanan')"
                        :class="[
                            'px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 relative',
                            activeTab === 'pemesanan' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        ]">
                        <!-- SVG Icon Shopping Cart / DO Order -->
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        <span>Form Pemesanan</span>
                        <span v-if="cartCount > 0" class="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-600 text-white font-bold">
                            {{ cartCount }}
                        </span>
                    </button>

                    <!-- Tab 3: Pelacakan DO (Tracking) -->
                    <button 
                        @click="setTab('tracking')"
                        :class="[
                            'px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
                            activeTab === 'tracking' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        ]">
                        <!-- SVG Icon Truck Tracking -->
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4l3 3v5a1 1 0 01-1 1h-1"></path>
                        </svg>
                        <span>Lacak Pengiriman</span>
                    </button>

                    <!-- Tab 4: Dashboard & Statistik -->
                    <button 
                        @click="setTab('dashboard')"
                        :class="[
                            'px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
                            activeTab === 'dashboard' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold shadow-sm' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        ]">
                        <!-- SVG Icon Chart -->
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span>Statistik</span>
                    </button>
                </nav>

                <!-- Tombol Aksi Kanan: Mode Gelap & Info UT -->
                <div class="flex items-center space-x-2">
                    <!-- Tombol Toggle Dark/Light Mode -->
                    <button 
                        @click="toggleDarkMode" 
                        class="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        :title="isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'">
                        <!-- SVG Sun (muncul jika mode gelap) -->
                        <svg v-if="isDarkMode" class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <!-- SVG Moon (muncul jika mode terang) -->
                        <svg v-else class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </button>

                    <!-- Tombol Hamburger Mobile -->
                    <button 
                        @click="isMobileMenuOpen = !isMobileMenuOpen"
                        class="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Menu Dropdown Mobile -->
            <div v-show="isMobileMenuOpen" class="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <button 
                    @click="setTab('katalog')"
                    :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between', activeTab === 'katalog' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-200']">
                    <span>Katalog & Stok Bahan Ajar</span>
                    <span v-if="stokKritisCount > 0" class="text-xs bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">{{ stokKritisCount }}</span>
                </button>
                <button 
                    @click="setTab('pemesanan')"
                    :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between', activeTab === 'pemesanan' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-200']">
                    <span>Formulir Pemesanan DO</span>
                    <span v-if="cartCount > 0" class="text-xs bg-white text-blue-700 px-2 py-0.5 rounded-full font-bold">{{ cartCount }}</span>
                </button>
                <button 
                    @click="setTab('tracking')"
                    :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-medium', activeTab === 'tracking' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-200']">
                    Lacak Pengiriman DO
                </button>
                <button 
                    @click="setTab('dashboard')"
                    :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-medium', activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-200']">
                    Statistik & Rekapitulasi
                </button>
            </div>
        </div>
    </header>
    `
});
