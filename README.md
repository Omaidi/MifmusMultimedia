# Panduan Menjalankan Twibbon Haflah

Aplikasi Twibbon ini adalah website statis yang bisa dijalankan langsung di browser, namun disarankan menggunakan **Local Server** agar fitur download gambar berfungsi dengan baik (karena kebijakan keamanan browser terkait Canvas).

## Cara Menjalankan

### Cara 1: Menggunakan Script Otomatis (Rekomendasi)
Jika di laptop Anda sudah terinstall Python, cukup klik dua kali file:
`start_server.bat`
(Saya akan buatkan file ini untuk Anda).

### Cara 2: VS Code Live Server
Jika Anda menggunakan Visual Studio Code:
1. Install ekstensi "Live Server".
2. Buka file `index.html`.
3. Klik kanan -> "Open with Live Server".

### Cara 3: Buka Langsung (Fitur Download Mungkin Terbatas)
1. Buka folder `d:\TWIBBON`.
2. Klik dua kali file `index.html`.
*Catatan: Jika tombol download tidak berfungsi, gunakan Cara 1 atau 2.*

## Cara Mengganti Frame
1. Siapkan desain frame Twibbon Anda (format PNG transparan, ukuran rekomendasi 1080x1080px).
2. Beri nama file tersebut `frame.png`.
3. Ganti file yang ada di folder `assets/frame.png` dengan file baru Anda.

## Catatan Penting untuk Pengguna (Troubleshooting)

### Link Tidak Bisa Di-download?
Jika Anda membagikan link ini di WhatsApp, Instagram, atau Facebook, terkadang tombol download tidak berfungsi karena "In-App Browser".
**Solusi:**
Minta pengguna untuk menekan titik tiga di pojok kanan atas dan pilih **"Buka di Chrome"** atau **"Open in Browser"**.

### Gambar Tidak Muncul?
Pastikan file gambar `assets/frame.png` atau file `assets/Siap Sukseskan.png` tersedia dan namanya sesuai. Aplikasi ini memprioritaskan `Siap Sukseskan.png`.

