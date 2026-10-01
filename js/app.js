/**
 * Aurelia Fine Jewels - Main Application Controller & Client-Side Hash Router
 * Smooth static hosting routing (GitHub Pages & Netlify compatible), state orchestration.
 */

const App = {
  init() {
    this.setupCurrencySelector();
    this.setupRouter();
    this.setupGlobalEvents();

    // Initialize public showcase
    Showcase.init();

    // Route current URL
    this.handleRoute();
  },

  setupCurrencySelector() {
    const selector = document.getElementById('currency-selector');
    const mobileSelector = document.getElementById('mobile-currency-selector');
    const activeCurr = DataStore.getCurrency();

    if (selector) {
      selector.value = activeCurr;
      selector.addEventListener('change', (e) => this.changeCurrency(e.target.value));
    }

    if (mobileSelector) {
      mobileSelector.value = activeCurr;
      mobileSelector.addEventListener('change', (e) => this.changeCurrency(e.target.value));
    }
  },

  changeCurrency(newCurrency) {
    DataStore.setCurrency(newCurrency);

    // Sync other selectors
    const selector = document.getElementById('currency-selector');
    const mobileSelector = document.getElementById('mobile-currency-selector');
    if (selector) selector.value = newCurrency;
    if (mobileSelector) mobileSelector.value = newCurrency;

    // Refresh displays
    Showcase.renderMetalRates();
    Showcase.renderCollections();
    Showcase.renderWishlistDrawer();

    if (Utils.isAdminAuthenticated()) {
      Admin.renderCurrentTab();
    }

    Utils.showToast('Currency Updated', `Displaying values in ${newCurrency}`, 'gold');
  },

  setupRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  handleRoute() {
    const rawHash = window.location.hash || '#/';
    const hash = rawHash.toLowerCase().split('?')[0];

    const showcaseView = document.getElementById('public-showcase-view');
    const adminApp = document.getElementById('admin-app-container');
    const loginView = document.getElementById('admin-login-view');

    if (hash.startsWith('#/admin')) {
      // Check session
      if (!Utils.isAdminAuthenticated()) {
        Admin.showLoginView();
        return;
      }

      // Route to appropriate admin tab
      Admin.showDashboardView();

      if (hash === '#/admin/payroll') {
        Admin.switchTab('payroll');
      } else if (hash === '#/admin/ledger') {
        Admin.switchTab('ledger');
      } else if (hash === '#/admin/stock') {
        Admin.switchTab('stock');
      } else if (hash === '#/admin/inquiries') {
        Admin.switchTab('inquiries');
      } else if (hash === '#/admin/rates') {
        Admin.switchTab('rates');
      } else {
        Admin.switchTab('dashboard');
      }
    } else {
      // Public Showcase route
      if (adminApp) adminApp.classList.add('hidden');
      if (loginView) loginView.classList.add('hidden');
      if (showcaseView) showcaseView.classList.remove('hidden');

      if (hash === '#/collections') {
        setTimeout(() => {
          const el = document.getElementById('collections');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#/story') {
        setTimeout(() => {
          const el = document.getElementById('craftsmanship');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#/contact') {
        setTimeout(() => {
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#/' || hash === '') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  },

  setupGlobalEvents() {
    // Mobile navigation toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileDrawerClose = document.getElementById('mobile-drawer-close');
    const mobileOverlay = document.getElementById('mobile-drawer-overlay');

    const openMobile = () => {
      if (mobileOverlay) mobileOverlay.classList.remove('hidden');
      if (mobileDrawer) mobileDrawer.classList.remove('translate-x-full');
    };

    const closeMobile = () => {
      if (mobileDrawer) mobileDrawer.classList.add('translate-x-full');
      if (mobileOverlay) setTimeout(() => mobileOverlay.classList.add('hidden'), 250);
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobile);
    if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobile);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobile);

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMobile);
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.fixed.flex:not(.hidden)').forEach(modal => {
          Utils.closeModal(modal.id);
        });
        Showcase.closeWishlistDrawer();
      }
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          const modal = backdrop.closest('.fixed');
          if (modal) Utils.closeModal(modal.id);
        }
      });
    });

    // Payroll filter & search
    const payrollFilterSelect = document.getElementById('payroll-status-filter');
    if (payrollFilterSelect) {
      payrollFilterSelect.addEventListener('change', (e) => {
        Admin.payrollFilter = e.target.value;
        Admin.renderPayrollTable();
      });
    }

    const payrollSearchInput = document.getElementById('payroll-search-input');
    if (payrollSearchInput) {
      payrollSearchInput.addEventListener('input', (e) => {
        Admin.payrollSearch = e.target.value.toLowerCase().trim();
        Admin.renderPayrollTable();
      });
    }

    // Ledger filter & search
    const ledgerFilterSelect = document.getElementById('ledger-category-filter');
    if (ledgerFilterSelect) {
      ledgerFilterSelect.addEventListener('change', (e) => {
        Admin.ledgerFilter = e.target.value;
        Admin.renderLedgerTable();
      });
    }

    const ledgerSearchInput = document.getElementById('ledger-search-input');
    if (ledgerSearchInput) {
      ledgerSearchInput.addEventListener('input', (e) => {
        Admin.ledgerSearch = e.target.value.toLowerCase().trim();
        Admin.renderLedgerTable();
      });
    }

    // Stock filter & search
    const stockFilterSelect = document.getElementById('stock-category-filter');
    if (stockFilterSelect) {
      stockFilterSelect.addEventListener('change', (e) => {
        Admin.stockFilter = e.target.value;
        Admin.renderStockTable();
      });
    }

    const stockSearchInput = document.getElementById('stock-search-input');
    if (stockSearchInput) {
      stockSearchInput.addEventListener('input', (e) => {
        Admin.stockSearch = e.target.value.toLowerCase().trim();
        Admin.renderStockTable();
      });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('main-navbar');
      if (!nav) return;
      if (window.scrollY > 40) {
        nav.classList.add('bg-black/90', 'border-[#D4AF37]/30', 'shadow-2xl');
        nav.classList.remove('bg-black/60', 'border-[#D4AF37]/15');
      } else {
        nav.classList.remove('bg-black/90', 'border-[#D4AF37]/30', 'shadow-2xl');
        nav.classList.add('bg-black/60', 'border-[#D4AF37]/15');
      }
    });
  }
};

// Auto boot on DOM Content Loaded
if (typeof window !== 'undefined') {
  window.App = App;
}

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

