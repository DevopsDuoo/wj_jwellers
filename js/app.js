/**
 * WJ Jewellers - 56mm Jewellery Barcode & Tag Generator
 * Direct entry point for thermal roll printing engine (Zero credentials, zero barriers).
 */

const App = {
  init() {
    // Reset any locked body overflow
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
    }

    // Initialize Barcode & Tag Generator directly
    if (typeof BarcodeTags !== 'undefined' && typeof BarcodeTags.init === 'function') {
      BarcodeTags.init();
    }

    this.setupGlobalEvents();
  },

  setupGlobalEvents() {
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (typeof BarcodeTags !== 'undefined' && typeof BarcodeTags.closePrinterGuideModal === 'function') {
          BarcodeTags.closePrinterGuideModal();
        }
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
