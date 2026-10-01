/**
 * Aurelia Fine Jewels - Public Showcase Module
 * Collection grids, filters, quick-view modal, live metal ticker, wishlist drawer, and VIP consultation booking.
 */

const Showcase = {
  currentCategory: 'all',
  searchQuery: '',
  filterPurity: 'all',
  sortBy: 'featured',
  activeQuickViewProduct: null,

  init() {
    this.renderMetalRates();
    this.renderCollections();
    this.updateWishlistCount();
    this.bindEvents();
  },

  bindEvents() {
    // Category pill filters
    document.querySelectorAll('[data-category-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-category-filter]').forEach(b => {
          b.classList.remove('bg-[#D4AF37]', 'text-black', 'border-[#D4AF37]');
          b.classList.add('bg-[#141416]', 'text-gray-300', 'border-gray-800');
        });
        const target = e.currentTarget;
        target.classList.add('bg-[#D4AF37]', 'text-black', 'border-[#D4AF37]');
        target.classList.remove('bg-[#141416]', 'text-gray-300', 'border-gray-800');

        this.currentCategory = target.getAttribute('data-category-filter');
        this.renderCollections();
      });
    });

    // Search bar
    const searchInput = document.getElementById('collection-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCollections();
      });
    }

    // Purity filter
    const purityFilter = document.getElementById('collection-purity');
    if (purityFilter) {
      purityFilter.addEventListener('change', (e) => {
        this.filterPurity = e.target.value;
        this.renderCollections();
      });
    }

    // Sort selector
    const sortSelect = document.getElementById('collection-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderCollections();
      });
    }

    // Contact / Inquiry Form
    const inquiryForm = document.getElementById('vip-inquiry-form');
    if (inquiryForm) {
      inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleInquirySubmission(e.target);
      });
    }
  },

  // Render the animated precious metals ticker
  renderMetalRates() {
    const tickerContainer = document.getElementById('metal-rates-marquee');
    if (!tickerContainer) return;

    const rates = DataStore.getRates();
    const items = [
      { label: 'Gold 24K (999)', price: rates.gold24k.priceUsdPerGram, change: rates.gold24k.change },
      { label: 'Gold 22K (916)', price: rates.gold22k.priceUsdPerGram, change: rates.gold22k.change },
      { label: 'Gold 18K (750)', price: rates.gold18k.priceUsdPerGram, change: rates.gold18k.change },
      { label: 'Platinum 950', price: rates.platinum950.priceUsdPerGram, change: rates.platinum950.change },
      { label: 'Fine Silver 999', price: rates.silver999.priceUsdPerGram, change: rates.silver999.change }
    ];

    const generateTickerHtml = () => items.map(item => `
      <div class="inline-flex items-center gap-2.5 mx-6 text-xs whitespace-nowrap">
        <span class="text-gray-400 font-cinzel tracking-wider">${item.label}:</span>
        <span class="font-semibold text-[#F3E5AB]">${Utils.formatGramRate(item.price)}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded ${item.change.startsWith('+') ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'}">
          ${item.change}
        </span>
      </div>
    `).join('');

    // Duplicate ticker for seamless infinite CSS marquee scroll
    tickerContainer.innerHTML = generateTickerHtml() + generateTickerHtml();
  },

  // Filter and sort products
  getFilteredProducts() {
    let list = [...DataStore.getProducts()];

    // Category
    if (this.currentCategory !== 'all') {
      list = list.filter(p => p.category === this.currentCategory);
    }

    // Search query
    if (this.searchQuery) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.metalPurity.toLowerCase().includes(this.searchQuery) ||
        p.gemstones.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery)
      );
    }

    // Metal purity filter
    if (this.filterPurity !== 'all') {
      list = list.filter(p => p.metalPurity.toLowerCase().includes(this.filterPurity.toLowerCase()));
    }

    // Sorting
    if (this.sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // featured default
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  },

  // Render Collection Cards Grid
  renderCollections() {
    const grid = document.getElementById('collection-grid');
    const emptyState = document.getElementById('collection-empty-state');
    const countBadge = document.getElementById('collection-count-badge');
    if (!grid) return;

    const products = this.getFilteredProducts();
    const wishlist = DataStore.getWishlist();

    if (countBadge) {
      countBadge.textContent = `${products.length} Masterpiece${products.length === 1 ? '' : 's'}`;
    }

    if (products.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = products.map(prod => {
      const isWishlisted = wishlist.includes(prod.id);
      return `
        <div class="luxury-card rounded-2xl overflow-hidden flex flex-col group relative">
          <!-- Image Container -->
          <div class="lux-img-container aspect-[4/3] bg-black/60 relative lux-img-vignette cursor-pointer" onclick="Showcase.openQuickView('${prod.id}')">
            <img 
              src="${prod.image}" 
              alt="${prod.name}" 
              loading="lazy"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'"
            />
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span class="text-[10px] font-cinzel font-semibold px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[#F3E5AB] border border-[#D4AF37]/40">
                ${prod.categoryName}
              </span>
              ${prod.featured ? `
                <span class="text-[9px] font-cinzel tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <i class="fa-solid fa-crown text-[8px] mr-1"></i>Curated
                </span>
              ` : ''}
            </div>

            <!-- Wishlist Button -->
            <button 
              onclick="event.stopPropagation(); Showcase.toggleWishlist('${prod.id}')"
              title="Add to Curated Wishlist"
              class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 flex items-center justify-center text-gray-300 hover:text-rose-400 hover:border-rose-400/50 transition-all z-10"
            >
              <i class="fa-${isWishlisted ? 'solid text-rose-500' : 'regular'} fa-heart text-sm"></i>
            </button>

            <!-- Quick View overlay hint -->
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
              <span class="px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-[#D4AF37] text-[#F3E5AB] text-xs font-cinzel tracking-widest uppercase shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <i class="fa-solid fa-eye mr-1.5 text-xs text-[#D4AF37]"></i> Quick View
              </span>
            </div>
          </div>

          <!-- Content Details -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span class="font-mono text-[11px] text-gray-500">${prod.sku}</span>
                <span class="text-amber-300/80 font-medium">${prod.metalPurity.split('(')[0].trim()}</span>
              </div>

              <h3 
                onclick="Showcase.openQuickView('${prod.id}')" 
                class="font-serif-lux text-xl font-medium text-white hover:text-[#F3E5AB] transition-colors cursor-pointer leading-snug line-clamp-1 mb-2"
                title="${prod.name}"
              >
                ${prod.name}
              </h3>

              <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                ${prod.description}
              </p>

              <!-- Specs Highlights -->
              <div class="grid grid-cols-2 gap-2 text-[11px] bg-black/30 p-2.5 rounded-lg border border-white/5 mb-4">
                <div>
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Gross Wt:</span>
                  <span class="text-gray-200 font-medium">${prod.grossWeight}</span>
                </div>
                <div>
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Hallmark:</span>
                  <span class="text-amber-300/90 font-medium truncate block" title="${prod.certification}">${prod.certification.split('&')[0]}</span>
                </div>
              </div>
            </div>

            <!-- Price & Actions -->
            <div class="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase font-cinzel text-gray-500 block">Acquisition Value</span>
                <span class="text-xl font-cinzel font-bold gold-gradient-text">
                  ${Utils.formatPrice(prod.price)}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  onclick="Showcase.openQuickView('${prod.id}')"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] transition-all"
                >
                  Details
                </button>
                <button 
                  onclick="Showcase.inquireForProduct('${prod.id}')"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-semibold gold-btn-gradient"
                >
                  Inquire
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Open Interactive Quick-View Modal
  openQuickView(productId) {
    const products = DataStore.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    this.activeQuickViewProduct = product;
    const wishlist = DataStore.getWishlist();
    const isWishlisted = wishlist.includes(product.id);

    const modalBody = document.getElementById('quick-view-modal-content');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Product Imagery -->
        <div class="relative rounded-2xl overflow-hidden bg-black/80 border border-[#D4AF37]/30 aspect-[4/3] lg:aspect-square flex items-center justify-center">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="w-full h-full object-cover object-center"
            onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'"
          />
          <div class="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-xs text-amber-300 font-cinzel border border-amber-500/30">
            ${product.categoryName} · ${product.sku}
          </div>
        </div>

        <!-- Specifications & Details -->
        <div class="flex flex-col justify-between h-full">
          <div>
            <div class="flex items-center justify-between gap-4 mb-2">
              <span class="text-xs font-cinzel text-amber-400 tracking-widest uppercase">Maison Aurelia Certified</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full ${product.status === 'In Stock' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'}">
                <i class="fa-solid fa-circle text-[6px] mr-1.5 align-middle"></i>${product.status}
              </span>
            </div>

            <h2 class="font-serif-lux text-3xl font-medium text-white mb-2 leading-tight">
              ${product.name}
            </h2>

            <div class="mb-4">
              <span class="text-2xl font-cinzel font-bold gold-gradient-text">
                ${Utils.formatPrice(product.price)}
              </span>
              <span class="text-xs text-gray-500 ml-2">(Includes all artisanal crafting & hallmarking fees)</span>
            </div>

            <p class="text-sm text-gray-300 leading-relaxed mb-6 pb-6 border-b border-white/10">
              ${product.description}
            </p>

            <!-- Technical Specifications Table -->
            <div class="space-y-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
              <h4 class="font-cinzel text-xs text-[#E5C558] tracking-widest uppercase mb-2">
                <i class="fa-solid fa-award mr-1.5"></i> Gemological & Metal Specifications
              </h4>

              <div class="grid grid-cols-2 gap-y-2.5 text-xs">
                <div>
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Precious Metal Purity</span>
                  <span class="text-white font-medium">${product.metalPurity}</span>
                </div>
                <div>
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Total Gross Weight</span>
                  <span class="text-white font-medium">${product.grossWeight}</span>
                </div>
                <div>
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Estimated Net Gold</span>
                  <span class="text-white font-medium">${product.netGoldWeight}</span>
                </div>
                <div>
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Diamond Clarity & Color</span>
                  <span class="text-white font-medium">${product.diamondGrade}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Gemstone Details</span>
                  <span class="text-white font-medium">${product.gemstones}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Hallmark & Certification Authority</span>
                  <span class="text-amber-300 font-medium">${product.certification}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-500 block text-[10px] uppercase font-cinzel">Artisanal Making Charges</span>
                  <span class="text-gray-300">${product.makingCharges}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
            <button 
              onclick="Showcase.inquireForProduct('${product.id}')"
              class="flex-1 py-3 px-6 rounded-xl text-sm font-semibold gold-btn-gradient flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-calendar-check"></i> Book Private Salon Viewing
            </button>
            <button 
              id="modal-wishlist-btn"
              onclick="Showcase.toggleWishlist('${product.id}', true)"
              class="py-3 px-5 rounded-xl text-sm font-medium border ${isWishlisted ? 'border-rose-500/50 text-rose-400 bg-rose-950/20' : 'border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10'} transition-all flex items-center justify-center gap-2"
            >
              <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
              <span>${isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    Utils.openModal('quick-view-modal');
  },

  // Toggle Wishlist status
  toggleWishlist(productId, updateModal = false) {
    let wishlist = DataStore.getWishlist();
    const products = DataStore.getProducts();
    const prod = products.find(p => p.id === productId);
    const prodName = prod ? prod.name : 'Masterpiece';

    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
      Utils.showToast('Removed from Wishlist', `${prodName} has been removed from your curated list.`, 'gold');
    } else {
      wishlist.push(productId);
      Utils.showToast('Saved to Wishlist', `${prodName} added to your personal curation.`, 'success');
    }

    DataStore.saveWishlist(wishlist);
    this.updateWishlistCount();
    this.renderCollections();

    if (updateModal) {
      const btn = document.getElementById('modal-wishlist-btn');
      if (btn) {
        const isWishlisted = wishlist.includes(productId);
        btn.className = `py-3 px-5 rounded-xl text-sm font-medium border ${isWishlisted ? 'border-rose-500/50 text-rose-400 bg-rose-950/20' : 'border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/10'} transition-all flex items-center justify-center gap-2`;
        btn.innerHTML = `<i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i><span>${isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>`;
      }
    }

    this.renderWishlistDrawer();
  },

  // Update navbar wishlist badges
  updateWishlistCount() {
    const count = DataStore.getWishlist().length;
    document.querySelectorAll('.wishlist-counter-badge').forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  },

  // Render the sliding wishlist drawer
  renderWishlistDrawer() {
    const container = document.getElementById('wishlist-items-container');
    const totalEl = document.getElementById('wishlist-total-value');
    if (!container) return;

    const wishlist = DataStore.getWishlist();
    const products = DataStore.getProducts();
    const items = products.filter(p => wishlist.includes(p.id));

    if (items.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-gray-500">
          <i class="fa-regular fa-heart text-4xl text-gray-600 mb-3"></i>
          <p class="font-cinzel text-sm text-gray-400">Your curation is empty</p>
          <p class="text-xs text-gray-600 mt-1">Explore our fine collections to bookmark pieces of interest.</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = Utils.formatPrice(0);
      return;
    }

    let totalUsd = 0;
    container.innerHTML = items.map(item => {
      totalUsd += item.price;
      return `
        <div class="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/5">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border border-[#D4AF37]/20" />
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-serif-lux text-white truncate font-medium">${item.name}</h4>
            <span class="text-[11px] text-amber-400/90 font-cinzel block mt-0.5">${Utils.formatPrice(item.price)}</span>
            <span class="text-[10px] text-gray-500">${item.metalPurity.split('(')[0]}</span>
          </div>
          <button 
            onclick="Showcase.toggleWishlist('${item.id}')"
            class="text-gray-500 hover:text-rose-400 text-sm p-1.5"
            title="Remove item"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');

    if (totalEl) {
      totalEl.textContent = Utils.formatPrice(totalUsd);
    }
  },

  openWishlistDrawer() {
    this.renderWishlistDrawer();
    const drawer = document.getElementById('wishlist-drawer');
    const overlay = document.getElementById('wishlist-overlay');
    if (!drawer || !overlay) return;

    overlay.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
  },

  closeWishlistDrawer() {
    const drawer = document.getElementById('wishlist-drawer');
    const overlay = document.getElementById('wishlist-overlay');
    if (!drawer || !overlay) return;

    drawer.classList.add('translate-x-full');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  },

  // Pre-fill inquiry form for a specific product and scroll to contact section
  inquireForProduct(productId) {
    Utils.closeModal('quick-view-modal');
    this.closeWishlistDrawer();

    const products = DataStore.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const notesField = document.getElementById('inquiry-notes');
    const categoryField = document.getElementById('inquiry-category');

    if (categoryField) {
      categoryField.value = product.category;
    }

    if (notesField) {
      notesField.value = `I am interested in scheduling a private salon viewing for "${product.name}" (${product.sku}) priced at ${Utils.formatPrice(product.price)}. Please contact me with available viewing appointments and custom styling options.`;
    }

    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }

    Utils.showToast('Product Selected', `Details for ${product.name} have been populated into the appointment form below.`, 'gold');
  },

  // Inquire all wishlist items
  inquireAllWishlist() {
    this.closeWishlistDrawer();
    const wishlist = DataStore.getWishlist();
    const products = DataStore.getProducts();
    const items = products.filter(p => wishlist.includes(p.id));

    if (items.length === 0) {
      Utils.showToast('Wishlist Empty', 'Please select at least one piece to book a private viewing.', 'error');
      return;
    }

    const titles = items.map(i => `• ${i.name} (${i.sku} - ${Utils.formatPrice(i.price)})`).join('\n');
    const notesField = document.getElementById('inquiry-notes');
    if (notesField) {
      notesField.value = `I would like to arrange a private viewing for the following curated pieces from my wishlist:\n\n${titles}\n\nPlease advise available dates and salon suite availability.`;
    }

    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }

    Utils.showToast('Curated Suite Ready', 'Your selected pieces have been attached to the salon booking inquiry below.', 'gold');
  },

  // Handle VIP consultation booking
  handleInquirySubmission(form) {
    const formData = new FormData(form);
    const clientName = formData.get('clientName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const category = formData.get('category');
    const preferredDate = formData.get('preferredDate') || 'Flexible';
    const budget = formData.get('budget') || 'Undisclosed';
    const notes = formData.get('notes') || 'General consultation request';

    if (!clientName || !email || !phone) {
      Utils.showToast('Required Fields Missing', 'Please provide your name, contact email, and phone number.', 'error');
      return;
    }

    const newInquiry = {
      id: 'inq-' + Date.now().toString(36),
      clientName: clientName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      categoryOrItem: category || 'General High Jewelry Viewing',
      preferredDate: preferredDate,
      budget: budget,
      notes: notes.trim(),
      status: 'New',
      createdAt: new Date().toISOString()
    };

    const inquiries = DataStore.getInquiries();
    inquiries.unshift(newInquiry);
    DataStore.saveInquiries(inquiries);

    form.reset();

    Utils.showToast(
      'Private Viewing Requested',
      `Thank you, ${clientName}. Our Master Concierge will contact you within 24 hours to finalize your salon appointment.`,
      'success'
    );
  }
};

if (typeof window !== 'undefined') {
  window.Showcase = Showcase;
}

