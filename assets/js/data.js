/**
 * @fileoverview Data layer for Djeroe Coffee website.
 * Contains catalog items, cafe ambiance profiles, category schemas, and navigation scene configs.
 * Implements immutable data structures to prevent runtime side-effects.
 */

(function (global) {
  'use strict';

  /**
   * @typedef {Object} MenuItem
   * @property {string} id - Unique identifier for the menu item
   * @property {string} name - Display title
   * @property {string} desc - Culinary description
   * @property {string} price - Formatted price string (e.g. '28K')
   * @property {'Kopi'|'Non-Kopi'|'Camilan'|'Makanan'} cat - Category name
   * @property {string} tag - Badge tag ('Signature'|'Klasik'|'Favorit'|'')
   * @property {string} note - Serving temperature or portion note
   * @property {string} em - Emoji icon fallback
   * @property {string} img - Optimized WebP image path
   */

  /**
   * Complete menu catalog containing 24 artisanal offerings.
   * @type {ReadonlyArray<MenuItem>}
   */
  const MENU_DATA = Object.freeze([
    // =========================================================================
    // KOPI (8 items)
    // =========================================================================
    {
      id: 'k1',
      name: 'Es Kopi Susu Djeroe',
      desc: 'Espresso double shot, susu segar, dan gula aren organik khas Djeroe.',
      price: '28K',
      cat: 'Kopi',
      tag: 'Signature',
      note: 'Dingin / Hangat',
      em: '☕',
      img: 'assets/images/menu-k1.webp'
    },
    {
      id: 'k2',
      name: 'Kopi Tubruk Jero',
      desc: 'Seduhan tradisional biji Robusta dampit, pekat, harum, dan berkarakter.',
      price: '18K',
      cat: 'Kopi',
      tag: 'Klasik',
      note: 'Hangat',
      em: '🫖',
      img: 'assets/images/menu-k2.webp'
    },
    {
      id: 'k3',
      name: 'V60 Single Origin',
      desc: 'Biji pilihan Nusantara (Gayo / Ijen / Toraja), seduh manual sabar.',
      price: '32K',
      cat: 'Kopi',
      tag: 'Signature',
      note: 'Manual Brew',
      em: '⚗️',
      img: 'assets/images/menu-k3.webp'
    },
    {
      id: 'k4',
      name: 'Flat White',
      desc: 'Dua shot ristretto dengan microfoam susu lembut yang seimbang.',
      price: '30K',
      cat: 'Kopi',
      tag: 'Signature',
      note: 'Hangat',
      em: '🥛',
      img: 'assets/images/menu-k4.webp'
    },
    {
      id: 'k5',
      name: 'Americano On Rocks',
      desc: 'Double espresso disajikan di atas es batu, segar dan bersih di tenggorokan.',
      price: '22K',
      cat: 'Kopi',
      tag: '',
      note: 'Dingin / Hangat',
      em: '🧊',
      img: 'assets/images/menu-k5.webp'
    },
    {
      id: 'k6',
      name: 'Cold Brew Senja',
      desc: 'Fermentasi dingin 16 jam, aroma buah persik, aftertaste manis alami.',
      price: '32K',
      cat: 'Kopi',
      tag: 'Signature',
      note: 'Dingin Segar',
      em: '⏳',
      img: 'assets/images/menu-k6.webp'
    },
    {
      id: 'k7',
      name: 'Caramel Macchiato',
      desc: 'Espresso harum berpadu sirup vanilla dan siraman saus karamel gurih.',
      price: '34K',
      cat: 'Kopi',
      tag: 'Favorit',
      note: 'Dingin / Hangat',
      em: '🍯',
      img: 'assets/images/menu-k7.webp'
    },
    {
      id: 'k8',
      name: 'Affogato Klasik',
      desc: 'Satu scoop gelato vanila artisan disiram espresso pekat panas.',
      price: '26K',
      cat: 'Kopi',
      tag: '',
      note: 'Dessert Kopi',
      em: '🍨',
      img: 'assets/images/menu-k8.webp'
    },

    // =========================================================================
    // NON-KOPI (6 items)
    // =========================================================================
    {
      id: 'nk1',
      name: 'Es Jeruk Djeroe',
      desc: 'Jeruk peras lokal segar, madu murni hutan, dan daun mint petik sendiri.',
      price: '24K',
      cat: 'Non-Kopi',
      tag: 'Signature',
      note: 'Dingin Segar',
      em: '🍊',
      img: 'assets/images/menu-nk1.webp'
    },
    {
      id: 'nk2',
      name: 'Matcha Gula Aren',
      desc: 'Matcha Uji Jepang berpadu susu creamy dan manis lembut aren.',
      price: '30K',
      cat: 'Non-Kopi',
      tag: 'Signature',
      note: 'Dingin / Hangat',
      em: '🍵',
      img: 'assets/images/menu-nk2.webp'
    },
    {
      id: 'nk3',
      name: 'Cokelat Pekat Nusantara',
      desc: 'Kakao artisan Sulawesi 70%, rasa cokelat kental dan creamy rumahan.',
      price: '27K',
      cat: 'Non-Kopi',
      tag: 'Signature',
      note: 'Dingin / Hangat',
      em: '🍫',
      img: 'assets/images/menu-nk3.webp'
    },
    {
      id: 'nk4',
      name: 'Teh Susu Rempah',
      desc: 'Teh hitam seduh dengan kayu manis, kapulaga, dan jahe emprit bakar.',
      price: '25K',
      cat: 'Non-Kopi',
      tag: 'Signature',
      note: 'Hangat',
      em: '🧋',
      img: 'assets/images/menu-nk4.webp'
    },
    {
      id: 'nk5',
      name: 'Berry Sparkler',
      desc: 'Campuran sari buah beri liar alami, lemon splash, dan soda dingin.',
      price: '26K',
      cat: 'Non-Kopi',
      tag: 'Favorit',
      note: 'Dingin Segar',
      em: '🍓',
      img: 'assets/images/menu-nk5.webp'
    },
    {
      id: 'nk6',
      name: 'Earl Grey Lavender',
      desc: 'Seduhan teh earl grey beraroma lavender menenangkan dan citrus.',
      price: '24K',
      cat: 'Non-Kopi',
      tag: '',
      note: 'Hangat / Dingin',
      em: '🪻',
      img: 'assets/images/menu-nk6.webp'
    },

    // =========================================================================
    // CAMILAN (6 items)
    // =========================================================================
    {
      id: 'c1',
      name: 'Croissant Mentega',
      desc: 'Renyah berlapis di luar, lembut di dalam dengan mentega murni Prancis.',
      price: '26K',
      cat: 'Camilan',
      tag: 'Favorit',
      note: 'Fresh Baked',
      em: '🥐',
      img: 'assets/images/menu-c1.webp'
    },
    {
      id: 'c2',
      name: 'Pisang Goreng Keju',
      desc: 'Pisang kepok manis renyah dengan lelehan keju cheddar dan cokelat.',
      price: '22K',
      cat: 'Camilan',
      tag: 'Signature',
      note: 'Porsi Berbagi',
      em: '🍌',
      img: 'assets/images/menu-c2.webp'
    },
    {
      id: 'c3',
      name: 'Roti Bakar Djeroe',
      desc: 'Roti brioche tebal bakar arang, selai srikaya pandan & mentega gurih.',
      price: '24K',
      cat: 'Camilan',
      tag: 'Signature',
      note: 'Manis Gurih',
      em: '🍞',
      img: 'assets/images/menu-c3.webp'
    },
    {
      id: 'c4',
      name: 'Kue Hari Ini',
      desc: 'Kreasi cake harian dari dapur Djeroe — tanyakan pada barista kami.',
      price: '28K',
      cat: 'Camilan',
      tag: '',
      note: 'Fresh Daily',
      em: '🍰',
      img: 'assets/images/menu-c4.webp'
    },
    {
      id: 'c5',
      name: 'Singkong Bawang Crispy',
      desc: 'Singkong empuk gurih berbumbu bawang ketumbar dengan sambal roa.',
      price: '20K',
      cat: 'Camilan',
      tag: 'Favorit',
      note: 'Gurih Renyah',
      em: '🥔',
      img: 'assets/images/menu-c5.webp'
    },
    {
      id: 'c6',
      name: 'Tahu Walik Krispi',
      desc: 'Tahu walik isi adonan ayam kenyal gurih, disajikan dengan kecap rawit.',
      price: '24K',
      cat: 'Camilan',
      tag: 'Signature',
      note: 'Pedas Gurih',
      em: '🥟',
      img: 'assets/images/menu-c6.webp'
    },

    // =========================================================================
    // MAKANAN (4 items)
    // =========================================================================
    {
      id: 'm1',
      name: 'Nasi Goreng Rempah',
      desc: 'Nasi goreng harum rempah khas Djeroe, telur mata sapi, kerupuk & acar.',
      price: '36K',
      cat: 'Makanan',
      tag: 'Signature',
      note: 'Porsi Kenyang',
      em: '🍛',
      img: 'assets/images/menu-m1.webp'
    },
    {
      id: 'm2',
      name: 'Mie Godhog Djeroe',
      desc: 'Mie kuah kaldu ayam kampung kental gurih, suwiran ayam, sawi & telur.',
      price: '34K',
      cat: 'Makanan',
      tag: 'Signature',
      note: 'Hangat Berkuah',
      em: '🍜',
      img: 'assets/images/menu-m2.webp'
    },
    {
      id: 'm3',
      name: 'Nasi Ayam Bakar Madu',
      desc: 'Ayam bakar ungkep madu ketumbar, nasi pulen hangat, sambal terasi.',
      price: '38K',
      cat: 'Makanan',
      tag: 'Favorit',
      note: 'Lengkap Sambal',
      em: '🍗',
      img: 'assets/images/menu-m3.webp'
    },
    {
      id: 'm4',
      name: 'Iga Bakar Rempah Djeroe',
      desc: 'Iga sapi empuk bakar bumbu rempah manis gurih, kuah sup segar & sambal.',
      price: '48K',
      cat: 'Makanan',
      tag: 'Favorit',
      note: 'Porsi Kenyang',
      em: '🍖',
      img: 'assets/images/menu-m4.webp'
    }
  ]);

  /**
   * Category labels with contextual iconography.
   * @type {Readonly<Record<string, string>>}
   */
  const CATEGORY_LABELS = Object.freeze({
    'Kopi': '☕ Kopi',
    'Non-Kopi': '🍊 Non-Kopi',
    'Camilan': '🥐 Camilan',
    'Makanan': '🍛 Makanan',
    'Menu Lengkap': '✦ Menu Lengkap'
  });

  /**
   * Ordered sequence of menu category keys for tab rendering.
   * @type {ReadonlyArray<string>}
   */
  const CATEGORY_KEYS = Object.freeze([
    'Kopi',
    'Non-Kopi',
    'Camilan',
    'Makanan',
    'Menu Lengkap'
  ]);

  /**
   * @typedef {Object} AmbianceItem
   * @property {number} id - Numeric sequence ID
   * @property {string} number - Padded index representation (e.g. '01')
   * @property {string} title - Ambiance corner name
   * @property {string} desc - Sensory narrative
   * @property {string} colorStart - Primary gradient hue (CSS color)
   * @property {string} colorEnd - Secondary gradient hue (CSS color)
   * @property {string} image - Background photography asset
   * @property {string} alt - Accessibility alt description
   */

  /**
   * Featured architectural & sensory corners of Djeroe cafe.
   * @type {ReadonlyArray<AmbianceItem>}
   */
  const AMBIANCE_DATA = Object.freeze([
    {
      id: 1,
      number: '01',
      title: 'Teras Pagi',
      desc: 'Cahaya pertama, aroma kopi hangat, dan ketenangan pagi luar ruangan.',
      colorStart: '#3a1f13',
      colorEnd: '#190b06',
      image: 'assets/images/suasana-1.webp',
      alt: 'Teras Pagi kafe Djeroe berlimpah cahaya matahari terbit'
    },
    {
      id: 2,
      number: '02',
      title: 'Ruang Dalam',
      desc: 'Sudut tenang beraroma sangrai untuk kerja, membaca, dan fokus.',
      colorStart: '#2e180e',
      colorEnd: '#120703',
      image: 'assets/images/suasana-2.webp',
      alt: 'Ruang dalam kafe dengan suasana tenang dan wangi biji kopi'
    },
    {
      id: 3,
      number: '03',
      title: 'Meja Panjang',
      desc: 'Kayu jati tua, tempat obrolan hangat dan tawa bergulir bersama teman.',
      colorStart: '#341b10',
      colorEnd: '#160a05',
      image: 'assets/images/suasana-3.webp',
      alt: 'Meja panjang kayu jati untuk berkumpul dan berbincang'
    },
    {
      id: 4,
      number: '04',
      title: 'Sudut Senja',
      desc: 'Lampu temaram senja, pekatnya kopi, dan cerita nostalgia di penghujung hari.',
      colorStart: '#26130a',
      colorEnd: '#0a0402',
      image: 'assets/images/suasana-4.webp',
      alt: 'Sudut senja berlampu temaram hangat untuk menutup hari'
    }
  ]);

  /**
   * Scene navigation architecture configuration.
   * Defines titles, URI anchors, and background orb floating coordinates.
   */
  const SCENE_CONFIG = Object.freeze({
    names: Object.freeze(['Beranda', 'Tentang', 'Menu', 'Suasana', 'Kontak']),
    ids: Object.freeze(['beranda', 'tentang', 'menu', 'suasana', 'kontak']),
    positions: Object.freeze([
      Object.freeze([30, -10, 0.7, -30, 25, 1]),
      Object.freeze([-28, 10, 0.9, 30, -20, 1.2]),
      Object.freeze([25, 25, 1.1, -35, -10, 0.8]),
      Object.freeze([-20, -20, 0.8, 25, 30, 1.3]),
      Object.freeze([35, 5, 1, -25, 20, 0.9])
    ]),
    tickerPhrases: Object.freeze([
      'Kopi Susu Djeroe',
      'Seduh dengan sabar',
      'Teman ngobrol',
      'Senja di dalam'
    ])
  });

  // Export to namespace
  global.Djeroe = global.Djeroe || {};
  global.Djeroe.Data = Object.freeze({
    MENU_DATA,
    CATEGORY_LABELS,
    CATEGORY_KEYS,
    AMBIANCE_DATA,
    SCENE_CONFIG
  });

  // Global backward-compatibility shortcuts
  global.MENU_DATA = MENU_DATA;
  global.AMBIANCE_DATA = AMBIANCE_DATA;
  global.CATEGORY_LABELS = CATEGORY_LABELS;
  global.CATEGORY_KEYS = CATEGORY_KEYS;
  global.SCENE_CONFIG = SCENE_CONFIG;

})(typeof window !== 'undefined' ? window : this);
