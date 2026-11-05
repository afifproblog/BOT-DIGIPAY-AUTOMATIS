# 🤖 BOT-DIGIPAY-AUTOMATIS

Skrip otomatisasi (RPA) lokal berbasis Node.js dan Playwright untuk memproses pesanan di platform Digipay Satu Kemenkeu secara *Full-Auto*. Bot ini bertindak layaknya manusia untuk menyelesaikan tahapan pesanan tanpa perlu intervensi manual setiap saat.
<img width="767" height="408" alt="image" src="https://github.com/user-attachments/assets/341ba4fc-41f9-4b99-aab9-7c0d538bfc40" />
<img width="752" height="1002" alt="image" src="https://github.com/user-attachments/assets/d2912837-f8fa-4408-b08e-06fc43e4b739" />
<img width="752" height="992" alt="image" src="https://github.com/user-attachments/assets/d6593c4a-a62c-40d1-bd7e-1556ba85488d" />

## ✨ Fitur Utama
- **Auto-Login & Bypass CAPTCHA:** Terintegrasi dengan OCR (Tesseract.js + Jimp) untuk memecahkan CAPTCHA login DIGIT Kemenkeu secara otomatis.
- **Pemulihan Sesi (Anti-RTO):** Otomatis me-*refresh* atau login ulang jika mendeteksi koneksi terputus atau *session timeout* ("Hubungi Administrator").
- **Auto Tahap 1 (Negosiasi):** Otomatis menyetujui harga negosiasi produk dari Satker.
- **Auto Tahap 2 (Pengecekan):** Otomatis mengisi catatan vendor dan menyetujui *invoice* pesanan.
- **Auto Tahap 3 (Pengiriman):** Otomatis membuat No. Resi & Surat Jalan (format `DDMMYY`), serta menaklukkan komponen *dropdown* rumit (Angular `ng-select`) untuk memilih Nama Kurir dan Alamat.
- **Human-Like Behavior:** Pergerakan *mouse*, *scroll*, dan jeda klik (3-7 detik) diacak untuk meniru perilaku manusia dan menghindari pemblokiran sistem.

---

## 🛠️ Persiapan Awal (Prasyarat)
Karena bot ini berjalan di komputer Anda sendiri, pastikan Anda sudah menyiapkan hal berikut:

1. **Komputer/Laptop:** Berjalan di Windows (disarankan), Mac, atau Linux.
2. **Koneksi Internet:** Pastikan stabil agar proses tidak terputus di tengah jalan.
3. **Node.js (Wajib):** Ini adalah mesin utama untuk menjalankan skrip. 
   - Unduh dan instal Node.js versi terbaru (LTS) dari [Situs Resmi Node.js](https://nodejs.org/). 
   - (NPM sudah otomatis terinstal saat Anda menginstal Node.js).
   - npm install jimp tesseract.js

4. **Teks Editor:** Seperti Notepad (bawaan Windows) atau [Visual Studio Code](https://code.visualstudio.com/) untuk mengedit file pengaturan.

---

## 🚀 Cara Instalasi

Ikuti langkah-langkah ini **hanya untuk pertama kali** Anda memasang bot:

1. **Unduh File Bot:** Unduh repositori ini (berupa file `.zip`) dan ekstrak (unzip) ke dalam satu folder khusus di komputer Anda (misal: `D:\Bot-Digipay`).
2. **Buka Terminal/Command Prompt:** 
   - Masuk ke folder tempat Anda mengekstrak file tadi.
   - Klik di area kosong pada *address bar* (jalur folder) di atas, ketik `cmd`, lalu tekan **Enter**. Jendela hitam Command Prompt akan terbuka.
3. **Instal Modul Utama:** Di jendela hitam tersebut, ketik perintah ini lalu tekan Enter:
   ```bash
   npm install
   ```
   *(Tunggu sampai proses unduh selesai. Ini akan menginstal semua library seperti Tesseract.js, Jimp, dll).*
4. **Instal Browser Bot:** Setelah langkah 3 selesai, ketik perintah ini dan tekan Enter:
   ```bash
   npx playwright install firefox
   ```
   *(Langkah ini wajib agar bot bisa mengunduh mesin browser Firefox khusus yang akan dia gunakan untuk bekerja).*

---

## ⚙️ Cara Konfigurasi (Wajib Sebelum Jalan)
Sebelum bot bisa bekerja, Anda harus memasukkan data toko Anda.

1. Buka folder bot Anda, cari file bernama **`config.js`**.
2. Klik kanan file tersebut, lalu pilih **"Open with" -> Notepad** (atau gunakan VS Code).
3. Ubah isi data di dalamnya sesuai dengan NIK, Password, dan nama kurir Anda.
4. Jangan lupa di-**Save** (Ctrl+S) setelah selesai mengubah.

---

## ▶️ Cara Menggunakan / Menjalankan Bot
Jika semua instalasi dan pengaturan di atas sudah selesai, cara menjalankannya sangat mudah:

1. Buka folder bot Anda.
2. Cari file bernama **`jalankan-bot.bat`**.
3. **Klik ganda (Double-click)** file tersebut.
4. Jendela terminal hitam akan muncul dan tak lama kemudian browser Firefox akan terbuka sendiri dan mulai bekerja. 
5. Anda bisa meminimalkan (*minimize*) layar tersebut dan membiarkan bot bekerja di latar belakang!
