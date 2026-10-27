/**
 * SITTA UT - Komponen Modal Detail & Cetak DO
 * Memenuhi Indikator:
 * 1. Vue Component & Template
 * 2. Menampilkan Data (Mustaches, v-html)
 * 3. Conditional Rendering (v-if / v-else)
 * 4. Keyboard Event Handling (@keydown.esc untuk menutup modal)
 * 5. Formatting Filter (rupiah, formatTanggal, uppercase)
 */
Vue.component('modal-detail', {
    props: {
        isOpen: {
            type: Boolean,
            default: false
        },
        modalType: {
            type: String,
            default: 'buku' // 'buku' atau 'do'
        },
        dataItem: {
            type: Object,
            default: () => null
        }
    },
    mounted() {
        // Event Listener Keyboard Esc Global
        window.addEventListener('keydown', this.handleGlobalKeydown);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleGlobalKeydown);
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        handleGlobalKeydown(e) {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        },
        printInvoice() {
            window.print();
        }
    },
    template: `
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop Blur -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div 
                class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-800"
                @keydown.esc="closeModal">
                
                <!-- Header Modal -->
                <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span v-if="modalType === 'buku'">Detail Bahan Ajar SITTA</span>
                        <span v-else>Surat Jalan / Bukti Pengiriman DO</span>
                    </h3>
                    <button @click="closeModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Konten Modal Tipe BUKU -->
                <div v-if="modalType === 'buku' && dataItem" class="p-5 space-y-4 text-sm">
                    <div class="flex items-start justify-between">
                        <div>
                            <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {{ dataItem.kode | uppercase }}
                            </span>
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white mt-2">{{ dataItem.judul }}</h4>
                            <p class="text-xs text-slate-500">{{ dataItem.kategori }} • UPBJJ {{ dataItem.upbjj }}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-slate-400 block">Harga Resmi:</span>
                            <span class="text-base font-extrabold text-blue-600 dark:text-blue-400">{{ dataItem.harga | rupiah }}</span>
                        </div>
                    </div>

                    <!-- Spesifikasi Rak & Persediaan -->
                    <div class="grid grid-cols-2 gap-3 pt-2">
                        <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            <span class="text-[11px] text-slate-400 uppercase font-bold block">Lokasi Rak Gudang:</span>
                            <span class="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{{ dataItem.lokasiRak }}</span>
                        </div>
                        <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            <span class="text-[11px] text-slate-400 uppercase font-bold block">Stok / Safety Stock:</span>
                            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ dataItem.qty }} / {{ dataItem.safety }} eks</span>
                        </div>
                    </div>

                    <!-- Catatan HTML dari JSON (Menerapkan v-html) -->
                    <div class="pt-2">
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan Kurikulum / Edisi Khusus:</span>
                        <div v-html="dataItem.catatanHTML" class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed"></div>
                    </div>
                </div>

                <!-- Konten Modal Tipe SURAT JALAN DO (PRINTABLE) -->
                <div v-else-if="modalType === 'do' && dataItem" class="p-5 space-y-4 text-xs">
                    
                    <!-- Area Yang Akan Dicetak -->
                    <div id="print-area" class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                        <div class="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                            <div>
                                <h4 class="font-bold text-sm text-blue-900 dark:text-blue-300">UNIVERSITAS TERBUKA</h4>
                                <p class="text-[10px] text-slate-500">Sistem Informasi Tiras & Transaksi Bahan Ajar (SITTA)</p>
                            </div>
                            <div class="text-right">
                                <span class="font-mono font-bold text-xs">{{ dataItem.doNumber }}</span>
                                <p class="text-[10px] text-slate-400">Tgl: {{ dataItem.data.tanggalKirim | formatTanggal }}</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                                <span class="text-slate-400 block">Penerima:</span>
                                <span class="font-bold text-slate-800 dark:text-slate-200">{{ dataItem.data.nama }}</span>
                                <span class="block text-slate-500">NIM: {{ dataItem.data.nim }}</span>
                            </div>
                            <div>
                                <span class="text-slate-400 block">Sentra Distribusi:</span>
                                <span class="font-bold text-slate-800 dark:text-slate-200">UPBJJ UT {{ dataItem.data.upbjj || 'Pusat' }}</span>
                                <span class="block text-slate-500">Kurir: {{ dataItem.data.ekspedisi }}</span>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span class="text-slate-400 block text-[10px]">Rincian Bahan Ajar:</span>
                            <span class="font-bold text-slate-800 dark:text-slate-200">{{ dataItem.data.paket }}</span>
                            <div class="flex justify-between items-center mt-2 font-bold text-xs pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                                <span>Total Biaya:</span>
                                <span class="text-blue-600 dark:text-blue-400">{{ dataItem.data.total | rupiah }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tombol Aksi Print -->
                    <div class="flex justify-end space-x-2 pt-2">
                        <button 
                            @click="printInvoice" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            <span>Cetak Resi DO</span>
                        </button>
                    </div>

                </div>

                <!-- Footer Modal -->
                <div class="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-right">
                    <button 
                        @click="closeModal" 
                        class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition">
                        Tutup (Esc)
                    </button>
                </div>

            </div>
        </div>
    </div>
    `
});
