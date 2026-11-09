# ☕ Djeroe. — Kopi, Teman & Senja

> *Ruang di dalam, tempat obrolan jadi lebih hangat.*

Sebuah website interaktif bertema kafe kopi modern bernuansa *dark coffee brown*, dirancang dengan pengalaman visual imersif, tipografi elegan (*Fraunces Serif* & *DM Sans*), performa ultra-ringan (60+ FPS di mobile & desktop), dan arsitektur kode modular bersih.

---

## 🌟 Fitur Utama & Pengalaman Interaktif

- **🎬 Dynamic Splash Preloader**: Loading awal interaktif dengan persentase *real-time* (0%–100%) dan animasi tirai singkap (*wipe transition*) elegan.
- **〰️ Rhythmic Brand Typography**: Huruf judul *Djeroe.* bergerak bergelombang (*staggered wave*) secara ritmis dan interaktif saat disentuh kursor.
- **✨ 5 Interactive Scenes Navigation**:
  1. **Beranda**: *Hero section* hangat dengan cangkir kopi mengepul beranimasi uap dan tombol aksi dinamis berbalon fluida.
  2. **Tentang**: Cerita filosofi nama *Djeroe* ("di dalam") serta metrik kualitas kopi Nusantara yang terhitung dinamis (*animated counter*).
  3. **Menu Lengkap & Pilihan**: Katalog 24 varian menu (Kopi, Non-Kopi, Camilan, Makanan) dilengkapi filter kategori instan, pencarian *live search* ter-debounce, dan kartu 3D *tilt-perspective*.
  4. **Suasana (*Ambiance*)**: Galeri akordeon 4 sudut favorit kafe (*Teras Pagi*, *Ruang Dalam*, *Meja Panjang*, *Sudut Senja*) dengan foto kafe estetik dan efek *zoom*.
  5. **Kontak**: Jam operasional dan tautan cepat ke Instagram, WhatsApp Reservasi, Email, serta Google Maps dengan ikon *badge* modern yang responsif.
- **🖱️ Event-Driven Magnetic Cursor**: Kursor cincin aksen karamel pintar yang otomatis tidur saat kursor diam (0% beban CPU) dan otomatis dinonaktifkan di perangkat layar sentuh/mobile.
- **📱 Fully Responsive**: Tampilan adaptif dan nyaman dinavigasi baik di perangkat *desktop*, tablet, maupun *mobile smartphone*.

---

## ⚡ Hasil Optimasi Performa (Multi-Agent Refactoring)

Website ini telah melalui refactoring menyeluruh menggunakan arsitektur **Multi-Agent**:

1. **GPU & Rasterization Optimization**:
   - Menghapus filter SVG `<feTurbulence>` fullscreen pada latar belakang grain dan menggantinya dengan tekstur mikro WebP statis hardware-tiled (`assets/images/grain.webp`, 5.3 KB).
   - Menghilangkan beban berat `filter: blur(40px)` pada elemen `.orb` ambient 75vmax dan menggantinya dengan *native multi-stop radial gradients* (0px blur cost, menghemat VRAM dan GPU fill-rate drastis).
   - Mengeliminasi 70+ layer `backdrop-filter: blur(...)` bersarang pada kartu menu, badge kategori, dan tag, digantikan dengan palet warna opaque/semi-transparan elegan `--card: rgba(28, 14, 9, 0.92)`.
   - Mengaktifkan `contain: strict;` dan `content-visibility: auto;` pada container kartu dan panggung dekorasi untuk isolasi layout dan paint engine browser.

2. **JavaScript Event Loop & Battery Optimization**:
   - Loop `requestAnimationFrame` kursor yang sebelumnya berjalan 24/7 diubah menjadi *event-driven auto-sleeping loop* (berhenti otomatis saat mouse diam sub-pixel < 0.08px).
   - Penonaktifan total sistem custom cursor di perangkat sentuh/HP (`(hover: hover) and (pointer: fine)`), menghemat 100% konsumsi baterai & CPU di mobile.
   - Pemasangan opsi `{ passive: true }` di seluruh event listeners scroll, wheel, touch, resize, dan mousemove.
   - Guard isolasi navigasi keyboard agar tidak memicu perpindahan layar saat pengguna mengetik di bilah pencarian menu.

3. **Ukuran File & Modul Bersih**:
   - `index.html`: Berkurang dari 2.294 baris (75.5 KB) menjadi ~214 baris (10.7 KB).
   - Gaya CSS dipisah terstruktur ke `assets/css/` (`variables.css`, `base.css`, `components.css`, `animations.css`).
   - Logika JavaScript dipisah modular ke `assets/js/` (`data.js`, `cursor.js`, `menu.js`, `navigation.js`, `app.js`).

---

## 📁 Struktur Berkas

```
Djeroe/
├── index.html                  # Dokumen HTML semantik utama (~214 baris)
├── README.md                   # Dokumentasi proyek & panduan pengembangan
├── .gitignore
└── assets/
    ├── css/
    │   ├── variables.css       # Token warna, tipografi, dan easing
    │   ├── base.css            # Reset, layout dasar, stage ambient, dan grain
    │   ├── components.css      # Header, scene hero, kartu menu, panel suasana
    │   └── animations.css      # Keyframes dan preferensi reduced-motion
    ├── js/
    │   ├── data.js             # Data immutable 24 menu, suasana, dan config
    │   ├── cursor.js           # Smart event-driven sleeping cursor & magnetic pull
    │   ├── menu.js             # Filter kategori, live search, dan 3D tilt
    │   ├── navigation.js       # State machine perpindahan layar, gesture & URL hash
    │   └── app.js              # Entry point bootstrap, preloader, dan dekorasi
    └── images/
        ├── grain.webp          # Tekstur grain ringan hardware-tiled
        ├── menu-*.webp         # Aset foto 24 menu kuliner
        └── suasana-*.webp      # Aset foto 4 sudut suasana kafe
```

---

## 🚀 Menjalankan Secara Lokal

Cukup buka berkas `index.html` langsung di browser favorit Anda (Google Chrome, Firefox, Safari, Edge) tanpa perlu build tools:

```bash
# Opsi 1: Buka langsung file index.html
start index.html

# Opsi 2: Menggunakan server statis lokal (opsional)
npx serve .
```

---

## 🛠️ Teknologi yang Digunakan

- **HTML5 & Vanilla CSS3** (CSS Custom Properties, Flexbox, CSS Grid, Content-Visibility, Hardware Compositing)
- **Vanilla JavaScript (ES6+)** (Event-driven Architecture, RequestAnimationFrame Lifecycle, Passive Listeners)
- **Google Fonts** (*Fraunces Serif* & *DM Sans*)
- **WebP Modern Image Formats** (Lossless micro-grain & compressed culinary photography)

---

## 📄 Lisensi

Dibuat dengan ❤️ untuk penikmat kopi dan cerita hangat di **Djeroe**.
