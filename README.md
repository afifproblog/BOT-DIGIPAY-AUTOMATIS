# BOT-DIGIPAY-AUTOMATIS
Welcome to the Digipay Bot repository! This bot is designed to seamlessly integrate digital payment solutions,  
Skrip otomatisasi (RPA) lokal berbasis Node.js dan Playwright untuk memproses pesanan di platform Digipay Satu Kemenkeu secara *Full-Auto*. Bot ini bertindak layaknya manusia 
## ✨ Fitur Utama
- **Auto-Login & Bypass CAPTCHA:** Terintegrasi dengan OCR (Tesseract.js + Jimp) untuk memecahkan CAPTCHA login DIGIT Kemenkeu secara otomatis.
- **Pemulihan Sesi (Anti-RTO):** Otomatis me-*refresh* atau login ulang jika mendeteksi koneksi terputus atau *session timeout* ("Hubungi Administrator").
- **Auto Tahap 1 (Negosiasi):** Otomatis menyetujui harga negosiasi produk dari Satker.
- **Auto Tahap 2 (Pengecekan):** Otomatis mengisi catatan vendor dan menyetujui *invoice* pesanan.
- **Auto Tahap 3 (Pengiriman):** Otomatis membuat No. Resi & Surat Jalan (format `DDMMYY`), serta menaklukkan komponen *dropdown* rumit (Angular `ng-select`) untuk memilih Nama Kurir dan Alamat.
- **Human-Like Behavior:** Pergerakan *mouse*, *scroll*, dan jeda klik (3-7 detik) diacak untuk meniru perilaku manusia dan menghindari pemblokiran sistem.

## 🛠️ Persyaratan Sistem
Karena ini adalah skrip desktop lokal, Anda hanya membutuhkan:
1. Komputer/Laptop dengan OS Windows/Mac/Linux.
2. [Node.js](https://nodejs.org/) terinstal (Versi 18 LTS atau terbaru).
3. npm install jimp tesseract.js
## 🚀 Cara Instalasi
1. Unduh atau *clone* repositori ini ke komputer Anda.
2. Buka folder proyek, lalu klik kanan dan buka Terminal / Command Prompt (`Open in Terminal`).
3. Jalankan perintah berikut untuk menginstal semua pustaka yang dibutuhkan:
   ```bash
   npm install
## Cara Menggunakan BOT
1. Jalankan BOT, dengan file berektensi BAT
