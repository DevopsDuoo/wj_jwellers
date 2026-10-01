/**
 * WJ Jewellers - Utilities & Helper Functions
 * Day/Night Theme controller, currency formatting, toasts, modals, session auth, CSV export.
 */

const Utils = {
  // Multi-Palette Theme Management
  initPalette() {
    const savedPalette = (typeof DataStore !== 'undefined' && DataStore.getPalette)
      ? DataStore.getPalette()
      : 'burgundy';
    this.applyPalette(savedPalette, false);
    this.bindPaletteEvents();
  },

  applyPalette(paletteId, notify = false) {
    const validPalettes = ['emerald', 'burgundy', 'sapphire', 'ivory'];
    const activePalette = validPalettes.includes(paletteId) ? paletteId : 'burgundy';
    const body = document.body;
    const html = document.documentElement;

    if (body) {
      validPalettes.forEach(p => body.classList.remove(`theme-${p}`));
      body.classList.add(`theme-${activePalette}`);
    }

    // Synchronize dark/light mode classes
    const themeIconButtons = document.querySelectorAll ? document.querySelectorAll('.theme-toggle-icon') : [];
    if (activePalette === 'ivory') {
      if (body) {
        body.classList.add('light-theme');
        body.classList.remove('dark');
      }
      if (html) html.classList.remove('dark');
      themeIconButtons.forEach(btn => {
        btn.className = 'theme-toggle-icon fa-solid fa-moon text-amber-700';
      });
    } else {
      if (body) {
        body.classList.remove('light-theme');
        body.classList.add('dark');
      }
      if (html) html.classList.add('dark');
      themeIconButtons.forEach(btn => {
        btn.className = 'theme-toggle-icon fa-solid fa-sun text-[#F3E5AB]';
      });
    }

    // Synchronize select elements
    if (typeof document !== 'undefined' && document.querySelectorAll) {
      document.querySelectorAll('.palette-selector-select').forEach(select => {
        select.value = activePalette;
      });

      // Synchronize swatch buttons
      document.querySelectorAll('.palette-swatch-btn').forEach(btn => {
        if (btn.dataset.palette === activePalette) {
          btn.classList.add('ring-2', 'ring-white', 'scale-110');
        } else {
          btn.classList.remove('ring-2', 'ring-white', 'scale-110');
        }
      });
    }

    if (typeof DataStore !== 'undefined' && DataStore.setPalette) {
      DataStore.setPalette(activePalette);
    }

    if (notify && typeof PALETTES !== 'undefined' && PALETTES[activePalette]) {
      const p = PALETTES[activePalette];
      this.showToast(
        p.name,
        `${p.desc} activated across the boutique & atelier.`,
        'gold'
      );
    }
  },

  setPalette(paletteId) {
    this.applyPalette(paletteId, true);
  },

  initTheme() {
    this.initPalette();
  },

  toggleTheme() {
    const current = (typeof DataStore !== 'undefined' && DataStore.getPalette)
      ? DataStore.getPalette()
      : 'emerald';
    if (current === 'ivory') {
      this.setPalette('emerald');
    } else {
      this.setPalette('ivory');
    }
  },

  bindPaletteEvents() {
    if (typeof document === 'undefined' || !document.querySelectorAll) return;
    document.querySelectorAll('.palette-selector-select').forEach(select => {
      select.addEventListener('change', (e) => {
        this.setPalette(e.target.value);
      });
    });

    document.querySelectorAll('.palette-swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pal = btn.dataset.palette;
        if (pal) this.setPalette(pal);
      });
    });
  },

  // Format currency based on active selection
  formatPrice(amountUsd, forceCurrency = null) {
    const code = forceCurrency || DataStore.getCurrency();
    const curr = CURRENCIES[code] || CURRENCIES.INR;
    const converted = amountUsd * curr.rate;
    
    if (code === 'INR') {
      return curr.symbol + Math.round(converted).toLocaleString('en-IN');
    } else if (code === 'AED') {
      return curr.symbol + Math.round(converted).toLocaleString('en-US');
    } else {
      return curr.symbol + Math.round(converted).toLocaleString('en-US');
    }
  },

  // Format gram weight price (and Indian Tola / 10g rate in INR)
  formatGramRate(usdRate) {
    const code = DataStore.getCurrency();
    const curr = CURRENCIES[code] || CURRENCIES.INR;
    const convertedPerGram = usdRate * curr.rate;
    
    if (code === 'INR') {
      const per10g = Math.round(convertedPerGram * 10);
      return `${curr.symbol}${convertedPerGram.toFixed(0)}/g (${curr.symbol}${per10g.toLocaleString('en-IN')}/10g)`;
    }
    return `${curr.symbol}${convertedPerGram.toFixed(2)}/g`;
  },

  // Format readable dates
  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  },

  // Toast Notification System
  showToast(title, message = '', type = 'gold') {
    if (typeof document === 'undefined' || !document.getElementById) return;
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-slide-in flex items-start gap-3 p-4 rounded-xl shadow-2xl transition-all duration-300 pointer-events-auto border ${
      type === 'error'
        ? 'bg-[#180A0A] border-rose-500/50 text-rose-100 shadow-[0_4px_25px_rgba(244,63,94,0.25)]'
        : type === 'success'
        ? 'bg-[#0A180E] border-emerald-500/50 text-emerald-100 shadow-[0_4px_25px_rgba(16,185,129,0.25)]'
        : 'bg-[#141416] border-[#D4AF37]/50 text-[#F5F5F7] shadow-[0_6px_30px_rgba(212,175,55,0.25)]'
    }`;

    let icon = 'fa-gem';
    let iconColor = 'text-[#D4AF37]';
    if (type === 'error') {
      icon = 'fa-circle-exclamation';
      iconColor = 'text-rose-400';
    } else if (type === 'success') {
      icon = 'fa-circle-check';
      iconColor = 'text-emerald-400';
    }

    toast.innerHTML = `
      <div class="mt-0.5 text-lg ${iconColor}">
        <i class="fa-solid ${icon}"></i>
      </div>
      <div class="flex-1 min-w-[200px]">
        <h4 class="font-cinzel text-xs tracking-wider font-semibold ${type === 'gold' ? 'text-[#E5C558]' : ''}">${title}</h4>
        ${message ? `<p class="text-xs text-gray-300 mt-0.5 leading-relaxed">${message}</p>` : ''}
      </div>
      <button class="text-gray-400 hover:text-white text-xs p-1" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  },

  // Modal open/close
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const openModals = document.querySelectorAll('.fixed.flex:not(.hidden)');
    if (openModals.length === 0) {
      document.body.style.overflow = '';
    }
  },

  // Admin Session Management
  isAdminAuthenticated() {
    const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      return data && data.user === 'admin' && data.authenticated === true;
    } catch (e) {
      return false;
    }
  },

  setAdminSession(user = 'admin') {
    const sessionData = {
      user: user,
      role: 'Master Administrator',
      authenticated: true,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
  },

  clearAdminSession() {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // CSV Export utility
  exportToCsv(filename, headers, rows) {
    const processRow = (row) => {
      return row.map(val => {
        let text = (val === null || val === undefined) ? '' : String(val);
        text = text.replace(/"/g, '""');
        return `"${text}"`;
      }).join(',');
    };

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(processRow)].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

if (typeof window !== 'undefined') {
  window.Utils = Utils;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Utils };
}
