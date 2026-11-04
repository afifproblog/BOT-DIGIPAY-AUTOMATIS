// bot.js
const { firefox } = require('playwright');
const path = require('path');
const config = require('./config');
const Tesseract = require('tesseract.js');
const Jimp = require('jimp');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper Jeda Manusia Acak (Default: 3 - 7 detik)
async function jedaManusia(minDetik = 3, maxDetik = 7, label = '') {
    const ms = Math.floor(Math.random() * ((maxDetik - minDetik) * 1000 + 1)) + (minDetik * 1000);
    const detik = (ms / 1000).toFixed(1);
    console.log(`   ⏳ [Jeda Manusia${label ? ' - ' + label : ''}] ${detik} dtk...`);
    await delay(ms);
}

// Fungsi pembuat kode tanggal DDMMYY otomatis untuk No. Resi & Surat Jalan
function buatKodeTanggalDDMMYY() {
    const skrg = new Date();
    const dd = String(skrg.getDate()).padStart(2, '0');
    const mm = String(skrg.getMonth() + 1).padStart(2, '0');
    const yy = String(skrg.getFullYear()).slice(-2);
    return `${dd}${mm}${yy}`;
}

const URL_LOGIN_DIGIT = 'https://digit.kemenkeu.go.id/oauth2?response_type=code&client_id=d75289c52d55842fa48a1c947e40b613&redirect_uri=https://digipaysatu.kemenkeu.go.id/ws/oauth2callback&state=12345';

(async () => {
    try {
        console.log('🦊 Memulai Bot Digipay Satu (Mode Human-Like 3-7s & Full Log)...');

        const userDataDir = path.join(__dirname, 'firefox_data');
        const context = await firefox.launchPersistentContext(userDataDir, {
            headless: false,
            viewport: null
        });

        const page = context.pages()[0] || await context.newPage();
        console.log('   🌐 Browser Firefox siap.');

        page.on('dialog', async dialog => {
            console.log(`   💬 [Respon Dialog] "${dialog.message()}" -> Diterima.`);
            await dialog.accept().catch(() => { });
        });

        // Simulasi pergerakan mouse & scroll acak layaknya manusia
        async function gerakMouseManusia(locatorTarget = null) {
            try {
                const acakX = Math.floor(Math.random() * 500) + 120;
                const acakY = Math.floor(Math.random() * 350) + 100;
                await page.mouse.move(acakX, acakY, { steps: Math.floor(Math.random() * 10) + 8 }).catch(() => { });

                if (locatorTarget && await locatorTarget.isVisible().catch(() => false)) {
                    await locatorTarget.scrollIntoViewIfNeeded().catch(() => { });
                    const box = await locatorTarget.boundingBox().catch(() => null);
                    if (box) {
                        const targetX = box.x + (box.width / 2) + (Math.random() * 8 - 4);
                        const targetY = box.y + (box.height / 2) + (Math.random() * 6 - 3);
                        await page.mouse.move(targetX, targetY, { steps: Math.floor(Math.random() * 12) + 10 }).catch(() => { });
                    }
                } else {
                    const scrollY = Math.floor(Math.random() * 120) - 40;
                    await page.mouse.wheel(0, scrollY).catch(() => { });
                }
                await delay(Math.floor(Math.random() * 350) + 150);
            } catch (e) { }
        }

        async function lumpuhkanPenghalangKlik() {
            await page.evaluate(() => {
                const styleId = 'anti-block-digipay';
                if (!document.getElementById(styleId)) {
                    const style = document.createElement('style');
                    style.id = styleId;
                    style.innerHTML = `
                        div.block, div.element-box { pointer-events: none !important; }
                        button, a, select, input, textarea, ng-select, .ng-select, .ng-select-container, .ng-input, .ng-arrow-wrapper, ng-dropdown-panel, .ng-dropdown-panel, .ng-option, .btn, .btn-warning, .btn-primary, .btn-success, .indicator__button, .indicator__icon {
                            pointer-events: auto !important;
                            position: relative !important;
                            z-index: 99999 !important;
                        }
                    `;
                    document.head.appendChild(style);
                }
            }).catch(() => { });
            console.log('   🛡️ [Anti-Block] Layer penghalang klik dilumpuhkan.');
        }

        async function bukaHalaman(url) {
            console.log(`   🌍 [Navigasi] Membuka URL: ${url}`);
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
                console.log('   ✅ [Respon Navigasi] Halaman berhasil dimuat.');
            } catch (err) {
                console.log(`   ⚠️ [Respon Navigasi] Timeout, memuat ulang halaman...`);
                await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
            }
            await jedaManusia(3, 7, 'Buka Halaman');
            await gerakMouseManusia();
            await lumpuhkanPenghalangKlik();
        }

        // =========================================================================
        // DETEKSI ERROR ADMIN / CALLBACK
        // =========================================================================
        async function cekDanPulihkanErrorAdmin() {
            try {
                const url = page.url();
                const adaError = await page.evaluate(() => {
                    if (!document.body) return false;
                    const t = document.body.innerText.toUpperCase();
                    return (
                        t.includes('HUBUNGI ADMINISTRATOR') ||
                        t.includes('CONTROLLER ERROR') ||
                        t.includes('50001') ||
                        t.includes('HALAMAN TIDAK DITEMUKAN')
                    );
                });

                const sedangDiHalamanLoginDigit = url.includes('digit.kemenkeu.go.id');

                if (adaError || (url.includes('oauth2callback') && !sedangDiHalamanLoginDigit)) {
                    console.log('   ⚠️ [Respon Error] Tabrakan sesi / Error Admin terdeteksi! Memulihkan ke Beranda...');
                    await page.goto(config.URLS.HOME, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => { });
                    await jedaManusia(3, 7, 'Pulihkan Error Admin');
                    await lumpuhkanPenghalangKlik();
                    return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        }

        async function klikBruteForceJabatTangan() {
            console.log('   🤝 [Brute-Force] Menuju ikon Jabat Tangan (Negosiasi)...');
            await lumpuhkanPenghalangKlik();

            if (page.url().includes('/shop/nego')) {
                console.log('   ↩️ [Respon] Sudah di /shop/nego, kembali ke Beranda dulu...');
                const linkBeranda = page.locator('a:has-text("Beranda"), a[href="/shop"]').first();
                if (await linkBeranda.isVisible().catch(() => false)) {
                    await gerakMouseManusia(linkBeranda);
                    await linkBeranda.evaluate(el => el.click()).catch(() => { });
                    await jedaManusia(3, 5, 'Transisi Beranda');
                } else {
                    await bukaHalaman(config.URLS.HOME);
                }
            }

            await lumpuhkanPenghalangKlik();

            const selectorJabatTangan = 'app-indicator[title="Negosiasi Produk"] a.indicator__button, app-indicator[icon="handshake-32"] a, a.indicator__button[href="/shop/nego"], a[href="/shop/nego"]';
            const ikonNego = page.locator(selectorJabatTangan).first();
            await gerakMouseManusia(ikonNego);

            const berhasilDom = await page.evaluate(() => {
                const el = document.querySelector('app-indicator[title="Negosiasi Produk"] a.indicator__button') ||
                    document.querySelector('app-indicator[icon="handshake-32"] a') ||
                    document.querySelector('a.indicator__button[href="/shop/nego"]') ||
                    document.querySelector('a[href="/shop/nego"]');
                if (el) {
                    el.scrollIntoView({ block: 'center' });
                    el.click();
                    return true;
                }
                return false;
            }).catch(() => false);

            console.log(`   🖱️ [Respon Klik DOM] Ikon Jabat Tangan: ${berhasilDom ? 'Terpanggil' : 'Fallback'}`);
            await delay(1500);

            if (!page.url().includes('/shop/nego') && await ikonNego.isVisible().catch(() => false)) {
                console.log('   🖱️ [Respon Klik Fisik] Menekan ulang ikon Jabat Tangan...');
                await ikonNego.click({ force: true, timeout: 5000 }).catch(() => { });
            }

            await jedaManusia(3, 7, 'Muat Halaman Nego');
            await lumpuhkanPenghalangKlik();
            return berhasilDom;
        }

        async function cekApakahSudahLoginDiLayar() {
            try {
                await cekDanPulihkanErrorAdmin();
                const url = page.url();
                if (url.includes('digit.kemenkeu.go.id') || url.includes('unauthorized')) {
                    console.log('   🔎 [Cek Sesi] Posisi di halaman login/unauthorized.');
                    return false;
                }
                if (!url.includes('digipaysatu.kemenkeu.go.id')) return false;

                const status = await page.evaluate(() => {
                    if (!document.body) return false;
                    const teksLayar = document.body.innerText.toUpperCase();
                    return (!teksLayar.includes('HALO, LOG IN') && !teksLayar.includes('UNAUTHORIZED USER') && teksLayar.includes('VENDOR') && teksLayar.includes('BAMBANG ADI'));
                });
                console.log(`   🔎 [Cek Sesi] Status Vendor Aktif: ${status ? 'YA' : 'TIDAK'}`);
                return status;
            } catch (e) {
                return false;
            }
        }

        // =========================================================================
        // FUNGSI OCR CAPTCHA (Preprocessing Jimp + Tesseract)
        // =========================================================================
        async function pecahkanCaptcha(bufferGambar) {
            try {
                const image = await Jimp.read(bufferGambar);
                image.grayscale();

                image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                    const r = this.bitmap.data[idx + 0];
                    const g = this.bitmap.data[idx + 1];
                    const b = this.bitmap.data[idx + 2];
                    const gray = (r + g + b) / 3;
                    const val = gray > 150 ? 255 : 0;

                    this.bitmap.data[idx + 0] = val;
                    this.bitmap.data[idx + 1] = val;
                    this.bitmap.data[idx + 2] = val;
                });

                const processedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

                console.log('   🔍 [OCR Jimp] Memproses gambar hitam-putih...');
                const { data: { text } } = await Tesseract.recognize(processedBuffer, 'eng', {
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                    tessedit_pageseg_mode: '7'
                });

                const hasil = text.replace(/[^A-Za-z0-9]/g, '').trim();
                console.log(`   🔐 [Respon OCR Jimp] Hasil: "${hasil}"`);
                return hasil;
            } catch (err) {
                console.log('   ⚠️ [Error OCR Jimp] ' + err.message);
                return '';
            }
        }

        async function cekSesiLogin() {
            await delay(500);
            if (await cekApakahSudahLoginDiLayar()) return;

            console.log('⚠️ [Sesi] Belum terdeteksi di layar, mencoba refresh...');
            for (let r = 1; r <= 2; r++) {
                console.log(`   🔄 [Refresh Sesi] Percobaan (${r}/2)...`);
                if (r === 2 || page.url().includes('unauthorized') || page.url().includes('digit.kemenkeu.go.id')) {
                    await page.goto(config.URLS.HOME, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => { });
                } else {
                    await page.reload({ waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => { });
                }
                await delay(10000);
                if (await cekApakahSudahLoginDiLayar()) {
                    console.log('   ✅ [Respon Sesi] Sesi kembali pulih!');
                    await lumpuhkanPenghalangKlik();
                    return;
                }
            }

            console.log('🛑 [Sesi Habis] Memulai prosedur login DIGIT...');
            const btnLoginUnauthorized = page.locator('button:has-text("Login via DIGIT"), a:has-text("Login via DIGIT")').first();
            const btnAkunSaya = page.locator('text="Akun Saya", a[href="/account"]').first();

            if (await btnLoginUnauthorized.isVisible().catch(() => false)) {
                console.log('   🖱️ [Login] Klik tombol Login via DIGIT...');
                await gerakMouseManusia(btnLoginUnauthorized);
                await btnLoginUnauthorized.evaluate(el => el.click()).catch(() => { });
                await jedaManusia(3, 6, 'Menuju Portal DIGIT');
            } else if (await btnAkunSaya.isVisible().catch(() => false)) {
                console.log('   🖱️ [Login] Klik menu Akun Saya...');
                await gerakMouseManusia(btnAkunSaya);
                await btnAkunSaya.evaluate(el => el.click()).catch(() => { });
                await delay(1500);
                const btnLoginMenu = page.locator('a:has-text("Login"), button:has-text("Login")').first();
                if (await btnLoginMenu.isVisible().catch(() => false)) {
                    console.log('   🖱️ [Login] Klik sub-menu Login...');
                    await btnLoginMenu.evaluate(el => el.click()).catch(() => { });
                    await jedaManusia(3, 5, 'Buka Form DIGIT');
                }
            }

            if (await cekApakahSudahLoginDiLayar()) return;

            if (!page.url().includes('digit.kemenkeu.go.id')) {
                console.log('   🌍 [Login] Menembak langsung URL OAuth DIGIT...');
                await page.goto(URL_LOGIN_DIGIT, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
                await jedaManusia(3, 6, 'Halaman OAuth DIGIT');
            }

            await cekDanPulihkanErrorAdmin();
            if (await cekApakahSudahLoginDiLayar()) return;

            if (page.url().includes('digit.kemenkeu.go.id')) {
                try {
                    const inputUsername = page.locator('input[placeholder*="NIK"], input[placeholder*="Username"], input[name="username"]').first();
                    await inputUsername.waitFor({ state: 'visible', timeout: 10000 });
                    await gerakMouseManusia(inputUsername);
                    await inputUsername.click();
                    await inputUsername.fill(config.KREDENSIAL.USERNAME);
                    console.log('   ✍️ [Login] Username/NIK berhasil diisi.');
                    await jedaManusia(3, 5, 'Setelah Isi NIK');

                    const btnSelanjutnya = page.locator('button:has-text("Selanjutnya"), input[value*="Selanjutnya"], a:has-text("Selanjutnya")').first();
                    if (await btnSelanjutnya.isVisible().catch(() => false)) {
                        await gerakMouseManusia(btnSelanjutnya);
                        await btnSelanjutnya.click();
                        console.log('   🖱️ [Login] Tombol Selanjutnya ditekan.');
                    }
                } catch (e) {
                    console.log('   ⚠️ [Login] Kolom NIK dilewati: ' + e.message);
                }

                await delay(1000);
                if (await cekApakahSudahLoginDiLayar()) return;

                try {
                    const inputPassword = page.locator('input[type="password"]').first();
                    await inputPassword.waitFor({ state: 'visible', timeout: 12000 });
                    await gerakMouseManusia(inputPassword);
                    await inputPassword.click();
                    await inputPassword.fill(config.KREDENSIAL.PASSWORD);
                    console.log('   ✍️ [Login] Password berhasil diisi.');
                    await jedaManusia(3, 5, 'Setelah Isi Password');

                    const gambarCaptcha = page.locator('img[src*="/captcha/default"], img[id*="captcha" i], img[alt*="captcha" i]').first();
                    const inputcaptcha = page.locator('input[placeholder*="captcha" i], input[name*="captcha" i], input[id*="captcha" i]').first();

                    let captchaBerhasil = false;

                    for (let percobaan = 1; percobaan <= 5 && !captchaBerhasil; percobaan++) {
                        try {
                            await gambarCaptcha.waitFor({ state: 'visible', timeout: 8000 });
                            console.log(`   📸 [CAPTCHA] Mengambil gambar captcha (Percobaan ${percobaan}/5)...`);

                            const buf = await gambarCaptcha.screenshot();
                            const { data: { text } } = await Tesseract.recognize(buf, 'eng', {
                                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                                tessedit_pageseg_mode: '7'
                            });

                            let kode = text.replace(/[^A-Za-z0-9]/g, '').trim();
                            if (kode.length < 4) {
                                console.log('   🔄 [CAPTCHA] Mencoba ulang baca dengan filter Jimp...');
                                kode = await pecahkanCaptcha(buf);
                            }

                            console.log(`   🔐 [Respon OCR] Captcha terbaca (${percobaan}/5): "${kode}"`);

                            if (kode.length < 3) {
                                console.log('   ⚠️ [CAPTCHA] Terlalu pendek, memuat ulang gambar captcha...');
                                await gambarCaptcha.click().catch(() => { });
                                await jedaManusia(3, 5, 'Reload Captcha');
                                continue;
                            }

                            await gerakMouseManusia(inputcaptcha);
                            await inputcaptcha.click({ force: true }).catch(() => { });
                            await inputcaptcha.fill('');
                            await inputcaptcha.fill(kode);
                            await inputcaptcha.evaluate((el, val) => {
                                el.value = val;
                                el.dispatchEvent(new Event('input', { bubbles: true }));
                                el.dispatchEvent(new Event('change', { bubbles: true }));
                            }, kode).catch(() => { });
                            console.log(`   ✍️ [CAPTCHA] Kode "${kode}" diketik ke kolom input.`);
                            await jedaManusia(3, 5, 'Siap Klik Masuk');

                            console.log('   🖱️ [Login] Menekan tombol Masuk...');
                            const berhasilKlik = await page.evaluate(() => {
                                let tombol = document.getElementById('submit-step2');
                                if (!tombol) {
                                    const semuaTombol = Array.from(document.querySelectorAll('button, input[type="submit"]'));
                                    tombol = semuaTombol.find(el =>
                                        (el.innerText || el.value || '').toUpperCase().includes('MASUK DAN IZINKAN AKSES') ||
                                        (el.innerText || el.value || '').toUpperCase().includes('MASUK')
                                    );
                                }
                                if (tombol) {
                                    tombol.scrollIntoView({ block: 'center' });
                                    tombol.click();
                                    tombol.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                                    tombol.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                                    tombol.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                                    return true;
                                }
                                return false;
                            }).catch(() => false);

                            if (!berhasilKlik) {
                                const btnFallback = page.locator('#submit-step2, button:has-text("Masuk dan Izinkan Akses"), button[type="submit"]').first();
                                await gerakMouseManusia(btnFallback);
                                await btnFallback.click({ force: true, timeout: 5000 }).catch(() => { });
                                console.log('   ✅ [Respon Klik] Tombol Masuk ditekan (Playwright Click).');
                            } else {
                                console.log('   ✅ [Respon Klik] Tombol Masuk ditekan (DOM Injection).');
                            }

                            await jedaManusia(3, 7, 'Tunggu Respon Server Login');

                            const captchaSalah = await page.getByText(/captcha.*salah|captcha.*tidak.*valid|kode.*captcha.*invalid/i)
                                .first().isVisible().catch(() => false);

                            if (captchaSalah) {
                                console.log('   ❌ [Respon Server] Captcha ditolak, mengulangi...');
                                await delay(1500);
                                continue;
                            }

                            if (!page.url().includes('digit.kemenkeu.go.id') || page.url().includes('oauth2callback')) {
                                console.log('   🎉 [Respon Server] Berhasil keluar dari halaman login via OCR!');
                                captchaBerhasil = true;
                                break;
                            }

                            console.log('   ⚠️ [Respon Server] Masih di halaman login, mencoba lagi...');
                            await delay(1500);
                        } catch (err) {
                            console.log(`   ⚠️ [Error OCR] Percobaan ${percobaan}: ${err.message}`);
                            await delay(1500);
                        }
                    }

                    if (!captchaBerhasil) {
                        console.log('   ❌ [Fallback Manual] OCR gagal 5x. Menunggu input manual 120 detik...');
                        const mulaiTunggu = Date.now();
                        while (Date.now() - mulaiTunggu < 120_000) {
                            if (!page.url().includes('digit.kemenkeu.go.id')) break;
                            await delay(1000);
                        }
                    }

                    if (await inputcaptcha.isVisible().catch(() => false)) await inputcaptcha.click().catch(() => { });
                } catch (error) {
                    console.log('   ⚠️ [Error Form Login] ' + error.message);
                }
            }

            while (true) {
                await delay(2000);
                await cekDanPulihkanErrorAdmin();
                if (await cekApakahSudahLoginDiLayar()) {
                    console.log('✅ [Login Sukses] Nama Vendor terdeteksi! Melanjutkan tugas...');
                    await jedaManusia(3, 6, 'Stabilisasi Beranda');
                    await lumpuhkanPenghalangKlik();
                    break;
                }
            }
        }

        await bukaHalaman(config.URLS.HOME);
        await cekSesiLogin();

        // =========================================================================
        // TAHAP 1: NEGOSIASI 
        // =========================================================================
        async function prosesTahap1Nego() {
            console.log('\n🤝 [Tahap 1] Memproses Negosiasi...');
            while (true) {
                await cekSesiLogin();
                if (!page.url().replace(/\/+$/, '').endsWith('/shop/nego')) {
                    await klikBruteForceJabatTangan();
                    if (!page.url().replace(/\/+$/, '').endsWith('/shop/nego')) await bukaHalaman(config.URLS.NEGO);
                    await cekSesiLogin();
                }

                let hitungRefreshTabel = 0;
                let gagalTotalMuatTabel = false;
                while (true) {
                    console.log('   ⏳ [Tahap 1] Menunggu tabel negosiasi dimuat...');
                    try { await page.waitForSelector('table tbody tr, :text("Halaman Nego Kosong")', { timeout: 8000 }); } catch (e) { }
                    await delay(800);
                    const adaBugKosong = await page.getByText(/Halaman Nego Kosong/i).first().isVisible().catch(() => false);
                    const jumlahBarisTabel = await page.locator('table tbody tr').count().catch(() => 0);

                    if (!adaBugKosong && jumlahBarisTabel > 0) {
                        console.log(`   📊 [Respon Tabel Nego] ${jumlahBarisTabel} baris produk tampil.`);
                        break;
                    }

                    hitungRefreshTabel++;
                    console.log(`   ⚠️ [Respon Tabel Nego] Kosong/belum tampil (Percobaan ${hitungRefreshTabel}/5)...`);
                    if (hitungRefreshTabel <= 2) {
                        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                        await jedaManusia(3, 7, 'Refresh Tabel Nego');
                        await cekSesiLogin();
                        await lumpuhkanPenghalangKlik();
                    } else if (hitungRefreshTabel <= 5) {
                        await cekSesiLogin();
                        await klikBruteForceJabatTangan();
                    } else {
                        console.log('   🛑 [Tahap 1] Gagal memuat tabel setelah 5x usaha, lanjut ke Tahap 2.');
                        gagalTotalMuatTabel = true;
                        break;
                    }
                }

                if (gagalTotalMuatTabel) break;
                await lumpuhkanPenghalangKlik();
                await gerakMouseManusia();

                const locatorKuning = page.locator('table button.btn-warning:has-text("Nego"), table .btn-warning:has-text("Nego"), button.btn-warning:has-text("Nego")');
                const totalKuning = await locatorKuning.count().catch(() => 0);
                console.log(`   🔍 [Tahap 1] Jumlah tombol Nego Kuning: ${totalKuning}`);

                if (totalKuning === 0) {
                    console.log('   🎉 [Tahap 1 Selesai] Tidak ada antrean Nego Kuning tersisa.');
                    break;
                }

                await jedaManusia(3, 7, 'Sebelum Klik Nego Kuning');
                const btnKuningPertama = locatorKuning.first();
                await gerakMouseManusia(btnKuningPertama);
                console.log('   🖱️ [Tahap 1] Mengeklik tombol Nego Kuning pertama...');
                await btnKuningPertama.evaluate(el => { el.scrollIntoView({ block: 'center' }); el.click(); }).catch(() => { });
                await jedaManusia(3, 7, 'Buka Detail Nego');

                if (page.url().replace(/\/+$/, '').endsWith('/shop/nego')) {
                    console.log('   🖱️ [Tahap 1] Klik fisik cadangan pada tombol Nego Kuning...');
                    await btnKuningPertama.click({ timeout: 4000 }).catch(() => { });
                    await jedaManusia(3, 6, 'Tunggu Detail Nego');
                }

                let percobaanDetail = 0;
                while (page.url().includes('/shop/nego/') && percobaanDetail < 15) {
                    percobaanDetail++;
                    console.log(`   📄 [Detail Nego] Memeriksa halaman detail (Cek ke-${percobaanDetail})...`);
                    await jedaManusia(3, 6, 'Baca Detail Nego');
                    await lumpuhkanPenghalangKlik();

                    if (await page.getByText(/Negosiasi Selesai/i).first().isVisible().catch(() => false) || await page.getByText(/Status : Nego Selesai/i).first().isVisible().catch(() => false)) {
                        console.log('   ✅ [Respon Detail] Status sudah Negosiasi Selesai!');
                        break;
                    }

                    const bugTidakDitemukan = await page.getByText(/Detail Negosiasi Tidak Ditemukan/i).first().isVisible().catch(() => false) || await page.getByText(/Status : -/i).first().isVisible().catch(() => false);
                    const btnSetuju = page.locator('button.btn-primary:has-text("Setuju"), button:has-text("Setuju")').filter({ hasNotText: 'List Nego' }).filter({ hasNotText: 'Nego' }).first();
                    const adaTombolSetuju = await btnSetuju.isVisible().catch(() => false);

                    if (bugTidakDitemukan && !adaTombolSetuju) {
                        console.log('   ⚠️ [Respon Detail] Bug Detail Tidak Ditemukan, me-refresh...');
                        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                        await jedaManusia(3, 7, 'Refresh Detail Nego');
                        continue;
                    }

                    if (adaTombolSetuju) {
                        console.log('   📝 [Detail Nego] Tombol Setuju ditemukan, memeriksa form...');
                        const semuaDropdown = page.locator('select');
                        for (let s = 0; s < await semuaDropdown.count(); s++) {
                            const sel = semuaDropdown.nth(s);
                            if (await sel.isVisible().catch(() => false) && (!await sel.inputValue().catch(() => '') || await sel.inputValue().catch(() => '') === '0')) {
                                await gerakMouseManusia(sel);
                                await sel.selectOption({ index: 1 }).catch(() => { });
                                console.log(`   🔽 [Detail Nego] Dropdown ke-${s + 1} dipilih.`);
                                await delay(600);
                            }
                        }

                        const checkOpt = page.locator('input[type="checkbox"]').first();
                        if (await checkOpt.isVisible().catch(() => false) && !(await checkOpt.isChecked().catch(() => false))) {
                            await gerakMouseManusia(checkOpt);
                            await checkOpt.evaluate(el => el.click()).catch(() => { });
                            console.log('   ☑️ [Detail Nego] Checkbox persetujuan dicentang.');
                            await delay(800);
                        }

                        await jedaManusia(3, 7, 'Sebelum Klik Setuju Nego');
                        await gerakMouseManusia(btnSetuju);
                        console.log('   🟢 [Detail Nego] Menekan tombol Setuju...');
                        await btnSetuju.evaluate(el => el.click()).catch(() => { });
                        await jedaManusia(3, 7, 'Respon Klik Setuju');

                        const btnOkModal = page.locator('.swal2-confirm, .modal.show button:has-text("OK"), .modal.show button:has-text("Ya")').first();
                        if (await btnOkModal.isVisible().catch(() => false)) {
                            await gerakMouseManusia(btnOkModal);
                            await btnOkModal.evaluate(el => el.click()).catch(() => { });
                            console.log('   💬 [Respon Modal] Tombol konfirmasi OK/Ya ditekan.');
                            await jedaManusia(3, 5, 'Tutup Modal Nego');
                        }

                        if (await page.locator('.toast-success, .swal2-icon-success, div.alert-success').first().isVisible().catch(() => false) || await page.getByText(/Negosiasi Selesai/i).first().isVisible().catch(() => false)) {
                            console.log('   🎉 [Respon Nego] Negosiasi berhasil disetujui!');
                            break;
                        } else {
                            console.log('   🔄 [Detail Nego] Memuat ulang untuk verifikasi status...');
                            await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                            await jedaManusia(3, 6, 'Verifikasi Status Nego');
                        }
                    } else {
                        console.log('   ⏳ [Detail Nego] Elemen belum lengkap, memuat ulang...');
                        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                        await jedaManusia(3, 6, 'Muat Ulang Detail');
                    }
                }
                await klikBruteForceJabatTangan();
            }
        }

        // =========================================================================
        // TAHAP 2: PENGECEKAN
        // =========================================================================
        async function prosesTahap2Pengecekan() {
            console.log('\n📋 [Tahap 2] Memproses Pengecekan...');
            let limitPengaman = 0;
            while (limitPengaman < 20) {
                limitPengaman++;
                await cekSesiLogin();
                if (!page.url().includes('/transaksi/pengecekan')) {
                    await bukaHalaman(config.URLS.PENGECEKAN);
                    await cekSesiLogin();
                }

                let percobaanMuatTabel = 0;
                while (percobaanMuatTabel < 2) {
                    console.log('   ⏳ [Tahap 2] Menunggu tabel TAYANG DATA Pengecekan...');
                    try {
                        await page.waitForFunction(() => {
                            const teks = (document.body.innerText || '').toUpperCase();
                            return !!document.querySelector('a[title="Proses Invoice"]') || teks.includes('TIDAK ADA DATA') || teks.includes('TAMPILAN 0 DARI 0');
                        }, { timeout: 10000 });
                        break;
                    } catch (e) {
                        percobaanMuatTabel++;
                        console.log(`   ⚠️ [Respon Tabel Cek] Belum muncul, refresh (${percobaanMuatTabel}/2)...`);
                        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                        await jedaManusia(3, 7, 'Refresh Tabel Pengecekan');
                        await cekSesiLogin();
                    }
                }

                await jedaManusia(3, 6, 'Cek Antrean Pengecekan');
                await lumpuhkanPenghalangKlik();

                const locatorCentangAwal = page.locator('table tbody tr:not([hidden]) td.row-actions a[title="Proses Invoice"], a[title="Proses Invoice"]');
                const jumlahAntrean = await locatorCentangAwal.count().catch(() => 0);
                const teksKosongCek = await page.evaluate(() => {
                    const t = (document.body.innerText || '').toUpperCase();
                    return t.includes('TIDAK ADA DATA') || t.includes('TAMPILAN 0 DARI 0');
                }).catch(() => false);

                console.log(`   📊 [Respon Pengecekan] Antrean ditemukan: ${jumlahAntrean}`);
                if (jumlahAntrean === 0 || teksKosongCek) {
                    console.log('   🎉 [Tahap 2 Selesai] Tidak ada antrean pengecekan.');
                    break;
                }

                const btnProsesInvoice = locatorCentangAwal.first();
                await gerakMouseManusia(btnProsesInvoice);
                console.log('   🖱️ [Tahap 2] Mengeklik ikon centang hijau (Proses Invoice)...');
                await btnProsesInvoice.evaluate(el => { el.scrollIntoView({ block: 'center' }); el.click(); }).catch(() => { });
                await jedaManusia(3, 7, 'Buka REKAM DATA Pengecekan');

                if (!await page.locator('#div-simpan button[title="Simpan Data"]').first().isVisible().catch(() => false)) {
                    console.log('   🖱️ [Tahap 2] Klik fisik cadangan pada Proses Invoice...');
                    await btnProsesInvoice.click({ force: true, timeout: 5000 }).catch(() => { });
                    await jedaManusia(3, 6, 'Tunggu REKAM DATA');
                }

                const btnSetujuSimpan = page.locator('#div-simpan button[title="Simpan Data"], button[title="Simpan Data"]').first();
                try {
                    await btnSetujuSimpan.waitFor({ state: 'visible', timeout: 10000 });
                    console.log('   ✅ [Respon Halaman 2] Form REKAM DATA Pengecekan terbuka.');
                } catch (e) {
                    console.log('   ⚠️ [Respon Halaman 2] Gagal membuka REKAM DATA, mengulangi...');
                    await bukaHalaman(config.URLS.PENGECEKAN);
                    continue;
                }

                await jedaManusia(3, 6, 'Siap Isi Catatan Pengecekan');
                await lumpuhkanPenghalangKlik();

                const kotakCatatan = page.locator('textarea[placeholder*="Masukkan Catatan"], input[placeholder*="Masukkan Catatan"]').first();
                try {
                    await kotakCatatan.waitFor({ state: 'visible', timeout: 8000 });
                    await gerakMouseManusia(kotakCatatan);
                    await kotakCatatan.click({ force: true });
                    await delay(400);
                    await kotakCatatan.fill('');
                    await delay(300);
                    await kotakCatatan.fill(config.DATA_FORM.CATATAN_PENGECEKAN);
                    await kotakCatatan.evaluate((el, teks) => {
                        if (!el.value || el.value.trim() === '') el.value = teks;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }, config.DATA_FORM.CATATAN_PENGECEKAN).catch(() => { });
                    console.log(`   ✍️ [Tahap 2] Catatan diisi: "${config.DATA_FORM.CATATAN_PENGECEKAN}"`);
                } catch (e) {
                    console.log('   ⚠️ [Error Catatan] Kolom catatan gagal diisi, memuat ulang...');
                    await bukaHalaman(config.URLS.PENGECEKAN);
                    continue;
                }

                await jedaManusia(3, 7, 'Sebelum Klik Setuju Pengecekan');
                await gerakMouseManusia(btnSetujuSimpan);
                console.log('   🟢 [Tahap 2] Menekan tombol SETUJU (Simpan Data)...');
                await btnSetujuSimpan.evaluate(el => { el.scrollIntoView({ block: 'center' }); el.click(); }).catch(() => { });
                await delay(1500);
                if (await btnSetujuSimpan.isVisible().catch(() => false)) {
                    await btnSetujuSimpan.click({ force: true, timeout: 4000 }).catch(() => { });
                }
                await jedaManusia(3, 7, 'Respon Simpan Pengecekan');

                const btnOkModalCek = page.locator('.swal2-confirm, .modal.show button:has-text("OK"), button:has-text("Ya")').first();
                if (await btnOkModalCek.isVisible().catch(() => false)) {
                    await gerakMouseManusia(btnOkModalCek);
                    await btnOkModalCek.evaluate(el => el.click()).catch(() => { });
                    console.log('   💬 [Respon Modal] Konfirmasi OK/Ya ditekan.');
                    await jedaManusia(3, 5, 'Selesai Konfirmasi');
                }
                console.log('   ✔️ [Respon Tahap 2] Invoice berhasil dicek & disetujui!');
                await bukaHalaman(config.URLS.PENGECEKAN);
            }
        }

        // =========================================================================
        // HELPER KHUSUS TAHAP 3: PEMILIH KOMPONEN ANGULAR 
        // =========================================================================
        async function pilihNgSelectPresisi(ngSelectLocator, teksDicari, namaField) {
            for (let usaha = 1; usaha <= 3; usaha++) {
                try {
                    console.log(`      🔽 [ng-select] Membuka dropdown ${namaField} (Usaha ${usaha}/3)...`);
                    await page.evaluate(() => {
                        let styleFix = document.getElementById('ng-dropdown-top-fix');
                        if (!styleFix) {
                            styleFix = document.createElement('style');
                            styleFix.id = 'ng-dropdown-top-fix';
                            document.head.appendChild(styleFix);
                        }
                        styleFix.innerHTML = `
                            textarea { pointer-events: none !important; z-index: 0 !important; }
                            ng-select.ng-select-opened { z-index: 9999999 !important; position: relative !important; }
                            ng-dropdown-panel, .ng-dropdown-panel, .ng-dropdown-panel-items, .ng-option, .ng-option-label {
                                pointer-events: auto !important;
                                z-index: 9999999 !important;
                            }
                        `;
                    }).catch(() => { });

                    await gerakMouseManusia(ngSelectLocator);

                    const containerNg = ngSelectLocator.locator('.ng-select-container').first();
                    const inputCombo = ngSelectLocator.locator('div.ng-input input[type="text"], input[type="text"]').first();

                    if (await containerNg.isVisible().catch(() => false)) {
                        await containerNg.click({ force: true });
                    } else if (await inputCombo.isVisible().catch(() => false)) {
                        await inputCombo.click({ force: true });
                    } else {
                        await ngSelectLocator.click({ force: true });
                    }

                    await delay(900);

                    const semuaOpsi = page.locator('ng-dropdown-panel .ng-option, .ng-dropdown-panel .ng-option');
                    const jumlahOpsi = await semuaOpsi.count().catch(() => 0);
                    console.log(`      📋 [Respon Dropdown] ${jumlahOpsi} opsi terdeteksi pada ${namaField}.`);

                    if (jumlahOpsi > 0) {
                        let targetOpsi = semuaOpsi.first();
                        if (teksDicari && teksDicari.trim() !== '') {
                            const opsiCocok = semuaOpsi.filter({ hasText: new RegExp(teksDicari, 'i') });
                            if (await opsiCocok.count().catch(() => 0) > 0) {
                                targetOpsi = opsiCocok.first();
                            }
                        }

                        await gerakMouseManusia(targetOpsi);
                        await targetOpsi.evaluate(el => {
                            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, button: 0 }));
                            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, button: 0 }));
                            el.click();
                        }).catch(() => { });

                        await delay(500);

                        const masihTerbuka = await page.locator('ng-dropdown-panel').first().isVisible().catch(() => false);
                        if (masihTerbuka) {
                            await targetOpsi.click({ force: true }).catch(() => { });
                            await delay(300);
                            if (await page.locator('ng-dropdown-panel').first().isVisible().catch(() => false)) {
                                await page.keyboard.press('Enter').catch(() => { });
                            }
                        }
                        await delay(800);
                    } else if (await inputCombo.isVisible().catch(() => false)) {
                        console.log(`      ⌨️ [Fallback Keyboard] Menekan ArrowDown + Enter pada ${namaField}...`);
                        await inputCombo.focus().catch(() => { });
                        await page.keyboard.press('ArrowDown').catch(() => { });
                        await delay(400);
                        await page.keyboard.press('Enter').catch(() => { });
                        await delay(800);
                    }

                    const berhasilTerpilih = await ngSelectLocator.evaluate(el => {
                        const adaClassHasValue = el.classList.contains('ng-has-value') || !!el.querySelector('.ng-has-value');
                        const valEl = el.querySelector('.ng-value');
                        const teksVal = valEl ? (valEl.innerText || '').trim() : '';
                        return adaClassHasValue && teksVal.length > 0;
                    }).catch(() => false);

                    if (berhasilTerpilih) {
                        const teksTerpilih = await ngSelectLocator.locator('.ng-value').first().innerText().catch(() => teksDicari || 'Opsi Pertama');
                        console.log(`      ✅ [Respon ng-select] ${namaField} terkunci: "${teksTerpilih.replace(/\s+/g, ' ').trim()}"`);
                        return true;
                    }

                    console.log(`      ⚠️ [Respon ng-select] Percobaan (${usaha}/3) ${namaField} belum terkunci.`);
                    await delay(1000);
                } catch (err) {
                    console.log(`      ⚠️ [Error ng-select] ${namaField} (${usaha}/3): ${err.message}`);
                    await delay(1000);
                } finally {
                    await page.evaluate(() => {
                        const styleFix = document.getElementById('ng-dropdown-top-fix');
                        if (styleFix) styleFix.innerHTML = '';
                    }).catch(() => { });
                }
            }
            return false;
        }

        // =========================================================================
        // TAHAP 3: PENGIRIMAN
        // =========================================================================
        async function prosesTahap3Pengiriman() {
            console.log('\n🚚 [Tahap 3] Memproses Pengiriman...');
            let limitPengamanKirim = 0;
            while (limitPengamanKirim < 15) {
                limitPengamanKirim++;
                await cekSesiLogin();
                if (!page.url().includes('/transaksi/pengiriman')) {
                    await bukaHalaman(config.URLS.PENGIRIMAN);
                    await cekSesiLogin();
                }

                let percobaanTabelKirim = 0;
                while (percobaanTabelKirim < 3) {
                    console.log('   ⏳ [Tahap 3] Menunggu tabel TAYANG DATA Pengiriman...');
                    try {
                        await page.waitForFunction(() => {
                            const teks = (document.body.innerText || '').toUpperCase();
                            return !!document.querySelector('table tbody tr:not([hidden]) input[type="checkbox"]') || teks.includes('TIDAK ADA DATA') || teks.includes('TAMPILAN 0 DARI 0');
                        }, { timeout: 10000 });
                        break;
                    } catch (e) {
                        percobaanTabelKirim++;
                        console.log(`   ⚠️ [Respon Tabel Kirim] Belum tampil, refresh (${percobaanTabelKirim}/3)...`);
                        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                        await jedaManusia(3, 7, 'Refresh Tabel Pengiriman');
                        await cekSesiLogin();
                    }
                }

                await jedaManusia(3, 6, 'Cek Antrean Pengiriman');
                await lumpuhkanPenghalangKlik();

                const locatorCheckboxAksi = page.locator('table tbody tr:not([hidden]) td.row-actions input[type="checkbox"], table tbody tr:not([hidden]) input[type="checkbox"]');
                const jumlahCheckbox = await locatorCheckboxAksi.count().catch(() => 0);
                const teksKosongKirim = await page.evaluate(() => {
                    const t = (document.body.innerText || '').toUpperCase();
                    return t.includes('TIDAK ADA DATA') || t.includes('TAMPILAN 0 DARI 0');
                }).catch(() => false);

                console.log(`   📊 [Respon Pengiriman] Baris siap kirim: ${jumlahCheckbox}`);
                if (jumlahCheckbox === 0 || teksKosongKirim) {
                    console.log('   🎉 [Tahap 3 Selesai] Tidak ada antrean pengiriman tersisa.');
                    break;
                }

                console.log(`   ☑️ [Halaman 1 - TAYANG DATA] Mencentang ${jumlahCheckbox} baris pesanan secara manusiawi...`);
                for (let idx = 0; idx < jumlahCheckbox; idx++) {
                    const kotakCentang = locatorCheckboxAksi.nth(idx);
                    if (await kotakCentang.isVisible().catch(() => false)) {
                        if (!await kotakCentang.isChecked().catch(() => false)) {
                            await gerakMouseManusia(kotakCentang);
                            await kotakCentang.click({ force: true }).catch(async () => { await kotakCentang.evaluate(el => el.click()); });
                            await delay(Math.floor(Math.random() * 450) + 350);
                            if (!(await kotakCentang.isChecked().catch(() => false))) {
                                await kotakCentang.evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); }).catch(() => { });
                            }
                            console.log(`      ✔️ [Respon Centang] Baris ke-${idx + 1} tercentang.`);
                        }
                    }
                }

                await jedaManusia(3, 7, 'Sebelum Klik Tombol KIRIM');
                const btnKirimAtas = page.locator('#action-table:not([hidden]) a:has-text("KIRIM"), #action-table:not([hidden]) button, a:has-text("KIRIM"), button:has-text("KIRIM")').first();
                await gerakMouseManusia(btnKirimAtas);
                console.log('   🚀 [Tahap 3] Menekan tombol KIRIM di pojok kanan atas...');

                await page.evaluate(() => {
                    const actionTables = Array.from(document.querySelectorAll('#action-table')).filter(el => !el.hidden && el.offsetParent !== null);
                    for (const container of actionTables) {
                        const target = Array.from(container.querySelectorAll('a, button, span')).find(el => (el.innerText || '').toUpperCase().includes('KIRIM'));
                        if (target) {
                            const btn = target.closest('a, button') || target;
                            btn.scrollIntoView({ block: 'center' });
                            btn.click();
                            const innerBtn = btn.querySelector('button');
                            if (innerBtn) innerBtn.click();
                            return;
                        }
                    }
                }).catch(() => { });

                await jedaManusia(3, 6, 'Buka REKAM DATA Pengiriman');
                if (!await page.locator('#div-simpan button[title="Simpan Data"], input[placeholder*="Masukkan Nomor Resi"]').first().isVisible().catch(() => false) && await btnKirimAtas.isVisible().catch(() => false)) {
                    console.log('   🖱️ [Tahap 3] Klik fisik cadangan pada tombol KIRIM...');
                    await btnKirimAtas.click({ force: true, timeout: 5000 }).catch(() => { });
                    await jedaManusia(3, 6, 'Tunggu Form REKAM DATA');
                }

                const inputNoResi = page.locator('input[placeholder*="Masukkan Nomor Resi"], input[placeholder*="Nomor Resi"], input[placeholder*="Resi"]').first();
                try {
                    await inputNoResi.waitFor({ state: 'visible', timeout: 10000 });
                    console.log('   ✅ [Respon Halaman 2] Form REKAM DATA Pengiriman siap.');
                } catch (e) {
                    console.log('   ⚠️ [Respon Halaman 2] Form gagal terbuka, kembali ke TAYANG DATA...');
                    await bukaHalaman(config.URLS.PENGIRIMAN);
                    continue;
                }

                await jedaManusia(3, 6, 'Persiapan Isi Form Pengiriman');
                await lumpuhkanPenghalangKlik();

                const kodeTanggalResi = buatKodeTanggalDDMMYY();

                // 1 & 2. ISI NO. RESI & SURAT JALAN
                console.log(`   ✍️ [1/6] Mengisi No. Resi & Surat Jalan: "${kodeTanggalResi}"...`);
                for (const selector of ['input[placeholder*="Masukkan Nomor Resi"]', 'input[placeholder*="Masukkan Nomor Surat Jalan"]']) {
                    const inputElem = page.locator(selector).first();
                    if (await inputElem.isVisible().catch(() => false)) {
                        await gerakMouseManusia(inputElem);
                        await inputElem.click({ force: true });
                        await delay(300);
                        await inputElem.fill('');
                        await inputElem.fill(kodeTanggalResi);
                        await inputElem.evaluate((el, val) => {
                            el.value = val;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            el.dispatchEvent(new Event('blur', { bubbles: true }));
                        }, kodeTanggalResi).catch(() => { });
                        console.log(`      ✔️ [Respon Input] "${selector}" terisi: ${kodeTanggalResi}`);
                        await jedaManusia(3, 5, 'Antar Kolom Resi/Surat Jalan');
                    }
                }

                // 3. METODE KIRIM ("Kurir Sendiri")
                console.log('   🚚 [3/6] Memilih Metode Kirim: "Kurir Sendiri"...');
                const selectMetode = page.locator('select:has(option:has-text("Kurir Sendiri"))').first();
                if (await selectMetode.isVisible().catch(() => false)) {
                    await gerakMouseManusia(selectMetode);
                    await selectMetode.selectOption({ label: 'Kurir Sendiri' }).catch(() => { });
                }

                await page.evaluate(() => {
                    const selects = Array.from(document.querySelectorAll('select'));
                    const targetSelect = selects.find(s => Array.from(s.options).some(o => o.text.includes('Kurir Sendiri')));
                    if (targetSelect) {
                        const idx = Array.from(targetSelect.options).findIndex(o => o.text.includes('Kurir Sendiri'));
                        if (idx !== -1) {
                            targetSelect.selectedIndex = idx;
                            targetSelect.value = targetSelect.options[idx].value;
                            targetSelect.dispatchEvent(new Event('input', { bubbles: true }));
                            targetSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                }).catch(() => { });
                console.log('      ✅ [Respon Metode Kirim] "Kurir Sendiri" terpilih.');

                await jedaManusia(3, 7, 'Muat Daftar Nama Kurir');

                // 4. NAMA KURIR (ng-select#id_staff)
                console.log('   👤 [4/6] Memilih Nama Kurir ("BAMBANG ADI SUROWINOTO")...');
                const ngSelectKurir = page.locator('ng-select#id_staff, ng-select[formcontrolname="id_staff"], ng-select[placeholder*="Pilih Kurir"]').first();
                await pilihNgSelectPresisi(ngSelectKurir, 'BAMBANG ADI', 'Nama Kurir');
                await jedaManusia(3, 6, 'Setelah Pilih Kurir');

                // 5. ALAMAT PENGIRIMAN (ng-select#alamat)
                console.log('   📍 [5/6] Memilih Alamat Pengiriman Satker...');
                const ngSelectAlamat = page.locator('ng-select#alamat, ng-select[formcontrolname="alamat"], ng-select[placeholder*="Pilih Alamat"]').first();
                await pilihNgSelectPresisi(ngSelectAlamat, '', 'Alamat Pengiriman');
                await jedaManusia(3, 6, 'Setelah Pilih Alamat');

                // 6. ISI CATATAN KURIR ("KIRIM")
                const inputCatatanKurir = page.locator('textarea[placeholder*="Masukkan Catatan"], textarea[placeholder*="Catatan"], textarea').first();
                if (await inputCatatanKurir.isVisible().catch(() => false)) {
                    const teksCatatanKirim = 'KIRIM';
                    console.log(`   ✍️ [6/6] Mengisi Catatan Kurir: "${teksCatatanKirim}"...`);
                    await gerakMouseManusia(inputCatatanKurir);
                    await inputCatatanKurir.click({ force: true });
                    await delay(300);
                    await inputCatatanKurir.fill('');
                    await inputCatatanKurir.fill(teksCatatanKirim);
                    await inputCatatanKurir.evaluate((el, val) => {
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.dispatchEvent(new Event('blur', { bubbles: true }));
                    }, teksCatatanKirim).catch(() => { });
                    console.log('      ✅ [Respon Catatan Kurir] Terisi "KIRIM".');
                    await jedaManusia(3, 7, 'Sebelum Klik Simpan Pengiriman');
                }

                // 7. SIMPAN DATA (#div-simpan button[title="Simpan Data"]:not([hidden]))
                console.log('   🟢 [Halaman 2 - REKAM DATA] Mengeklik tombol "✓ SIMPAN"...');
                const tombolSimpanSpesifik = page.locator('#div-simpan button[title="Simpan Data"]:not([hidden]), #div-input button[title="Simpan Data"]:not([hidden]), button[title="Simpan Data"]:not([hidden])').first();

                if (await tombolSimpanSpesifik.isVisible().catch(() => false)) {
                    await gerakMouseManusia(tombolSimpanSpesifik);
                    await tombolSimpanSpesifik.click({ force: true, timeout: 5000 }).catch(() => { });
                    console.log('      🖱️ [Respon Simpan] Klik fisik tombol Simpan dieksekusi.');
                }

                await delay(1000);
                await page.evaluate(() => {
                    const btn = document.querySelector('#div-simpan button[title="Simpan Data"]:not([hidden])') ||
                        document.querySelector('button[title="Simpan Data"]:not([hidden])');
                    if (btn) {
                        btn.scrollIntoView({ block: 'center' });
                        btn.click();
                        const linkParent = btn.closest('a');
                        if (linkParent) linkParent.click();
                    }
                }).catch(() => { });

                await jedaManusia(3, 7, 'Respon Server Simpan Pengiriman');

                const btnOkModalKirim = page.locator('.swal2-confirm, .modal.show button:has-text("OK"), button:has-text("Ya")').first();
                if (await btnOkModalKirim.isVisible().catch(() => false)) {
                    await gerakMouseManusia(btnOkModalKirim);
                    await btnOkModalKirim.evaluate(el => el.click()).catch(() => { });
                    console.log('   💬 [Respon Modal] Konfirmasi OK/Ya ditekan.');
                    await jedaManusia(3, 5, 'Tutup Modal Pengiriman');
                }

                console.log('   🎉 [Respon Tahap 3] Pengiriman berhasil disimpan!');
                await bukaHalaman(config.URLS.PENGIRIMAN);
            }
        }

        async function jalankanSiklus() {
            console.log(`\n========================================`);
            console.log(`🔄 Memulai Siklus Pengecekan: ${new Date().toLocaleTimeString('id-ID')}`);
            console.log(`========================================`);
            try {
                await prosesTahap1Nego();
                await jedaManusia(3, 7, 'Transisi Tahap 1 -> Tahap 2');

                await prosesTahap2Pengecekan();
                await jedaManusia(3, 7, 'Transisi Tahap 2 -> Tahap 3');

                await prosesTahap3Pengiriman();
            } catch (err) {
                console.error('⚠️ [Error Siklus] Kendala saat eksekusi:', err.message);
            }
        }

        async function mulaiBot() {
            while (true) {
                await jalankanSiklus();
                const jedaWaktu = (config.INTERVAL_MENIT > 0) ? config.INTERVAL_MENIT : 1;
                console.log(`\n💤 [Siklus Selesai] Menunggu ${jedaWaktu} menit sebelum siklus berikutnya...`);
                await delay(jedaWaktu * 60 * 1000);
            }
        }

        mulaiBot();

    } catch (fatalError) {
        console.error('\n🔥 TERJADI ERROR FATAL:');
        console.error(fatalError);
    }
})();