/**
 * SITTA UT - Custom Filters Vue.js
 * Memenuhi Indikator Capaian 7:
 * "Mahasiswa mampu menerapkan formatting data teks menggunakan konsep filter"
 */

// 1. Filter Format Mata Uang Rupiah (Contoh: 120000 -> Rp 120.000)
Vue.filter('rupiah', function (value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'Rp 0';
    }
    const number = Number(value);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
});

// 2. Filter Format Tanggal Bahasa Indonesia (Contoh: "2025-08-25" -> "25 Agustus 2025")
Vue.filter('formatTanggal', function (value) {
    if (!value) return '-';
    try {
        const parts = value.split(' ')[0].split('-');
        if (parts.length === 3) {
            const bulanIndo = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            const tahun = parts[0];
            const bulan = bulanIndo[parseInt(parts[1], 10) - 1] || parts[1];
            const hari = parseInt(parts[2], 10);
            return `${hari} ${bulan} ${tahun}`;
        }
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return d.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return value;
    }
});

// 3. Filter Format Huruf Kapital (Uppercase)
Vue.filter('uppercase', function (value) {
    if (!value) return '';
    return String(value).toUpperCase();
});

// 4. Filter Format Judul / Capitalize (Huruf awal kapital)
Vue.filter('capitalize', function (value) {
    if (!value) return '';
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
});

// 5. Filter Ringkas Deskripsi Teks (Truncate)
Vue.filter('truncate', function (value, limit = 50) {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit) + '...';
});
