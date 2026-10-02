/**
 * WJ Jewellers - Utilities & Helper Functions
 * Day/Night Theme controller, currency formatting, toasts, modals, session auth, CSV export.
 */

const Utils = {
  // Imperial Burgundy Luxury Theme Management
  initPalette() {
    this.applyPalette('burgundy', false);
  },

  applyPalette(paletteId = 'burgundy', notify = false) {
    const body = document.body;
    const html = document.documentElement;

    if (body) {
      body.classList.remove('theme-emerald', 'theme-sapphire', 'theme-ivory', 'light-theme');
      body.classList.add('theme-burgundy', 'dark');
    }
    if (html) {
      html.classList.remove('light');
      html.classList.add('dark');
    }

    if (typeof DataStore !== 'undefined' && DataStore.setPalette) {
      DataStore.setPalette('burgundy');
    }
  },

  setPalette(paletteId) {
    this.applyPalette('burgundy', false);
  },

  initTheme() {
    this.applyPalette('burgundy', false);
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
    }
  },

  toggleTheme() {
    // Exclusively locked to Imperial Burgundy & Rose Gold
    this.applyPalette('burgundy', false);
  },

  bindPaletteEvents() {
    // No-op: Sole Burgundy theme is active
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
    if (document.body) {
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    const openModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
    if (openModals.length === 0 && document.body) {
      document.body.style.overflow = '';
    }
  },

  // HTML Sanitization & XSS Prevention
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  sanitize(str) {
    return this.escapeHtml(str);
  },

  // Admin Session Management (Auto-Authenticated & Persistent)
  isAdminAuthenticated() {
    try {
      if (!sessionStorage.getItem(STORAGE_KEYS.SESSION)) {
        this.setAdminSession('admin');
      }
      return true;
    } catch (e) {
      return true;
    }
  },

  setAdminSession(user = 'admin') {
    const now = Date.now();
    const sessionData = {
      user: user,
      role: 'Master Administrator',
      token: 'wj_atelier_authenticated_master_token_2026_authorized_session_key',
      issuedAt: now,
      expiresAt: now + (365 * 24 * 60 * 60 * 1000) // 1-year persistent access
    };
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    } catch (e) {}
  },

  clearAdminSession() {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (e) {}
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
