# Panduan Upload ke GitHub Pages

Ya, website ini **SANGAT BISA** dionlinekan menggunakan GitHub Pages (Gratis selamanya).

## Langkah 1: Pastikan Git Terinstall
Tadi saya cek sepertinya **Git belum terinstall** atau belum dikenali di laptop Anda.
1. Download Git di: [git-scm.com/downloads](https://git-scm.com/downloads) kemudian install.
2. Setelah install, restart terminal/laptop.

## Langkah 2: Buat Repository di GitHub
1. Login ke [GitHub.com](https://github.com).
2. Klik tombol **+** di pojok kanan atas -> **New repository**.
3. Nama Repository: `twibbon-haflah` (atau bebas).
4. Pilih **Public**.
5. **JANGAN** centang "Add a README file" (biarkan kosong).
6. Klik **Create repository**.

## Langkah 3: Upload Kode
Buka terminal di folder `d:\TWIBBON` (Klik kanan di folder -> **Open Git Bash Here** atau **Open in Terminal**), lalu ketik satu per satu:

```bash
git init
git add .
git commit -m "Upload Twibbon"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/twibbon-haflah.git
git push -u origin main
```
*(Ganti `USERNAME-ANDA` dengan username GitHub Anda sesuai link yang muncul di Langkah 2)*

## Alternatif: Upload Manual (Tanpa Command Line)
Jika cara di atas susah:
1. Di halaman Repository GitHub Anda, cari link **Need help? Upload files**.
2. Drag & Drop semua file dari folder `d:\TWIBBON` (index.html, style.css, script.js, folder assets) ke halaman tersebut.
3. Klik **Commit changes**.

## Langkah 4: Aktifkan Website (GitHub Pages)
1. Di halaman repository GitHub Anda, klik tab **Settings**.
2. Di menu kiri, pilih **Pages**.
3. Pada bagian **Build and deployment** > **Branch**, pilih **main** dan folder **/(root)**.
4. Klik **Save**.

Tunggu sekitar 1-2 menit. Link website Anda akan muncul di bagian atas halaman tersebut (contoh: `https://username-anda.github.io/twibbon-haflah/`).
