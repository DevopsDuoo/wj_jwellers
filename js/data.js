/**
 * WJ Jewellers - Data Store, Catalog, Indian Jewelry Curation & Live Bullion API Sync
 * Heritage Gold, Diamonds & Polki · Established 1984
 */

const STORAGE_KEYS = {
  PRODUCTS: 'wj_products_v2',
  STAFF: 'wj_staff_payroll_v2',
  LEDGER: 'wj_shop_ledger_v2',
  INQUIRIES: 'wj_inquiries_v2',
  RATES: 'wj_metal_rates_v2',
  WISHLIST: 'wj_wishlist_v2',
  CURRENCY: 'wj_currency_v2',
  SESSION: 'wj_admin_session_v2',
  THEME: 'wj_theme_mode_v2',
  PALETTE: 'wj_palette_theme_v2'
};

const PALETTES = {
  burgundy: {
    id: 'burgundy',
    name: 'Imperial Burgundy & Rose Gold',
    desc: 'Royal Wedding Wine Velvet & Warm Gold',
    colorHex: '#250A11',
    accentHex: '#E8B676'
  }
};

const CURRENCIES = {

  INR: { symbol: '₹', rate: 83.50, label: 'INR (₹)', code: 'INR' },
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)', code: 'GBP' },
  AED: { symbol: 'AED ', rate: 3.67, label: 'AED', code: 'AED' }
};

const DEFAULT_RATES = {
  gold24k: { name: '24K Pure Gold (999)', priceUsdPerGram: 76.50, change: '+0.85%' },
  gold22k: { name: '22K Hallmark Gold (916)', priceUsdPerGram: 70.07, change: '+0.85%' },
  gold18k: { name: '18K Jewelry Gold (750)', priceUsdPerGram: 57.38, change: '+0.85%' },
  platinum950: { name: 'Platinum (Pt 950)', priceUsdPerGram: 33.20, change: '-0.15%' },
  silver999: { name: 'Fine Silver (Ag 999)', priceUsdPerGram: 0.95, change: '+1.10%' },
  lastUpdated: new Date().toISOString(),
  source: 'Automated Daily Bullion Feed',
  autoSync: true
};

const DEFAULT_PRODUCTS = [
  {
    id: 'wj-prod-01',
    sku: 'WJ-JAD-001',
    name: 'The Royal Rajputana Nizam Jadau Polki Choker Suite',
    category: 'polki',
    categoryName: 'Polki & Kundan',
    price: 36500,
    metalPurity: '22K Yellow Gold (916 BIS Laser Hallmarked)',
    grossWeight: '152.40 g',
    netGoldWeight: '118.20 g',
    gemstones: 'Uncut Syndicate Polki Diamonds (19.40 ct), Natural Zambian Emerald Droplets (32.50 ct), Graded Basra Pearls',
    diamondGrade: 'Natural Syndicate Polki (High Transparency & Fire)',
    certification: 'BIS 916 Hallmark Registry & GTL Certified',
    makingCharges: '18% Traditional Jadau Kundan Benchwork included',
    description: 'An imperial heirloom masterpiece crafted over 240 artisan hours by WJ master craftsmen. Features open-setting syndicate polki stones embraced by deep verdant Zambian emerald droplets, bordered by royal Basra pearls and finished with miniature peacock Meenakari enameling on the reverse.',
    stockQty: 2,
    status: 'In Stock',
    image: 'assets/indian_jadau_choker.jpg',
    featured: true,
    indianType: 'Polki Choker'
  },
  {
    id: 'wj-prod-02',
    sku: 'WJ-TMP-002',
    name: 'Imperial 22K Temple Nakashi Peacock Kada Pair',
    category: 'bangles',
    categoryName: 'Gold Bangles & Kadas',
    price: 16800,
    metalPurity: '22K Solid Yellow Gold (916 BIS Hallmarked)',
    grossWeight: '94.60 g',
    netGoldWeight: '92.10 g',
    gemstones: 'Natural Burmese Ruby Cabochons (4.80 ct) & Solid 22K Gold',
    diamondGrade: 'N/A - Solid Investment Temple Gold',
    certification: 'Government Recognized BIS Hallmark 916',
    makingCharges: '12% Hand-Chased Nakashi Relief included',
    description: 'A grand pair of heavy antique temple kadas featuring handcrafted high-relief peacock motifs and floral nakashi filigree, accented with natural ruby cabochons and secured with traditional antique screw clasps.',
    stockQty: 3,
    status: 'In Stock',
    image: 'assets/indian_temple_kadas.jpg',
    featured: true,
    indianType: 'Temple Kada'
  },
  {
    id: 'wj-prod-03',
    sku: 'WJ-BRD-003',
    name: 'The Maharani Bikaner Emerald & Polki Grand Bridal Suite',
    category: 'bridal',
    categoryName: 'Bridal Sets',
    price: 44200,
    metalPurity: '22K Yellow Gold (916 Hallmarked)',
    grossWeight: '186.20 g',
    netGoldWeight: '142.50 g',
    gemstones: 'Syndicate Polki (26.80 ct), Emerald Drop Melons (42.00 ct), Matching Jhumkas & Maang Tikka',
    diamondGrade: 'Natural Uncut Heritage Polki',
    certification: 'GIA Sealed Dossier & BIS Hallmark Seal',
    makingCharges: '20% Complete Royal Suite Handcrafting included',
    description: 'The ultimate royal bridal ensemble from WJ Jewellers. Includes a grand multi-tier Polki collar choker, matching articulated chandelier Jhumka earrings, and a crowned Maang Tikka. Finished with 24K gold foil setting and royal ruby accents.',
    stockQty: 1,
    status: 'In Stock',
    image: 'assets/indian_bridal_hero.jpg',
    featured: true,
    indianType: 'Grand Bridal Suite'
  },
  {
    id: 'wj-prod-04',
    sku: 'WJ-RNG-004',
    name: 'Royal Cushion Solitaire & Pavé Halo Diamond Cocktail Ring',
    category: 'diamonds',
    categoryName: 'Diamond Rings',
    price: 24800,
    metalPurity: '18K Yellow Gold with Intricate Hand-Engraved Gallery',
    grossWeight: '9.80 g',
    netGoldWeight: '8.90 g',
    gemstones: '3.10 ct Cushion Brilliant Cut Diamond + 0.65 ct Micro-Pavé Rose-Cut Halo',
    diamondGrade: 'VVS1 Clarity, E Color, Triple Excellent Symmetry',
    certification: 'GIA Laser Inscription 219482015',
    makingCharges: '14% Royal Benchwork included',
    description: 'A regal cocktail ring inspired by royal Indian treasuries. A magnificent 3.10-carat cushion-cut diamond framed by a double row of micro-pavé diamonds with hand-chased filigree shoulders in rich 18K yellow gold.',
    stockQty: 2,
    status: 'In Stock',
    image: 'assets/indian_diamond_ring.jpg',
    featured: true,
    indianType: 'Royal Solitaire'
  },
  {
    id: 'wj-prod-05',
    sku: 'WJ-EAR-005',
    name: 'Kundan & South Sea Pearl Chandbali Bridal Jhumkas',
    category: 'bridal',
    categoryName: 'Bridal Sets',
    price: 9800,
    metalPurity: '22K Yellow Gold (916 BIS)',
    grossWeight: '42.60 g',
    netGoldWeight: '36.20 g',
    gemstones: 'Bikaner Kundan Polki (6.80 ct), Natural South Sea Pearls, Ruby Drops (3.20 ct)',
    diamondGrade: 'Natural Heritage Kundan',
    certification: 'BIS Hallmark 916 Stamped',
    makingCharges: '15% Articulated Filigree included',
    description: 'Traditional crescent moon Chandbali earrings paired with tiered bell jhumkas, embellished with clusters of Basra seed pearls and dancing ruby droplets.',
    stockQty: 4,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
    featured: true,
    indianType: 'Chandbali Jhumkas'
  },
  {
    id: 'wj-prod-06',
    sku: 'WJ-PLK-006',
    name: 'Mughal Navratna & Uncut Polki Heritage Haar',
    category: 'polki',
    categoryName: 'Polki & Kundan',
    price: 31500,
    metalPurity: '22K Gold with Hand-Rubbed Antique Patina',
    grossWeight: '128.50 g',
    netGoldWeight: '96.20 g',
    gemstones: 'Nine Planetary Auspicious Gems (Navratna 14.50 ct) & Syndicate Polki (15.20 ct)',
    diamondGrade: 'Certified Natural Navratna Gemstones',
    certification: 'BIS Hallmark & Gemological Laboratory Registry',
    makingCharges: '19% Included',
    description: 'An astrological and imperial triumph featuring the nine sacred gemstones arranged with syndicate polki diamonds in an articulated cascading necklace, held by silk dori cords with gold beads.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
    featured: false,
    indianType: 'Navratna Haar'
  },
  {
    id: 'wj-prod-07',
    sku: 'WJ-BNG-007',
    name: 'Antique 22K Gold Nakashi Floral Chudi Set (4 Pieces)',
    category: 'bangles',
    categoryName: 'Gold Bangles & Kadas',
    price: 18400,
    metalPurity: '22K Solid Yellow Gold (916 BIS)',
    grossWeight: '108.00 g',
    netGoldWeight: '108.00 g',
    gemstones: 'Solid 22K Gold (Zero Stones)',
    diamondGrade: 'N/A - Pure Gold Bullion Masterpiece',
    certification: 'BIS Hallmark 916 Laser Marked',
    makingCharges: '11% Included',
    description: 'A set of four matching antique finished bangles featuring delicate floral wirework and hand-carved repoussé beads, designed to accompany royal wedding attire.',
    stockQty: 3,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=80',
    featured: false,
    indianType: 'Nakashi Chudi'
  },
  {
    id: 'wj-prod-08',
    sku: 'WJ-RNG-008',
    name: 'The Koh-i-Noor Inspired Solitaire Engagement Ring (3.50ct)',
    category: 'diamonds',
    categoryName: 'Diamond Rings',
    price: 32000,
    metalPurity: '18K White Gold & 950 Platinum Prongs',
    grossWeight: '7.80 g',
    netGoldWeight: '7.10 g',
    gemstones: '3.50 ct Round Brilliant Cut Diamond + 0.40 ct Pavé Band',
    diamondGrade: 'VVS1, D Color, Hearts & Arrows Cut',
    certification: 'GIA Laser Inscription Dossier',
    makingCharges: '12% Platinum Setting included',
    description: 'Flawless brilliance in a regal crown setting. An exquisite D-color 3.50 ct natural diamond with fire and scintillation unmatched in fine jewelry.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
    featured: false,
    indianType: 'Solitaire Ring'
  },
  {
    id: 'wj-prod-09',
    sku: 'WJ-RNG-009',
    name: 'Vanki Peacock Diamond & Pigeon-Blood Ruby Ring',
    category: 'diamonds',
    categoryName: 'Diamond Rings',
    price: 14200,
    metalPurity: '18K Yellow Gold',
    grossWeight: '8.40 g',
    netGoldWeight: '7.20 g',
    gemstones: 'Burmese Ruby Cabochon (3.20 ct), Tapered Baguette Diamonds (1.40 ct)',
    diamondGrade: 'VS1, F Color / Unheated Natural Ruby',
    certification: 'GIA & IGI Certified',
    makingCharges: '14% Included',
    description: 'An authentic South Indian Vanki V-shaped ring celebrating femininity and heritage with a fiery central ruby accented by winged diamond pavé.',
    stockQty: 3,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=900&q=80',
    featured: false,
    indianType: 'Vanki Ring'
  },
  {
    id: 'wj-prod-10',
    sku: 'WJ-BRD-010',
    name: 'Celestial Diamond Waterfall Choker & Earring Suite',
    category: 'bridal',
    categoryName: 'Bridal Sets',
    price: 48500,
    metalPurity: '18K White Gold (750)',
    grossWeight: '98.50 g',
    netGoldWeight: '84.20 g',
    gemstones: 'Natural Diamonds (26.40 ct Total), Graduated Pear & Marquise Cascades',
    diamondGrade: 'VVS1 Clarity, E-F Color, Triple Excellent',
    certification: 'IGI Certified Diamond Passport',
    makingCharges: '16% Included',
    description: 'An ethereal diamond waterfall choker contoured to gracefully sit upon the décolletage, paired with matching shoulder-duster earrings.',
    stockQty: 1,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=900&q=80',
    featured: true,
    indianType: 'Diamond Choker'
  },
  {
    id: 'wj-prod-11',
    sku: 'WJ-TMP-011',
    name: 'Antique 22K Gold Kasu Mala Temple Coin Necklace',
    category: 'polki',
    categoryName: 'Polki & Kundan',
    price: 19800,
    metalPurity: '22K Solid Yellow Gold (916 BIS Hallmark)',
    grossWeight: '88.40 g',
    netGoldWeight: '88.40 g',
    gemstones: 'Embossed Goddess Lakshmi Kasu Gold Coins (Zero Stones)',
    diamondGrade: 'N/A - Solid Gold Temple Heirloom',
    certification: 'BIS Hallmark 916 Stamped',
    makingCharges: '12% Included',
    description: 'A revered traditional South Indian heritage piece featuring overlapping repoussé Lakshmi gold coins suspended along an articulated snake chain.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=900&q=80',
    featured: false,
    indianType: 'Kasu Mala'
  },
  {
    id: 'wj-prod-12',
    sku: 'WJ-BRD-012',
    name: 'Zambian Emerald & Rose-Cut Diamond Chandelier Set',
    category: 'bridal',
    categoryName: 'Bridal Sets',
    price: 15600,
    metalPurity: '18K White & Yellow Gold Duo-Tone',
    grossWeight: '34.20 g',
    netGoldWeight: '27.50 g',
    gemstones: 'Zambian Emerald Drops (16.40 ct), Rose-Cut Diamonds (8.20 ct)',
    diamondGrade: 'VS1, F Color',
    certification: 'IGI Certified Gemological Dossier',
    makingCharges: '16% Included',
    description: 'Articulated statement earrings featuring intense green Zambian emeralds accented by vintage rose-cut diamonds that capture every beam of candlelight.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80',
    featured: false,
    indianType: 'Emerald Chandelier'
  }
];

const DEFAULT_STAFF = [
  {
    id: 'emp-01',
    empId: 'WJ-EMP-01',
    name: 'Rajesh S. Verma',
    role: 'Chief Goldsmith & Head Craftsman',
    department: 'Atelier & Handcrafting',
    baseSalary: 4500,
    status: 'Paid',
    paymentDate: '2026-10-01',
    paymentMethod: 'Bank Wire / NEFT',
    bonus: 500,
    notes: 'Completed 3 bespoke royal bridal commissions with zero casting wastage.'
  },
  {
    id: 'emp-02',
    empId: 'WJ-EMP-02',
    name: 'Meera Singhania',
    role: 'Senior GIA Gemologist & Appraiser',
    department: 'Gemology & Purity Grading',
    baseSalary: 5200,
    status: 'Paid',
    paymentDate: '2026-10-01',
    paymentMethod: 'Bank Wire / NEFT',
    bonus: 300,
    notes: 'Verified and certified 65 ct natural uncut syndicate polki lot.'
  },
  {
    id: 'emp-03',
    empId: 'WJ-EMP-03',
    name: 'Alistair Vance',
    role: 'Atelier Director & VIP Clienteling',
    department: 'Private Salon & Sales',
    baseSalary: 6000,
    status: 'Pending',
    paymentDate: '2026-10-05',
    paymentMethod: 'Bank Wire / NEFT',
    bonus: 1200,
    notes: 'Pending final quarterly royal wedding commission tally.'
  },
  {
    id: 'emp-04',
    empId: 'WJ-EMP-04',
    name: 'Fatima Sheikh',
    role: 'Polki & Jadau Setting Specialist',
    department: 'Handcraft Atelier',
    baseSalary: 4200,
    status: 'Paid',
    paymentDate: '2026-10-01',
    paymentMethod: 'Direct Deposit',
    bonus: 400,
    notes: 'Mastered 24K pure gold foil lac-free setting technique.'
  },
  {
    id: 'emp-05',
    empId: 'WJ-EMP-05',
    name: 'Devendra Patel',
    role: 'Vault Custodian & Chief Security Lead',
    department: 'Security & Operations',
    baseSalary: 3600,
    status: 'Paid',
    paymentDate: '2026-10-01',
    paymentMethod: 'Bank Wire / NEFT',
    bonus: 250,
    notes: 'Zero discrepancy in bi-weekly bullion weighing and vault reconciliation.'
  },
  {
    id: 'emp-06',
    empId: 'WJ-EMP-06',
    name: 'Kavita Nair',
    role: 'Boutique Senior Concierge',
    department: 'Client Services',
    baseSalary: 3800,
    status: 'Pending',
    paymentDate: '2026-10-05',
    paymentMethod: 'Direct Deposit',
    bonus: 350,
    notes: 'Scheduled 18 private bridal viewings for upcoming festive season.'
  }
];

const DEFAULT_LEDGER = [
  {
    id: 'led-01',
    voucherNo: 'WJ-V-2026-1001',
    date: '2026-10-01',
    category: 'Gold Refining & Casting',
    description: '24K 999.9 gold assaying, alloy casting fluxes, and ceramic crucibles',
    amount: 840,
    paymentMode: 'Wire Transfer',
    incurredBy: 'Rajesh S. Verma',
    status: 'Completed'
  },
  {
    id: 'led-02',
    voucherNo: 'WJ-V-2026-1002',
    date: '2026-10-01',
    category: 'Luxury Packaging',
    description: 'Custom maroon & emerald velvet presentation boxes & suede pouches with embossed gold WJ crest',
    amount: 1250,
    paymentMode: 'Corporate Card',
    incurredBy: 'Alistair Vance',
    status: 'Completed'
  },
  {
    id: 'led-03',
    voucherNo: 'WJ-V-2026-0938',
    date: '2026-09-30',
    category: 'Security & Insurance',
    description: "Monthly High-Value Vault & Armored Transit premium coverage",
    amount: 2800,
    paymentMode: 'Bank Transfer',
    incurredBy: 'Devendra Patel',
    status: 'Completed'
  },
  {
    id: 'led-04',
    voucherNo: 'WJ-V-2026-0939',
    date: '2026-09-30',
    category: 'VIP Hospitality',
    description: 'Private Salon catering: Dom Pérignon champagne, artisanal dry fruits & Darjeeling tea for bridal patrons',
    amount: 680,
    paymentMode: 'Corporate Card',
    incurredBy: 'Kavita Nair',
    status: 'Completed'
  },
  {
    id: 'led-05',
    voucherNo: 'WJ-V-2026-0925',
    date: '2026-09-29',
    category: 'Certification & Hallmarking',
    description: 'GIA laser inscription fees for solitaire batch & BIS laser hallmarking lot',
    amount: 1920,
    paymentMode: 'Wire Transfer',
    incurredBy: 'Meera Singhania',
    status: 'Completed'
  },
  {
    id: 'led-06',
    voucherNo: 'WJ-V-2026-0914',
    date: '2026-09-28',
    category: 'Workshop Tools & Rouge',
    description: 'Swiss precision diamond tweezers, rotary burnishing bits, and ultrasonic cleaning solutions',
    amount: 460,
    paymentMode: 'Petty Cash',
    incurredBy: 'Rajesh S. Verma',
    status: 'Completed'
  }
];

const DEFAULT_INQUIRIES = [
  {
    id: 'inq-01',
    clientName: 'Maharani Gayatri Devi Foundation',
    email: 'curator@heritagepatrons.in',
    phone: '+91 98201 44556',
    categoryOrItem: 'The Royal Rajputana Nizam Jadau Polki Choker Suite',
    preferredDate: '2026-10-08 at 3:00 PM',
    budget: '$35,000 - $50,000 (₹30L - ₹45L)',
    notes: 'Requesting a private salon appointment with master gemologist for bridal suite custom styling and gemstone audit.',
    status: 'Confirmed',
    createdAt: '2026-10-01T11:30:00Z'
  },
  {
    id: 'inq-02',
    clientName: 'Vikramaditya Singhania',
    email: 'v.singhania@heritageholdings.in',
    phone: '+91 98201 54321',
    categoryOrItem: 'Imperial 22K Temple Nakashi Peacock Kada Pair',
    preferredDate: '2026-10-05 at 5:00 PM',
    budget: '$15,000 - $25,000 (₹12L - ₹20L)',
    notes: 'Seeking custom wrist circumference sizing (2.6 size) and inscription for auspicious Diwali celebration.',
    status: 'New',
    createdAt: '2026-10-01T15:10:00Z'
  }
];

// Helper to safely load, initialize, and sync storage
const DataStore = {
  getProducts() {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getStaff() {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_STAFF;
    }
  },

  saveStaff(staff) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  },

  getLedger() {
    const data = localStorage.getItem(STORAGE_KEYS.LEDGER);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(DEFAULT_LEDGER));
      return DEFAULT_LEDGER;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_LEDGER;
    }
  },

  saveLedger(ledger) {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  },

  getInquiries() {
    const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(DEFAULT_INQUIRIES));
      return DEFAULT_INQUIRIES;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_INQUIRIES;
    }
  },

  saveInquiries(inquiries) {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  },

  getRates() {
    const data = localStorage.getItem(STORAGE_KEYS.RATES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(DEFAULT_RATES));
      return DEFAULT_RATES;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_RATES;
    }
  },

  saveRates(rates) {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  },

  getWishlist() {
    const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveWishlist(wishlist) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  },

  getCurrency() {
    if (typeof localStorage === 'undefined') return 'INR';
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'INR'; // Default INR for Indian Jeweller
  },

  setCurrency(curr) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    }
  },

  getTheme() {
    if (typeof localStorage === 'undefined') return 'dark';
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  },

  getPalette() {
    return 'burgundy';
  },

  setPalette(paletteId) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PALETTE, 'burgundy');
    }
  },

  /**
   * Automated Live Gold Price Fetcher
   * Fetches spot gold price directly from public CoinGecko PAX-Gold Bullion API.
   * 1 troy oz = 31.1034768 grams.
   */
  async fetchLiveGoldRates(force = false) {
    const currentRates = this.getRates();
    const lastUpdated = new Date(currentRates.lastUpdated || 0).getTime();
    const now = Date.now();
    const hoursSinceSync = (now - lastUpdated) / (1000 * 60 * 60);

    // If synced within last 2 hours and not forced, return cached
    if (!force && hoursSinceSync < 2) {
      return { success: true, rates: currentRates, source: 'cached' };
    }

    try {
      const endpoint = 'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd,inr,gbp,aed&include_24hr_change=true';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json = await response.json();
      const pax = json['pax-gold'];

      if (!pax || !pax.usd) {
        throw new Error('Invalid rate payload');
      }

      const troyOzGrams = 31.1034768;
      const usdPerGram24K = pax.usd / troyOzGrams;
      const change24h = pax.usd_24h_change || 0;
      const changeStr = (change24h >= 0 ? '+' : '') + change24h.toFixed(2) + '%';

      // Update rates with calculated purity tiers
      const updatedRates = {
        gold24k: {
          name: '24K Pure Gold (999)',
          priceUsdPerGram: parseFloat(usdPerGram24K.toFixed(2)),
          change: changeStr
        },
        gold22k: {
          name: '22K Hallmark Gold (916)',
          priceUsdPerGram: parseFloat((usdPerGram24K * 0.916).toFixed(2)),
          change: changeStr
        },
        gold18k: {
          name: '18K Jewelry Gold (750)',
          priceUsdPerGram: parseFloat((usdPerGram24K * 0.750).toFixed(2)),
          change: changeStr
        },
        platinum950: {
          name: 'Platinum (Pt 950)',
          priceUsdPerGram: parseFloat((usdPerGram24K * 0.434).toFixed(2)),
          change: (change24h * -0.3).toFixed(2) + '%'
        },
        silver999: {
          name: 'Fine Silver (Ag 999)',
          priceUsdPerGram: parseFloat((usdPerGram24K * 0.0125).toFixed(2)),
          change: '+0.95%'
        },
        lastUpdated: new Date().toISOString(),
        source: 'Live Spot Bullion API (PAX-G)',
        autoSync: true
      };

      this.saveRates(updatedRates);
      return { success: true, rates: updatedRates, source: 'live' };
    } catch (err) {
      console.warn('Live gold API fetch fallback to local:', err);
      return { success: false, rates: currentRates, error: err.message };
    }
  },

  resetAllDemoData() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(DEFAULT_LEDGER));
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(DEFAULT_INQUIRIES));
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(DEFAULT_RATES));
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
  }
};

if (typeof window !== 'undefined') {
  window.DataStore = DataStore;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.PALETTES = PALETTES;
  window.CURRENCIES = CURRENCIES;
  window.DEFAULT_RATES = DEFAULT_RATES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataStore, STORAGE_KEYS, PALETTES, CURRENCIES, DEFAULT_RATES, DEFAULT_PRODUCTS };
}
