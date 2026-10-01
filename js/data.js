/**
 * Aurelia Fine Jewels - Initial Data Store & LocalStorage Rehydration
 * Production catalog, staff payroll, daily ledger, inquiries & precious metal rates.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'aurelia_products_v1',
  STAFF: 'aurelia_staff_payroll_v1',
  LEDGER: 'aurelia_shop_ledger_v1',
  INQUIRIES: 'aurelia_inquiries_v1',
  RATES: 'aurelia_metal_rates_v1',
  WISHLIST: 'aurelia_wishlist_v1',
  CURRENCY: 'aurelia_currency_v1',
  SESSION: 'aurelia_admin_session_v1'
};

const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD' },
  INR: { symbol: '₹', rate: 83.50, label: 'INR (₹)', code: 'INR' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)', code: 'GBP' },
  AED: { symbol: 'AED ', rate: 3.67, label: 'AED', code: 'AED' }
};

const DEFAULT_RATES = {
  gold24k: { name: '24K Fine Gold (999)', priceUsdPerGram: 76.40, change: '+0.65%' },
  gold22k: { name: '22K Standard Gold (916)', priceUsdPerGram: 70.20, change: '+0.65%' },
  gold18k: { name: '18K Crown Gold (750)', priceUsdPerGram: 57.30, change: '+0.65%' },
  platinum950: { name: 'Platinum (Pt 950)', priceUsdPerGram: 33.10, change: '-0.20%' },
  silver999: { name: 'Fine Silver (Ag 999)', priceUsdPerGram: 0.95, change: '+1.10%' },
  lastUpdated: new Date().toISOString()
};

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-01',
    sku: 'AUR-BRD-001',
    name: 'The Maharani Nizam Heirloom Polki Bridal Suite',
    category: 'bridal',
    categoryName: 'Bridal Sets',
    price: 38500,
    metalPurity: '22K Yellow Gold (916 BIS Laser Hallmarked)',
    grossWeight: '148.50 g',
    netGoldWeight: '112.40 g',
    gemstones: 'Uncut Syndicate Polki Diamonds (18.60 ct), Natural Zambian Emerald Drops (28.40 ct), Graded Basra Seed Pearls',
    diamondGrade: 'Natural Uncut Syndicate Polki (High Lustre)',
    certification: 'GIA Sealed Dossier & BIS Hallmark Registry',
    makingCharges: '18% Handcrafted Meenakari & Jadau included',
    description: 'An imperial heirloom masterpiece crafted over 240 artisan hours. Features bezel-set uncut syndicate polki diamonds accented with deep verdant Zambian emerald droplets, framed by royal Basra pearls and finished with Persian-inspired miniature enamel (Meenakari) on the reverse.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'prod-02',
    sku: 'AUR-BRD-002',
    name: 'Celestial Luminescence Diamond Waterfall Suite',
    category: 'bridal',
    categoryName: 'Bridal Sets',
    price: 46200,
    metalPurity: '18K White Gold (750 Stamped)',
    grossWeight: '96.20 g',
    netGoldWeight: '82.50 g',
    gemstones: 'Natural Diamonds (24.85 ct Total), Pear & Marquise Cut Cascades',
    diamondGrade: 'VVS1 Clarity, E-F Color, Triple Excellent Cut',
    certification: 'IGI Certified Diamond Passport',
    makingCharges: '16% Micro-Pavé setting included',
    description: 'A breathtaking cascade of natural diamonds featuring graduated pear and marquise cuts suspended in an articulated setting that fluidly contours the décolletage with celestial brilliance.',
    stockQty: 1,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'prod-03',
    sku: 'AUR-RNG-001',
    name: 'The Aurelia Sovereign 3.20ct Solitaire Ring',
    category: 'diamonds',
    categoryName: 'Diamond Rings',
    price: 28400,
    metalPurity: '950 Platinum with 18K Yellow Gold Inner Band',
    grossWeight: '8.40 g',
    netGoldWeight: '7.76 g',
    gemstones: '3.20 ct Round Brilliant Solitaire + 0.45 ct Hidden Pavé Halo',
    diamondGrade: 'VVS1 Clarity, D Flawless Color, Hearts & Arrows',
    certification: 'GIA Laser-Inscribed Inscription 2185493012',
    makingCharges: '12% Platinum benchwork included',
    description: 'The pinnacle of solitary perfection. A certified 3.20-carat D-color flawless diamond held securely by six hand-drawn platinum prongs above a delicate hidden pavé diamond gallery.',
    stockQty: 3,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'prod-04',
    sku: 'AUR-RNG-002',
    name: 'Emerald-Cut Royal Azure Sapphire & Diamond Cocktail Ring',
    category: 'diamonds',
    categoryName: 'Diamond Rings',
    price: 19800,
    metalPurity: '18K White Gold',
    grossWeight: '11.20 g',
    netGoldWeight: '9.10 g',
    gemstones: 'Royal Blue Ceylon Sapphire (4.80 ct Unheated), Tapered Baguette Diamonds (1.80 ct)',
    diamondGrade: 'VS1, F Color / Untreated Natural Sapphire',
    certification: 'Gübelin & GIA Dual Certified',
    makingCharges: '14% Custom Lapidary included',
    description: 'An unheated Ceylon royal blue sapphire flanked by architectural step-cut tapered baguette diamonds in an art deco inspired architectural setting.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'prod-05',
    sku: 'AUR-PLK-001',
    name: 'Noor-e-Jahan Royal Jadau Polki Choker',
    category: 'polki',
    categoryName: 'Polki Necklaces',
    price: 24500,
    metalPurity: '22K Yellow Gold (916 BIS Hallmarked)',
    grossWeight: '118.00 g',
    netGoldWeight: '86.50 g',
    gemstones: 'Open-Setting Bikaner Syndicate Polki (14.20 ct), South Sea Pearls, Ruby Cabochons (8.50 ct)',
    diamondGrade: 'Natural Uncut Heritage Polki',
    certification: 'BIS Hallmarked & Gemological Testing Lab',
    makingCharges: '20% Royal Kundan Jadau included',
    description: 'Inspired by Mughal court regalia, this choker showcases open-set syndicate polki stones embraced by hand-enameled Meenakari motifs on the reverse and suspended South Sea pearl drops.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'prod-06',
    sku: 'AUR-PLK-002',
    name: 'Amber Dawn Cascading Polki Haar',
    category: 'polki',
    categoryName: 'Polki Necklaces',
    price: 31200,
    metalPurity: '22K Gold with Antique Hand-Rubbed Patina',
    grossWeight: '135.80 g',
    netGoldWeight: '98.20 g',
    gemstones: 'Syndicate Polki (16.40 ct), Fluted Russian Emerald Melons (34.00 ct)',
    diamondGrade: 'Natural Heritage Polki',
    certification: 'BIS Hallmarked Laser Seal',
    makingCharges: '19% Included',
    description: 'A multi-strand imperial haar with fluted emerald melons and uncut diamond clusters, culminating in an intricate medallion showcasing traditional peacock meenakari.',
    stockQty: 1,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    featured: false
  },
  {
    id: 'prod-07',
    sku: 'AUR-BNG-001',
    name: 'Imperial Temple Filigree Kada Pair (22K)',
    category: 'bangles',
    categoryName: 'Gold Bangles',
    price: 14800,
    metalPurity: '22K Solid Yellow Gold (916 BIS Hallmark)',
    grossWeight: '82.40 g',
    netGoldWeight: '82.40 g',
    gemstones: 'Pure Solid 22K Gold (Zero Stones)',
    diamondGrade: 'N/A - Solid Investment Gold',
    certification: 'Government Recognized BIS Hallmark 916',
    makingCharges: '11% Hand-Carved Die-Cast included',
    description: 'A pair of heavy hand-engraved temple kadas featuring raised relief motifs and antique nakashi wire filigree, fastened with hidden screw clasps.',
    stockQty: 4,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'prod-08',
    sku: 'AUR-BNG-002',
    name: 'The Riviera Diamond Tennis Bracelet (10.50ct)',
    category: 'bangles',
    categoryName: 'Gold Bangles',
    price: 18900,
    metalPurity: '18K White Gold',
    grossWeight: '22.60 g',
    netGoldWeight: '20.50 g',
    gemstones: '10.50 ct Round Brilliant Cut Natural Diamonds (52 matched stones)',
    diamondGrade: 'VS1-VS2, F-G Color, Excellent Cut',
    certification: 'IGI Certificate of Authenticity',
    makingCharges: '15% Included',
    description: 'Precision engineered with four-prong platinum baskets, fluid articulation, and double safety catch. Each stone is individually hand-matched for identical hue and fire.',
    stockQty: 3,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    id: 'prod-09',
    sku: 'AUR-RNG-003',
    name: 'Seraphina Pear-Cut Solitaire with Pavé Shoulders',
    category: 'diamonds',
    categoryName: 'Diamond Rings',
    price: 16500,
    metalPurity: '18K Rose Gold & Platinum Prongs',
    grossWeight: '5.80 g',
    netGoldWeight: '5.30 g',
    gemstones: '2.10 ct Pear Brilliant Cut + 0.35 ct Micro-Pavé Diamonds',
    diamondGrade: 'VVS2, E Color, Excellent Symmetry',
    certification: 'GIA Laser Registry',
    makingCharges: '12% Included',
    description: 'An elongated pear-cut diamond set in warm 18K rose gold with shimmering micro-pavé shoulders, celebrating refined modern opulence.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=900&q=80',
    featured: false
  },
  {
    id: 'prod-10',
    sku: 'AUR-BRD-003',
    name: 'Empress Emerald & Rose-Cut Diamond Chandelier Earrings',
    category: 'bridal',
    categoryName: 'Bridal Sets',
    price: 12700,
    metalPurity: '18K White Gold',
    grossWeight: '26.40 g',
    netGoldWeight: '21.10 g',
    gemstones: 'Zambian Emerald Cabochons (12.40 ct), Rose Cut Diamonds (6.20 ct)',
    diamondGrade: 'VS1, F Color',
    certification: 'IGI Certified',
    makingCharges: '16% Included',
    description: 'Dramatic articulated chandelier earrings featuring vivid green Zambian emeralds accented by romantic antique rose-cut diamonds that flutter with every movement.',
    stockQty: 2,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80',
    featured: false
  },
  {
    id: 'prod-11',
    sku: 'AUR-BNG-003',
    name: 'Florentine Hand-Chased 22K Gold Silk Cuff',
    category: 'bangles',
    categoryName: 'Gold Bangles',
    price: 11400,
    metalPurity: '22K Solid Yellow Gold',
    grossWeight: '64.20 g',
    netGoldWeight: '64.20 g',
    gemstones: 'Solid 22K Gold with Satin & Diamond-Point Texture',
    diamondGrade: 'N/A - Solid Gold Masterpiece',
    certification: 'BIS Hallmark 916 Laser Marked',
    makingCharges: '13% Included',
    description: 'Meticulously hand-chased with Renaissance Florentine engraving techniques, resulting in a tactile silk-gold finish that catches light from all angles.',
    stockQty: 3,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=900&q=80',
    featured: false
  },
  {
    id: 'prod-12',
    sku: 'AUR-PLK-003',
    name: 'The Royal Rajputana Pearl & Polki Collar',
    category: 'polki',
    categoryName: 'Polki Necklaces',
    price: 27900,
    metalPurity: '22K Yellow Gold',
    grossWeight: '104.50 g',
    netGoldWeight: '76.80 g',
    gemstones: 'Syndicate Polki Diamonds (12.80 ct), Certified Basra Pearls, Burmese Ruby Accents',
    diamondGrade: 'Fine Syndicate Polki',
    certification: 'BIS & GTL Certified',
    makingCharges: '18% Included',
    description: 'A close-fitting choker collar with three tiers of lustrous natural seed pearls holding a grand central pendant set with antique polki and pigeon-blood ruby cabochons.',
    stockQty: 1,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80',
    featured: false
  }
];

const DEFAULT_STAFF = [
  {
    id: 'emp-01',
    empId: 'AUR-EMP-01',
    name: 'Rajesh Verma',
    role: 'Chief Goldsmith & Head Craftsman',
    department: 'Atelier & Production',
    baseSalary: 4500,
    status: 'Paid',
    paymentDate: '2026-10-01',
    paymentMethod: 'Bank Wire / NEFT',
    bonus: 500,
    notes: 'Completed 3 bespoke royal bridal commissions with zero casting wastage.'
  },
  {
    id: 'emp-02',
    empId: 'AUR-EMP-02',
    name: 'Meera Singhania',
    role: 'Senior GIA Gemologist & Appraiser',
    department: 'Gemology & Grading',
    baseSalary: 5200,
    status: 'Paid',
    paymentDate: '2026-10-01',
    paymentMethod: 'Bank Wire / NEFT',
    bonus: 300,
    notes: 'Verified and certified 65 ct natural uncut syndicate polki lot.'
  },
  {
    id: 'emp-03',
    empId: 'AUR-EMP-03',
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
    empId: 'AUR-EMP-04',
    name: 'Fatima Sheikh',
    role: 'Polki & Jadau Setting Specialist',
    department: 'Atelier & Production',
    baseSalary: 4200,
    status: 'Paid',
    paymentDate: '2026-10-01',
    paymentMethod: 'Direct Deposit',
    bonus: 400,
    notes: 'Mastered 24K pure gold foil lac-free setting technique.'
  },
  {
    id: 'emp-05',
    empId: 'AUR-EMP-05',
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
    empId: 'AUR-EMP-06',
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
    voucherNo: 'V-2026-1001',
    date: '2026-10-01',
    category: 'Gold Refining & Casting',
    description: '24K 999.9 gold assaying, alloy casting fluxes, and ceramic crucibles',
    amount: 840,
    paymentMode: 'Wire Transfer',
    incurredBy: 'Rajesh Verma',
    status: 'Completed'
  },
  {
    id: 'led-02',
    voucherNo: 'V-2026-1002',
    date: '2026-10-01',
    category: 'Luxury Packaging',
    description: 'Custom dark emerald velvet presentation boxes & suede pouches with embossed gold leaf logo',
    amount: 1250,
    paymentMode: 'Corporate Card',
    incurredBy: 'Alistair Vance',
    status: 'Completed'
  },
  {
    id: 'led-03',
    voucherNo: 'V-2026-0938',
    date: '2026-09-30',
    category: 'Security & Insurance',
    description: "Monthly Lloyd's High-Value Vault & Armored Transit premium coverage",
    amount: 2800,
    paymentMode: 'Bank Transfer',
    incurredBy: 'Devendra Patel',
    status: 'Completed'
  },
  {
    id: 'led-04',
    voucherNo: 'V-2026-0939',
    date: '2026-09-30',
    category: 'VIP Hospitality',
    description: 'Private Salon catering: Dom Pérignon champagne, artisanal macarons & Darjeeling first-flush tea for bridal patrons',
    amount: 680,
    paymentMode: 'Corporate Card',
    incurredBy: 'Kavita Nair',
    status: 'Completed'
  },
  {
    id: 'led-05',
    voucherNo: 'V-2026-0925',
    date: '2026-09-29',
    category: 'Certification & Hallmarking',
    description: 'GIA laser inscription fees for 14 solitaire diamonds & BIS laser hallmarking lot',
    amount: 1920,
    paymentMode: 'Wire Transfer',
    incurredBy: 'Meera Singhania',
    status: 'Completed'
  },
  {
    id: 'led-06',
    voucherNo: 'V-2026-0914',
    date: '2026-09-28',
    category: 'Workshop Tools & Rouge',
    description: 'Swiss precision diamond tweezers, rotary burnishing bits, and ultrasonic cleaning solutions',
    amount: 460,
    paymentMode: 'Petty Cash',
    incurredBy: 'Rajesh Verma',
    status: 'Completed'
  },
  {
    id: 'led-07',
    voucherNo: 'V-2026-0908',
    date: '2026-09-27',
    category: 'Atelier Maintenance',
    description: 'HEPA air filtration unit maintenance for cleanroom diamond setting suite',
    amount: 350,
    paymentMode: 'Company Card',
    incurredBy: 'Devendra Patel',
    status: 'Completed'
  }
];

const DEFAULT_INQUIRIES = [
  {
    id: 'inq-01',
    clientName: 'Lady Charlotte Montagu',
    email: 'charlotte.m@luxpatron.co.uk',
    phone: '+44 7700 900481',
    categoryOrItem: 'The Maharani Nizam Heirloom Polki Bridal Suite',
    preferredDate: '2026-10-08 at 3:00 PM',
    budget: '$40,000 - $60,000',
    notes: 'Requesting a private salon appointment with master gemologist for bridal suite custom styling.',
    status: 'Confirmed',
    createdAt: '2026-10-01T11:30:00Z'
  },
  {
    id: 'inq-02',
    clientName: 'Vikramaditya Singhania',
    email: 'v.singhania@heritageholdings.in',
    phone: '+91 98201 54321',
    categoryOrItem: 'The Aurelia Sovereign 3.20ct Solitaire Ring',
    preferredDate: '2026-10-05 at 5:00 PM',
    budget: '$25,000 - $35,000',
    notes: 'Seeking custom platinum band sizing and laser inscription for anniversary surprise.',
    status: 'New',
    createdAt: '2026-10-01T15:10:00Z'
  }
];

// Helper to safely load or initialize storage
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
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD';
  },

  setCurrency(curr) {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
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
  window.CURRENCIES = CURRENCIES;
  window.DEFAULT_RATES = DEFAULT_RATES;
}

