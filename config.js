// config.js
module.exports = {
    INTERVAL_MENIT: 2,

    // Tambahkan blok KREDENSIAL ini:
    KREDENSIAL: {
        USERNAME: 'NIK_atau_Id_Kamu', // NIK kamu
        PASSWORD: 'Password_Kamu'     // Password DIGIT kamu
    },

    URLS: {
        HOME: 'https://digipaysatu.kemenkeu.go.id/shop',
        NEGO: 'https://digipaysatu.kemenkeu.go.id/shop/nego',
        PENGECEKAN: 'https://digipaysatu.kemenkeu.go.id/transaksi/pengecekan',
        PENGIRIMAN: 'https://digipaysatu.kemenkeu.go.id/transaksi/pengiriman'
    },

    DATA_FORM: {
        CATATAN_PENGECEKAN: 'Pesanan sesuai dan siap dikirim',
        METODE_KIRIM: 'Kurir Sendiri', 
        NAMA_KURIR: 'Nama_Kurir_Kamu',     
        CATATAN_KIRIM: 'Segera meluncur'
    },

    SELECTORS: {
        TOMBOL_NEGO_KUNING: '.btn-warning:has-text("Nego")',
        TOMBOL_SETUJU_NEGO: 'button:has-text("Setuju"), a:has-text("Setuju")',
        TOMBOL_KONFIRMASI_OK: 'button:has-text("OK"), .swal2-confirm'
    }
};