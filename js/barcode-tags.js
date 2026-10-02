/**
 * WJ Jewellers - Jewellery Barcode & QR Tag Generator Component
 * Production-ready thermal label printing engine for rat-tail / cricket bat labels
 * Dimensions: 86mm Total Width x 15mm Height (56mm Printable Blade + 30mm Ink-Free Looping Tail)
 * Compatible with TSC, Zebra, TVS, Honeywell thermal barcode printers (203 / 300 DPI)
 * Supports:
 *  1. 56mm Center-Folded Girvi / Loan Tag (28mm Customer/Loan Side + 28mm Item/Valuation Side)
 *  2. 3-Column Retail Barcode & ISO QR Inventory Tag
 */

const BarcodeTags = {
  // Local storage key (v3 ensures clean migration to center-folded tags)
  STORAGE_KEY: 'wj_jewellery_barcode_tags_v3',

  // Current working state
  tags: [],
  previewScale: 1.5, // 1.0 (100% 1:1 scale), 1.5 (150%), 2.0 (200%)
  showLoopTailBorder: true,
  autoIncrementSku: true,
  activeFormTab: 'folded',

  // Default sample tags for staff preview (All 56mm center-folded tags matching user sketch)
  defaultTags: [
    {
      id: 'tag_rushikesh_1',
      tagType: 'folded',
      firstName: 'RUSHIKESH',
      middleName: 'HEMANT',
      lastName: 'WADNERE',
      city: 'KANNAD',
      loanNo: '1042',
      date: '02/10/2026',
      metal: 'G',
      itemName: 'RING',
      pieces: 1,
      weightText: '2-GRAM',
      amount: '15000/-',
      selected: true
    },
    {
      id: 'tag_anand_2',
      tagType: 'folded',
      firstName: 'ANAND',
      middleName: 'PRAKASH',
      lastName: 'SHINDE',
      city: 'KANNAD',
      loanNo: '1043',
      date: '02/10/2026',
      metal: 'G',
      itemName: 'CHAIN',
      pieces: 1,
      weightText: '14.850G',
      amount: '85000/-',
      selected: true
    },
    {
      id: 'tag_vikram_3',
      tagType: 'folded',
      firstName: 'VIKRAM',
      middleName: 'SURESH',
      lastName: 'PATIL',
      city: 'KANNAD',
      loanNo: '1044',
      date: '02/10/2026',
      metal: 'S',
      itemName: 'PAYAL',
      pieces: 2,
      weightText: '45.200G',
      amount: '6500/-',
      selected: true
    },
    {
      id: 'tag_suresh_4',
      tagType: 'folded',
      firstName: 'SURESH',
      middleName: 'KESHAV',
      lastName: 'SONAWANE',
      city: 'KANNAD',
      loanNo: '1045',
      date: '02/10/2026',
      metal: 'G',
      itemName: 'KADA',
      pieces: 1,
      weightText: '25.400G',
      amount: '120000/-',
      selected: true
    }
  ],

  init() {
    this.loadTags();
    this.setTodayDefaultDate();
    this.render();
    this.setupEventListeners();
  },

  setTodayDefaultDate() {
    const dateInput = document.getElementById('tag-input-date');
    if (dateInput && !dateInput.value) {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      dateInput.value = `${dd}/${mm}/${yyyy}`;
    }
  },

  loadTags() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tags = parsed.map(t => {
            if (t.tagType === 'retail' || !t.city) {
              return {
                id: t.id || ('tag_' + Date.now()),
                tagType: 'folded',
                firstName: 'CLIENT',
                middleName: '',
                lastName: t.itemName || 'ORNAMENT',
                city: 'KANNAD',
                loanNo: String(t.tagNum || '1050').replace(/^[A-Z\-]+/i, '') || '1050',
                date: '02/10/2026',
                metal: 'G',
                itemName: (t.itemName || 'JEWELLERY').replace(/^(GOLD|GENTS|LADIES)\s*/i, '') || 'JEWELLERY',
                pieces: t.pieces || 1,
                weightText: (t.netWt ? t.netWt.toFixed(3) + 'G' : '10.000G'),
                amount: '45000/-',
                selected: true
              };
            }
            return t;
          });
        } else {
          this.tags = JSON.parse(JSON.stringify(this.defaultTags));
          this.saveTags();
        }
      } else {
        this.tags = JSON.parse(JSON.stringify(this.defaultTags));
        this.saveTags();
      }
    } catch (e) {
      console.warn('Could not parse saved tags, resetting to default.', e);
      this.tags = JSON.parse(JSON.stringify(this.defaultTags));
    }
  },

  saveTags() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tags));
    } catch (e) {
      console.error('Failed to save tags to localStorage', e);
    }
  },

  setupEventListeners() {
    const grossInput = document.getElementById('tag-input-gross');
    const lessInput = document.getElementById('tag-input-less');

    if (grossInput && lessInput) {
      const recalc = () => this.calculateFormNet();
      grossInput.addEventListener('input', recalc);
      lessInput.addEventListener('input', recalc);
    }
  },

  calculateFormNet() {
    const gross = parseFloat(document.getElementById('tag-input-gross')?.value) || 0;
    const less = parseFloat(document.getElementById('tag-input-less')?.value) || 0;
    const net = Math.max(0, gross - less);
    const netDisplay = document.getElementById('tag-input-net-display');
    const netHidden = document.getElementById('tag-input-net');
    
    if (netDisplay) netDisplay.value = net.toFixed(3) + ' g';
    if (netHidden) netHidden.value = net.toFixed(3);
  },

  generateNextTagNum() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `WJ-JW-${randomSuffix}`;
  },

  switchFormTab(tab) {
    this.activeFormTab = tab;
    const foldedForm = document.getElementById('tag-form-folded');
    const retailForm = document.getElementById('barcode-quick-add-form');
    const tabFoldedBtn = document.getElementById('form-tab-folded');
    const tabRetailBtn = document.getElementById('form-tab-retail');

    if (tab === 'folded') {
      if (foldedForm) foldedForm.classList.remove('hidden');
      if (retailForm) retailForm.classList.add('hidden');
      if (tabFoldedBtn) {
        tabFoldedBtn.classList.add('bg-[#D4AF37]/20', 'text-[#F3E5AB]', 'border-[#D4AF37]/40');
        tabFoldedBtn.classList.remove('text-gray-400');
      }
      if (tabRetailBtn) {
        tabRetailBtn.classList.remove('bg-[#D4AF37]/20', 'text-[#F3E5AB]', 'border-[#D4AF37]/40');
        tabRetailBtn.classList.add('text-gray-400');
      }
    } else {
      if (foldedForm) foldedForm.classList.add('hidden');
      if (retailForm) retailForm.classList.remove('hidden');
      if (tabRetailBtn) {
        tabRetailBtn.classList.add('bg-[#D4AF37]/20', 'text-[#F3E5AB]', 'border-[#D4AF37]/40');
        tabRetailBtn.classList.remove('text-gray-400');
      }
      if (tabFoldedBtn) {
        tabFoldedBtn.classList.remove('bg-[#D4AF37]/20', 'text-[#F3E5AB]', 'border-[#D4AF37]/40');
        tabFoldedBtn.classList.add('text-gray-400');
      }
    }
  },

  // 1. Submit Handler for 56mm Center-Folded Girvi / Loan Tag
  handleFoldedTagSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const firstName = form.firstName.value.trim().toUpperCase() || 'CUSTOMER';
    const middleName = form.middleName ? form.middleName.value.trim().toUpperCase() : '';
    const lastName = form.lastName.value.trim().toUpperCase() || '';
    const city = form.city.value.trim().toUpperCase() || 'KANNAD';
    let loanNo = form.loanNo.value.trim().toUpperCase() || '';
    loanNo = loanNo.replace(/^[L#:\-\s]+/i, '').trim();

    const date = form.date.value.trim() || '02/10/2026';
    const metal = (form.metal.value || 'G').toUpperCase();
    const itemName = form.itemName.value.trim().toUpperCase() || 'RING';
    const pieces = parseInt(form.pieces.value) || 1;
    let weightText = form.weightText.value.trim().toUpperCase() || '2-GRAM';
    
    // Normalize weight formatting if user entered plain number
    if (/^\d+(\.\d+)?$/.test(weightText)) {
      weightText = `${weightText}G`;
    }

    let amount = form.amount.value.trim();
    if (!amount.endsWith('/-') && !amount.endsWith('/=')) {
      amount += '/-';
    }

    const newTag = {
      id: 'tag_folded_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tagType: 'folded',
      firstName,
      middleName,
      lastName,
      city,
      loanNo,
      date,
      metal,
      itemName,
      pieces,
      weightText,
      amount,
      selected: true
    };

    this.tags.unshift(newTag);
    this.saveTags();
    this.render();

    // Preserve city and date for convenience, reset other inputs
    const prevCity = form.city.value;
    const prevDate = form.date.value;
    form.reset();
    form.city.value = prevCity;
    form.date.value = prevDate;
    form.metal.value = metal;
    form.pieces.value = '1';

    if (typeof Utils !== 'undefined') {
      Utils.showToast('Folded Tag Created', `Tag for ${firstName} ${lastName} (${metal}-${itemName}) added.`, 'success');
    }
  },

  // 2. Submit Handler for 3-Column Retail Barcode Tag
  handleQuickAddSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const itemName = form.itemName.value.trim().toUpperCase() || 'GOLD ORNAMENT';
    const grossWt = parseFloat(form.grossWt.value) || 0;
    const lessWt = parseFloat(form.lessWt.value) || 0;
    const netWt = Math.max(0, grossWt - lessWt);
    const makingPct = parseFloat(form.makingPct.value) || 12.0;
    const pieces = parseInt(form.pieces.value) || 1;
    const purity = form.purity.value || '91.6%';
    const huid = form.huid.value.trim().toUpperCase() || '';
    const showHuid = form.showHuid.checked;
    let tagNum = form.tagNum.value.trim().toUpperCase();

    if (!tagNum) {
      tagNum = this.generateNextTagNum();
    }

    const newTag = {
      id: 'tag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tagType: 'retail',
      tagNum,
      itemName,
      grossWt: parseFloat(grossWt.toFixed(3)),
      lessWt: parseFloat(lessWt.toFixed(3)),
      netWt: parseFloat(netWt.toFixed(3)),
      makingPct: parseFloat(makingPct.toFixed(1)),
      pieces,
      purity,
      huid,
      showHuid,
      selected: true
    };

    this.tags.unshift(newTag);
    this.saveTags();
    this.render();

    // Reset form
    form.reset();
    form.tagNum.value = this.generateNextTagNum();
    form.purity.value = '91.6%';
    form.makingPct.value = '12.0';
    form.pieces.value = '1';
    form.showHuid.checked = true;
    this.calculateFormNet();

    if (typeof Utils !== 'undefined') {
      Utils.showToast('Retail Tag Created', `Label ${newTag.tagNum} generated.`, 'success');
    }
  },

  addBlankTag() {
    const newTag = {
      id: 'tag_blank_' + Date.now(),
      tagType: 'folded',
      firstName: 'RUSHIKESH',
      middleName: 'HEMANT',
      lastName: 'WADNERE',
      city: 'KANNAD',
      loanNo: '1050',
      date: '02/10/2026',
      metal: 'G',
      itemName: 'RING',
      pieces: 1,
      weightText: '2-GRAM',
      amount: '15000/-',
      selected: true
    };
    this.tags.unshift(newTag);
    this.saveTags();
    this.render();
    if (typeof Utils !== 'undefined') {
      Utils.showToast('Blank Tag Added', 'Click on any field on the tag preview to edit inline.', 'gold');
    }
  },

  duplicateTag(tagId) {
    const existing = this.tags.find(t => t.id === tagId);
    if (!existing) return;

    const copy = JSON.parse(JSON.stringify(existing));
    copy.id = 'tag_' + Date.now();
    if (copy.tagNum) copy.tagNum = this.generateNextTagNum();
    if (copy.loanNo && !isNaN(parseInt(copy.loanNo))) {
      copy.loanNo = String(parseInt(copy.loanNo) + 1);
    }
    copy.selected = true;

    this.tags.unshift(copy);
    this.saveTags();
    this.render();
    if (typeof Utils !== 'undefined') {
      Utils.showToast('Tag Duplicated', `Duplicate created in queue.`, 'gold');
    }
  },

  deleteTag(tagId) {
    this.tags = this.tags.filter(t => t.id !== tagId);
    this.saveTags();
    this.render();
    if (typeof Utils !== 'undefined') {
      Utils.showToast('Tag Removed', 'Tag was deleted from queue.', 'gold');
    }
  },

  clearAllTags() {
    if (!confirm('Are you sure you want to clear all tags from the print queue?')) return;
    this.tags = [];
    this.saveTags();
    this.render();
    if (typeof Utils !== 'undefined') {
      Utils.showToast('Queue Cleared', 'All tags have been removed.', 'gold');
    }
  },

  restoreDemoTags() {
    this.tags = JSON.parse(JSON.stringify(this.defaultTags));
    this.saveTags();
    this.render();
    if (typeof Utils !== 'undefined') {
      Utils.showToast('Calibration Tags Loaded', 'Sample folded and calibration tags loaded.', 'success');
    }
  },

  toggleSelectAll(checked) {
    this.tags.forEach(t => t.selected = checked);
    this.renderTagList();
    this.updateSelectedCount();
  },

  toggleTagSelect(tagId, checked) {
    const tag = this.tags.find(t => t.id === tagId);
    if (tag) tag.selected = checked;
    this.updateSelectedCount();
  },

  updateSelectedCount() {
    const count = this.tags.filter(t => t.selected).length;
    const badge = document.getElementById('selected-tags-count');
    if (badge) badge.innerText = `${count} of ${this.tags.length} Selected`;

    const printBtn = document.getElementById('print-selected-btn');
    if (printBtn) {
      printBtn.disabled = count === 0;
      printBtn.classList.toggle('opacity-50', count === 0);
      printBtn.classList.toggle('cursor-not-allowed', count === 0);
    }
  },

  setPreviewScale(scale) {
    this.previewScale = parseFloat(scale);
    const container = document.getElementById('tags-preview-container');
    if (container) {
      container.style.setProperty('--tag-scale', this.previewScale);
    }
    document.querySelectorAll('[data-tag-scale-btn]').forEach(btn => {
      const bScale = parseFloat(btn.getAttribute('data-tag-scale-btn'));
      if (Math.abs(bScale - this.previewScale) < 0.05) {
        btn.classList.add('bg-[#D4AF37]/20', 'text-[#F3E5AB]', 'border-[#D4AF37]/50');
        btn.classList.remove('text-gray-400', 'border-white/10');
      } else {
        btn.classList.remove('bg-[#D4AF37]/20', 'text-[#F3E5AB]', 'border-[#D4AF37]/50');
        btn.classList.add('text-gray-400', 'border-white/10');
      }
    });
  },

  toggleCardFoldView(tagId) {
    const foldedEl = document.getElementById(`folded-view-${tagId}`);
    const btnText = document.getElementById(`fold-btn-text-${tagId}`);
    if (foldedEl) {
      const isHidden = foldedEl.classList.contains('hidden');
      if (isHidden) {
        foldedEl.classList.remove('hidden');
        if (btnText) btnText.innerText = 'Hide 3D Fold';
      } else {
        foldedEl.classList.add('hidden');
        if (btnText) btnText.innerText = 'Fold Preview';
      }
    }
  },

  // Update tag field inline from direct preview editing
  updateTagField(tagId, field, value) {
    const tag = this.tags.find(t => t.id === tagId);
    if (!tag) return;

    if (field === 'grossWt' || field === 'lessWt') {
      tag[field] = parseFloat(value) || 0;
      tag.netWt = Math.max(0, tag.grossWt - tag.lessWt);
    } else if (field === 'pieces') {
      tag.pieces = parseInt(value) || 1;
    } else if (field === 'makingPct') {
      tag.makingPct = parseFloat(value) || 0;
    } else if (field === 'itemName') {
      tag.itemName = value.toUpperCase().trim();
    } else if (field === 'tagNum') {
      tag.tagNum = value.toUpperCase().trim();
    } else if (field === 'huid') {
      tag.huid = value.toUpperCase().trim();
    } else if (field === 'purity') {
      tag.purity = value.trim();
    } else if (field === 'firstName' || field === 'middleName' || field === 'lastName' || field === 'city') {
      tag[field] = value.toUpperCase().trim();
    } else if (field === 'loanNo') {
      tag.loanNo = value.replace(/^[L#:\-\s]+/i, '').trim();
    } else if (field === 'date') {
      tag.date = value.trim();
    } else if (field === 'metal') {
      const m = value.toUpperCase().trim();
      tag.metal = (m.startsWith('S') || m === 'SILVER') ? 'S' : 'G';
    } else if (field === 'weightText') {
      tag.weightText = value.toUpperCase().trim();
    } else if (field === 'amount') {
      tag.amount = value.trim();
    }

    this.saveTags();
    this.refreshSingleTagDOM(tagId);
  },

  getQrPayload(tag) {
    const netFormatted = typeof tag.netWt === 'number' ? tag.netWt.toFixed(3) : parseFloat(tag.netWt || 0).toFixed(3);
    const purityClean = (tag.purity || '91.6%').trim();
    return `WJ-${tag.tagNum},${netFormatted},${purityClean}`;
  },

  renderQrToElement(containerEl, payload) {
    containerEl.innerHTML = '';
    try {
      if (typeof QRCode !== 'undefined') {
        new QRCode(containerEl, {
          text: payload,
          width: 52,
          height: 52,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } else {
        this.renderQrFallback(containerEl, payload);
      }
    } catch (e) {
      this.renderQrFallback(containerEl, payload);
    }
  },

  renderQrFallback(containerEl, payload) {
    const canvas = document.createElement('canvas');
    canvas.width = 52;
    canvas.height = 52;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 52, 52);
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, 4, 16, 16);
    ctx.clearRect(7, 7, 10, 10);
    ctx.fillRect(9, 9, 6, 6);
    ctx.fillRect(32, 4, 16, 16);
    ctx.clearRect(35, 7, 10, 10);
    ctx.fillRect(37, 9, 6, 6);
    ctx.fillRect(4, 32, 16, 16);
    ctx.clearRect(7, 35, 10, 10);
    ctx.fillRect(9, 37, 6, 6);
    containerEl.appendChild(canvas);
  },

  render() {
    this.renderTagList();
    this.updateSelectedCount();
  },

  renderTagList() {
    const container = document.getElementById('tags-preview-container');
    if (!container) return;

    if (this.tags.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
          <div class="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4 text-[#F3E5AB]">
            <i class="fa-solid fa-tags text-2xl"></i>
          </div>
          <h3 class="font-cinzel text-base text-white font-semibold">Print Queue is Empty</h3>
          <p class="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Generate your first jewellery tag using the Quick Add form on the left, load factory sample labels, or bulk import inventory via CSV.
          </p>
          <div class="mt-5 flex items-center justify-center gap-3">
            <button 
              type="button" 
              onclick="BarcodeTags.restoreDemoTags()"
              class="px-4 py-2 rounded-xl text-xs font-cinzel font-semibold gold-btn-gradient uppercase tracking-wider"
            >
              <i class="fa-solid fa-wand-magic-sparkles mr-1.5"></i> Load Sample Calibration Tags
            </button>
            <button 
              type="button" 
              onclick="BarcodeTags.addBlankTag()"
              class="px-4 py-2 rounded-xl text-xs font-cinzel text-gray-300 hover:text-white border border-white/10 hover:border-white/30"
            >
              <i class="fa-solid fa-plus mr-1.5"></i> Add Blank Tag
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${this.tags.map(tag => this.generateTagCardHTML(tag)).join('')}
      </div>
    `;

    // Render QR codes for retail tags
    this.tags.forEach(tag => {
      if (tag.tagType === 'retail') {
        const qrEl = document.getElementById(`qr-preview-${tag.id}`);
        if (qrEl) {
          this.renderQrToElement(qrEl, this.getQrPayload(tag));
        }
      }
    });
  },

  refreshSingleTagDOM(tagId) {
    const tag = this.tags.find(t => t.id === tagId);
    if (!tag) return;
    const cardEl = document.getElementById(`tag-card-${tagId}`);
    if (!cardEl) {
      this.renderTagList();
      return;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.generateTagCardHTML(tag);
    const newCard = tempDiv.firstElementChild;
    cardEl.replaceWith(newCard);

    if (tag.tagType === 'retail') {
      const qrEl = document.getElementById(`qr-preview-${tag.id}`);
      if (qrEl) {
        this.renderQrToElement(qrEl, this.getQrPayload(tag));
      }
    }
  },

  // Generates HTML Card for either 56mm Center-Folded Tag or Retail Tag
  generateTagCardHTML(tag) {
    const esc = (s) => (typeof Utils !== 'undefined' && Utils.escapeHtml) ? Utils.escapeHtml(s) : String(s || '');
    const isChecked = tag.selected ? 'checked' : '';
    const isFolded = tag.tagType !== 'retail';

    // ----------------------------------------------------
    // FORMAT 1: 56mm CENTER-FOLDED GIRVI / LOAN TAG (MATCHES SKETCH)
    // ----------------------------------------------------
    if (isFolded) {
      const firstName = esc(tag.firstName || 'RUSHIKESH');
      const middleName = esc(tag.middleName || 'HEMANT');
      const lastName = esc(tag.lastName || 'WADNERE');
      const city = esc(tag.city || 'KANNAD');
      const loanNo = esc(tag.loanNo || '1042');
      const date = esc(tag.date || '02/10/2026');
      const metal = esc(tag.metal || 'G');
      const itemName = esc(tag.itemName || 'RING');
      const pieces = tag.pieces || 1;
      const weightText = esc(tag.weightText || '2-GRAM');
      let amount = tag.amount ? String(tag.amount).trim() : '15000/-';
      if (!amount.endsWith('/-') && !amount.endsWith('/=')) amount += '/-';
      const safeAmount = esc(amount);

      return `
        <div 
          id="tag-card-${tag.id}" 
          class="tag-queue-card bg-[#141417] border ${tag.selected ? 'border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30' : 'border-white/5'} rounded-2xl p-4 transition-all"
        >
          <!-- Header Strip with Controls -->
          <div class="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-white/5 text-xs">
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  ${isChecked} 
                  onchange="BarcodeTags.toggleTagSelect('${tag.id}', this.checked)"
                  class="w-4 h-4 rounded text-[#D4AF37] focus:ring-0 bg-[#1e1e24] border-gray-600 cursor-pointer"
                />
                <span class="font-mono text-gray-200 font-semibold text-xs tracking-wider">
                  ${metal}-${itemName} · ${weightText}
                </span>
              </label>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-cinzel font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30">
                56mm Center-Folded (${metal === 'G' ? 'Gold' : 'Silver'})
              </span>
              ${loanNo ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800/40">Loan #${loanNo}</span>` : ''}
            </div>

            <div class="flex items-center gap-1.5">
              <button 
                type="button" 
                onclick="BarcodeTags.toggleCardFoldView('${tag.id}')"
                class="px-2.5 py-1 rounded-lg text-[11px] font-cinzel bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/30 transition-all flex items-center gap-1.5"
                title="Toggle visual folded preview"
              >
                <i class="fa-solid fa-arrows-split-up-and-left text-[10px]"></i>
                <span id="fold-btn-text-${tag.id}">Fold Preview</span>
              </button>
              <button 
                type="button" 
                onclick="BarcodeTags.printSingleTag('${tag.id}')"
                class="px-2.5 py-1 rounded-lg text-[11px] font-cinzel bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
                title="Print just this label"
              >
                <i class="fa-solid fa-print text-[10px] text-[#D4AF37]"></i>
                <span class="hidden sm:inline">Print This</span>
              </button>
              <button 
                type="button" 
                onclick="BarcodeTags.duplicateTag('${tag.id}')"
                class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                title="Duplicate label"
              >
                <i class="fa-regular fa-copy text-xs"></i>
              </button>
              <button 
                type="button" 
                onclick="BarcodeTags.deleteTag('${tag.id}')"
                class="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/30 transition-all"
                title="Remove from print queue"
              >
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>

          <!-- The Physical 86mm x 15mm Thermal Tag Preview Strip (UNFOLDED) -->
          <div id="unfolded-view-${tag.id}" class="overflow-x-auto py-2 px-1">
            <div 
              class="thermal-rat-tail-preview mx-auto select-none" 
              title="56mm Printable Blade (Folds in Center at 28mm) + 30mm Looping Tail · Click any value to edit inline"
            >
              <!-- 56mm PRINTABLE BLADE (CENTER FOLDED) -->
              <div class="folded-printable-blade">
                
                <!-- Side 1 (Left 28mm): Customer Names & City + Loan No -->
                <div class="folded-side-1">
                  <div 
                    class="folded-name-bold editable-value"
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'firstName', this.innerText)"
                    title="Click to edit First Name"
                  >${tag.firstName || 'RUSHIKESH'}</div>

                  <div 
                    class="folded-name-bold editable-value"
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'middleName', this.innerText)"
                    title="Click to edit Middle Name"
                  >${tag.middleName || 'HEMANT'}</div>

                  <div 
                    class="folded-name-bold editable-value"
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'lastName', this.innerText)"
                    title="Click to edit Last Name"
                  >${tag.lastName || 'WADNERE'}</div>

                  <div class="folded-city-row">
                    <span 
                      class="editable-value"
                      contenteditable="true"
                      onblur="BarcodeTags.updateTagField('${tag.id}', 'city', this.innerText)"
                      title="Click to edit City"
                    >${tag.city || 'KANNAD'}</span>
                    <span 
                      class="editable-value font-mono font-bold text-gray-900"
                      contenteditable="true"
                      onblur="BarcodeTags.updateTagField('${tag.id}', 'loanNo', this.innerText)"
                      title="Click to edit Loan Number"
                    >${tag.loanNo ? 'L:' + tag.loanNo : ''}</span>
                  </div>
                </div>

                <!-- Center Fold Line (Dashed fold guide at 28mm) -->
                <div class="center-fold-line" title="Center Fold Line (28mm)"></div>

                <!-- Side 2 (Right 28mm): Date, Metal-Item, Weight, Amount -->
                <div class="folded-side-2">
                  <div 
                    class="folded-date-bold editable-value"
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'date', this.innerText)"
                    title="Click to edit Date"
                  >${tag.date || '02/10/2026'}</div>

                  <div class="folded-item-row">
                    <span>
                      <strong 
                        class="editable-value folded-metal-badge"
                        contenteditable="true"
                        onblur="BarcodeTags.updateTagField('${tag.id}', 'metal', this.innerText)"
                        title="Metal (G=Gold, S=Silver)"
                      >${tag.metal || 'G'}</strong>-<span 
                        class="editable-value"
                        contenteditable="true"
                        onblur="BarcodeTags.updateTagField('${tag.id}', 'itemName', this.innerText)"
                        title="Item Name"
                      >${tag.itemName || 'RING'}</span>
                    </span>
                  </div>

                  <div class="folded-weight-row">
                    <span>W</span> 
                    <span 
                      class="editable-value"
                      contenteditable="true"
                      onblur="BarcodeTags.updateTagField('${tag.id}', 'weightText', this.innerText)"
                      title="Weight parameter"
                    >${tag.weightText || '2-GRAM'}</span>
                  </div>

                  <div 
                    class="folded-amount-bold editable-value"
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'amount', this.innerText)"
                    title="Loan / Pledge Amount"
                  >${safeAmount}</div>
                </div>

              </div>

              <!-- 30mm LOOPING TAIL (INK-FREE DUMB STRAP) -->
              <div class="looping-tail flex items-center justify-center">
                <span class="loop-tail-label">──► [ 30mm TAIL ] ──►</span>
                <div class="loop-hole-indicator"></div>
              </div>
            </div>
          </div>

          <!-- INTERACTIVE FOLDED FRONT/BACK PREVIEW (Toggled with button) -->
          <div id="folded-view-${tag.id}" class="hidden py-4 px-3 bg-[#0d0d0f] rounded-xl border border-white/5 my-2">
            <div class="text-center mb-3">
              <span class="text-[11px] font-cinzel text-gray-300 font-semibold flex items-center justify-center gap-2">
                <i class="fa-solid fa-ring text-[#D4AF37]"></i>
                Visual 2-Sided Simulation: When folded at 28mm center on jewellery
              </span>
              <p class="text-[10px] text-gray-400 mt-0.5">Left 28mm acts as Front Face; Right 28mm acts as Back Face.</p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-6">
              <!-- FRONT FACE (28mm x 15mm) -->
              <div class="text-center">
                <span class="text-[9px] font-mono text-emerald-400 uppercase font-semibold block mb-1">Side A: Front Face</span>
                <div class="border-2 border-emerald-500/40 rounded-lg p-2 bg-white text-black shadow-lg" style="width: calc(28mm * 2.2); height: calc(15mm * 2.2);">
                  <div class="h-full flex flex-col justify-between text-left font-sans">
                    <div class="font-black text-xs uppercase tracking-tight leading-tight">${firstName}</div>
                    <div class="font-black text-xs uppercase tracking-tight leading-tight">${middleName}</div>
                    <div class="font-black text-xs uppercase tracking-tight leading-tight">${lastName}</div>
                    <div class="flex items-center justify-between text-[11px] font-bold text-gray-800 leading-tight">
                      <span>${city}</span>
                      <span class="font-mono">${loanNo ? 'L:' + loanNo : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-gray-500 text-xs font-mono flex flex-col items-center">
                <i class="fa-solid fa-repeat text-base text-[#D4AF37] mb-1"></i>
                <span>FLIP</span>
              </div>

              <!-- BACK FACE (28mm x 15mm) -->
              <div class="text-center">
                <span class="text-[9px] font-mono text-amber-400 uppercase font-semibold block mb-1">Side B: Back Face</span>
                <div class="border-2 border-amber-500/40 rounded-lg p-2 bg-white text-black shadow-lg" style="width: calc(28mm * 2.2); height: calc(15mm * 2.2);">
                  <div class="h-full flex flex-col justify-between text-left font-sans">
                    <div class="font-black text-xs tracking-tight leading-tight">${date}</div>
                    <div class="text-[11px] font-extrabold text-black leading-tight">
                      <span>${metal}-${itemName}</span>
                    </div>
                    <div class="text-[11px] font-extrabold text-gray-900 leading-tight">W ${weightText}</div>
                    <div class="font-black text-sm text-black tracking-tight leading-tight">${safeAmount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Summary Footer -->
          <div class="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-gray-400 font-mono">
            <div class="flex items-center gap-4">
              <span>Customer: <strong class="text-white">${firstName} ${lastName}</strong></span>
              <span>Place: <strong class="text-white">${city}</strong></span>
              <span>Item: <strong class="text-amber-300">${metal}-${itemName}</strong></span>
              <span>Weight: <strong class="text-emerald-300">W ${weightText}</strong></span>
              <span>Amount: <strong class="text-white">${safeAmount}</strong></span>
            </div>
            <span class="text-[10px] text-gray-500">Center Fold Pitch: 28mm + 28mm Blade</span>
          </div>
        </div>
      `;
    }

    // ----------------------------------------------------
    // FORMAT 2: 3-COLUMN RETAIL BARCODE & QR TAG
    // ----------------------------------------------------
    const netFormatted = typeof tag.netWt === 'number' ? tag.netWt.toFixed(3) : parseFloat(tag.netWt || 0).toFixed(3);
    const grossFormatted = typeof tag.grossWt === 'number' ? tag.grossWt.toFixed(3) : parseFloat(tag.grossWt || 0).toFixed(3);
    const lessFormatted = typeof tag.lessWt === 'number' ? tag.lessWt.toFixed(3) : parseFloat(tag.lessWt || 0).toFixed(3);
    const safeItemName = esc(tag.itemName);
    const safeTagNum = esc(tag.tagNum);

    return `
      <div 
        id="tag-card-${tag.id}" 
        class="tag-queue-card bg-[#141417] border ${tag.selected ? 'border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30' : 'border-white/5'} rounded-2xl p-4 transition-all"
      >
        <!-- Header Strip with Controls -->
        <div class="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-white/5 text-xs">
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                ${isChecked} 
                onchange="BarcodeTags.toggleTagSelect('${tag.id}', this.checked)"
                class="w-4 h-4 rounded text-[#D4AF37] focus:ring-0 bg-[#1e1e24] border-gray-600 cursor-pointer"
              />
              <span class="font-mono text-gray-200 font-semibold text-xs tracking-wider">${safeTagNum}</span>
            </label>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-cinzel font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30">
              ${esc(tag.purity)}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <button 
              type="button" 
              onclick="BarcodeTags.printSingleTag('${tag.id}')"
              class="px-2.5 py-1 rounded-lg text-[11px] font-cinzel bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
              title="Print just this label"
            >
              <i class="fa-solid fa-print text-[10px] text-[#D4AF37]"></i>
              <span class="hidden sm:inline">Print This</span>
            </button>
            <button 
              type="button" 
              onclick="BarcodeTags.duplicateTag('${tag.id}')"
              class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              title="Duplicate label"
            >
              <i class="fa-regular fa-copy text-xs"></i>
            </button>
            <button 
              type="button" 
              onclick="BarcodeTags.deleteTag('${tag.id}')"
              class="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/30 transition-all"
              title="Remove from print queue"
            >
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </div>

        <!-- The Physical 86mm x 15mm Thermal Tag Preview Strip -->
        <div class="overflow-x-auto py-2 px-1">
          <div 
            class="thermal-rat-tail-preview mx-auto select-none" 
            title="Rat-Tail Jewellery Label (86mm x 15mm) · Click values to edit inline"
          >
            <!-- 56mm PRINTABLE BLADE (HEAD) -->
            <div class="printable-blade">
              <!-- Column 1 (21mm): Left Aligned Weight & Making -->
              <div class="col-spec-1">
                <div 
                  class="tag-text-item tag-item-name font-bold uppercase truncate"
                  contenteditable="true"
                  onblur="BarcodeTags.updateTagField('${tag.id}', 'itemName', this.innerText)"
                  title="Click to edit Item Name"
                >${tag.itemName}</div>
                
                <div class="tag-text-row">
                  <span class="font-bold">G:</span>
                  <span 
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'grossWt', this.innerText)"
                    class="editable-value"
                    title="Gross Wt"
                  >${grossFormatted}</span>
                </div>

                <div class="tag-text-row">
                  <span class="font-bold">L:</span>
                  <span 
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'lessWt', this.innerText)"
                    class="editable-value"
                    title="Less Wt"
                  >${lessFormatted}</span>
                </div>

                <div class="tag-text-row font-bold text-black">
                  <span>N:</span>
                  <span>${netFormatted}</span>
                </div>

                <div class="tag-text-row">
                  <span class="font-bold">VA:</span>
                  <span 
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'makingPct', this.innerText)"
                    class="editable-value"
                    title="Making / VA %"
                  >${tag.makingPct}%</span>
                </div>
              </div>

              <!-- Column 2 (12mm): Pieces, Purity, HUID -->
              <div class="col-spec-2">
                <div class="tag-text-row">
                  <span class="font-bold">P:</span>
                  <span 
                    contenteditable="true"
                    onblur="BarcodeTags.updateTagField('${tag.id}', 'pieces', this.innerText)"
                    class="editable-value"
                    title="Pieces"
                  >${tag.pieces}</span>
                </div>

                <div 
                  class="tag-text-row font-bold"
                  contenteditable="true"
                  onblur="BarcodeTags.updateTagField('${tag.id}', 'purity', this.innerText)"
                  title="Purity %"
                >${tag.purity}</div>

                ${tag.showHuid && tag.huid ? `
                  <div class="tag-text-row text-[5.2pt] leading-tight">
                    <span class="font-bold">HUID:</span>
                    <span 
                      contenteditable="true"
                      onblur="BarcodeTags.updateTagField('${tag.id}', 'huid', this.innerText)"
                      class="editable-value"
                      title="BIS Hallmark ID"
                    >${tag.huid}</span>
                  </div>
                ` : `
                  <div class="tag-text-row text-[5pt] text-gray-400 italic">
                    BIS 916
                  </div>
                `}
              </div>

              <!-- Column 3 (23mm): Store Header, QR Code, Tag SKU -->
              <div class="col-spec-3">
                <div class="tag-store-header font-bold text-center">WJ JEWELLERS</div>
                <div class="qr-canvas-wrapper flex items-center justify-center">
                  <div id="qr-preview-${tag.id}" class="qr-code-box"></div>
                </div>
                <div 
                  class="tag-sku-code font-bold text-center truncate"
                  contenteditable="true"
                  onblur="BarcodeTags.updateTagField('${tag.id}', 'tagNum', this.innerText)"
                  title="Tag Number / SKU"
                >${tag.tagNum}</div>
              </div>
            </div>

            <!-- 30mm LOOPING TAIL (INK-FREE DUMB STRAP) -->
            <div class="looping-tail flex items-center justify-center">
              <span class="loop-tail-label">──► [ 30mm TAIL ] ──►</span>
              <div class="loop-hole-indicator"></div>
            </div>
          </div>
        </div>

        <!-- Footnote with Quick Details -->
        <div class="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-gray-400 font-mono">
          <div class="flex items-center gap-4">
            <span>Net Gold: <strong class="text-white">${netFormatted}g</strong></span>
            <span>Pieces: <strong class="text-white">${tag.pieces}</strong></span>
            <span>VA: <strong class="text-white">${tag.makingPct}%</strong></span>
            ${tag.huid ? `<span>HUID: <strong class="text-amber-300">${tag.huid}</strong></span>` : ''}
          </div>
          <span class="text-[10px] text-gray-500">Payload: <code class="text-gray-400">${this.getQrPayload(tag)}</code></span>
        </div>
      </div>
    `;
  },

  // Print Orchestrator: Populates #thermal-print-stage and calls window.print()
  printSelected() {
    const selectedTags = this.tags.filter(t => t.selected);
    if (selectedTags.length === 0) {
      if (typeof Utils !== 'undefined') {
        Utils.showToast('No Tags Selected', 'Please check at least one tag to print.', 'error');
      }
      return;
    }
    this.executePrint(selectedTags);
  },

  printSingleTag(tagId) {
    const tag = this.tags.find(t => t.id === tagId);
    if (!tag) return;
    this.executePrint([tag]);
  },

  printTestTag() {
    const testTag = {
      id: 'test_calib_folded',
      tagType: 'folded',
      firstName: 'RUSHIKESH',
      middleName: 'HEMANT',
      lastName: 'WADNERE',
      city: 'KANNAD',
      loanNo: '1042',
      date: '02/10/2026',
      metal: 'G',
      itemName: 'RING',
      pieces: 1,
      weightText: '2-GRAM',
      amount: '15000/-',
      selected: true
    };
    this.executePrint([testTag]);
  },

  executePrint(tagsToPrint) {
    const stage = document.getElementById('thermal-print-stage');
    if (!stage) {
      alert('Thermal print container not found in document.');
      return;
    }

    stage.innerHTML = '';

    tagsToPrint.forEach(tag => {
      const isFolded = tag.tagType !== 'retail';
      const tagSheet = document.createElement('div');
      tagSheet.className = 'thermal-tag-sheet';

      if (isFolded) {
        let amount = tag.amount ? String(tag.amount).trim() : '15000/-';
        if (!amount.endsWith('/-') && !amount.endsWith('/=')) amount += '/-';

        tagSheet.innerHTML = `
          <!-- 56mm PRINTABLE BLADE (CENTER-FOLDED AT 28mm) -->
          <div class="thermal-print-folded-blade">
            <!-- Side 1 (Left 28mm): Customer Names & City + Loan No -->
            <div class="print-folded-side-1">
              <div class="print-folded-name">${tag.firstName || 'RUSHIKESH'}</div>
              <div class="print-folded-name">${tag.middleName || 'HEMANT'}</div>
              <div class="print-folded-name">${tag.lastName || 'WADNERE'}</div>
              <div class="print-folded-city">
                <span>${tag.city || 'KANNAD'}</span>
                <span>${tag.loanNo ? 'L:' + tag.loanNo : ''}</span>
              </div>
            </div>

            <!-- Faint Center hairline fold guide -->
            <div class="print-folded-center"></div>

            <!-- Side 2 (Right 28mm): Date, Metal-Item Qty, Weight, Amount -->
            <div class="print-folded-side-2">
              <div class="print-folded-date">${tag.date || '02/10/2026'}</div>
              <div class="print-folded-item">
                <span>${tag.metal || 'G'}-${tag.itemName || 'RING'}</span>
              </div>
              <div class="print-folded-weight">W ${tag.weightText || '2-GRAM'}</div>
              <div class="print-folded-amount">${amount}</div>
            </div>
          </div>

          <!-- 30mm INK-FREE LOOPING TAIL -->
          <div class="thermal-print-tail loop-tail"></div>
        `;
      } else {
        const netFormatted = typeof tag.netWt === 'number' ? tag.netWt.toFixed(3) : parseFloat(tag.netWt || 0).toFixed(3);
        const grossFormatted = typeof tag.grossWt === 'number' ? tag.grossWt.toFixed(3) : parseFloat(tag.grossWt || 0).toFixed(3);
        const lessFormatted = typeof tag.lessWt === 'number' ? tag.lessWt.toFixed(3) : parseFloat(tag.lessWt || 0).toFixed(3);

        tagSheet.innerHTML = `
          <!-- 56mm PRINTABLE BLADE (RETAIL) -->
          <div class="thermal-print-blade">
            <!-- Col 1 (21mm) -->
            <div class="print-col-1">
              <div class="print-item-name">${tag.itemName}</div>
              <div class="print-row">G: ${grossFormatted}</div>
              <div class="print-row">L: ${lessFormatted}</div>
              <div class="print-row print-net">N: ${netFormatted}</div>
              <div class="print-row">VA: ${tag.makingPct}%</div>
            </div>

            <!-- Col 2 (12mm) -->
            <div class="print-col-2">
              <div class="print-row">P: ${tag.pieces}</div>
              <div class="print-row print-purity">${tag.purity}</div>
              ${tag.showHuid && tag.huid ? `
                <div class="print-row print-huid">HUID:${tag.huid}</div>
              ` : `
                <div class="print-row print-huid">BIS 916</div>
              `}
            </div>

            <!-- Col 3 (23mm) -->
            <div class="print-col-3">
              <div class="print-store-name">WJ JEWELLERS</div>
              <div class="print-qr-box" id="print-qr-${tag.id}"></div>
              <div class="print-sku">${tag.tagNum}</div>
            </div>
          </div>

          <!-- 30mm INK-FREE LOOPING TAIL -->
          <div class="thermal-print-tail loop-tail"></div>
        `;
      }

      stage.appendChild(tagSheet);

      // Render crisp thermal QR into the print sheet if retail tag
      if (!isFolded) {
        const qrBox = tagSheet.querySelector(`#print-qr-${tag.id}`);
        if (qrBox) {
          this.renderQrToElement(qrBox, this.getQrPayload(tag));
        }
      }
    });

    // Short timeout to guarantee layout has painted before browser print dialog triggers
    setTimeout(() => {
      window.print();
    }, 150);
  },

  // Bulk CSV Upload Support (Auto-detects Folded vs Retail headers)
  handleCsvUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          if (typeof Utils !== 'undefined') Utils.showToast('CSV Empty', 'Please provide a CSV with header and data rows.', 'error');
          return;
        }

        const headerLine = lines[0].toLowerCase();
        const isFoldedCsv = headerLine.includes('first name') || headerLine.includes('loan') || headerLine.includes('amount');
        const importedTags = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 2) continue;

          if (isFoldedCsv) {
            // Folded Format: First Name,Middle Name,Last Name,City,Loan No,Date,Metal,Item Name,Pieces,Weight,Amount
            const firstName = cols[0] ? cols[0].toUpperCase() : 'CUSTOMER';
            const middleName = cols[1] ? cols[1].toUpperCase() : '';
            const lastName = cols[2] ? cols[2].toUpperCase() : '';
            const city = cols[3] ? cols[3].toUpperCase() : 'KANNAD';
            const loanNo = cols[4] ? cols[4].replace(/^[L#:\-\s]+/i, '').trim() : '';
            const date = cols[5] || '02/10/2026';
            const metal = (cols[6] && cols[6].toUpperCase().startsWith('S')) ? 'S' : 'G';
            const itemName = cols[7] ? cols[7].toUpperCase() : 'RING';
            const pieces = parseInt(cols[8]) || 1;
            let weightText = cols[9] ? cols[9].toUpperCase() : '2-GRAM';
            let amount = cols[10] || '15000/-';
            if (!amount.endsWith('/-') && !amount.endsWith('/=')) amount += '/-';

            importedTags.push({
              id: 'tag_import_folded_' + Date.now() + '_' + i,
              tagType: 'folded',
              firstName,
              middleName,
              lastName,
              city,
              loanNo,
              date,
              metal,
              itemName,
              pieces,
              weightText,
              amount,
              selected: true
            });
          } else {
            // Retail Format: Item Name,Gross Wt,Less Wt,Making %,Pieces,Purity,HUID,Tag Number
            const itemName = cols[0] ? cols[0].toUpperCase() : 'GOLD ITEM';
            const grossWt = parseFloat(cols[1]) || 0;
            const lessWt = parseFloat(cols[2]) || 0;
            const netWt = Math.max(0, grossWt - lessWt);
            const makingPct = parseFloat(cols[3]) || 12.0;
            const pieces = parseInt(cols[4]) || 1;
            const purity = cols[5] || '91.6%';
            const huid = cols[6] ? cols[6].toUpperCase() : '';
            const tagNum = cols[7] ? cols[7].toUpperCase() : this.generateNextTagNum();

            importedTags.push({
              id: 'tag_import_retail_' + Date.now() + '_' + i,
              tagType: 'retail',
              tagNum,
              itemName,
              grossWt: parseFloat(grossWt.toFixed(3)),
              lessWt: parseFloat(lessWt.toFixed(3)),
              netWt: parseFloat(netWt.toFixed(3)),
              makingPct: parseFloat(makingPct.toFixed(1)),
              pieces,
              purity,
              huid,
              showHuid: !!huid,
              selected: true
            });
          }
        }

        if (importedTags.length > 0) {
          this.tags = importedTags.concat(this.tags);
          this.saveTags();
          this.render();
          if (typeof Utils !== 'undefined') {
            Utils.showToast('CSV Imported', `Successfully added ${importedTags.length} tags to queue.`, 'success');
          }
        }
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        if (typeof Utils !== 'undefined') {
          Utils.showToast('Import Error', 'Failed to parse CSV file. Please verify column formatting.', 'error');
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  downloadFoldedSampleCsv() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "First Name,Middle Name,Last Name,City,Loan No,Date,Metal,Item Name,Pieces,Weight,Amount\n" +
      "RUSHIKESH,HEMANT,WADNERE,KANNAD,1042,02/10/2026,G,RING,1,2-GRAM,15000/-\n" +
      "ANAND,PRAKASH,SHINDE,KANNAD,1043,02/10/2026,G,CHAIN,1,14.850G,85000/-\n" +
      "VIKRAM,SURESH,PATIL,KANNAD,1044,02/10/2026,S,PAYAL,2,45.200G,6500/-\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wj_girvi_folded_tags_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadSampleCsv() {
    this.downloadFoldedSampleCsv();
  },

  exportCurrentTagsCsv() {
    if (this.tags.length === 0) {
      if (typeof Utils !== 'undefined') Utils.showToast('No Tags', 'Print queue is empty.', 'error');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8," + 
      "Tag Type,First Name,Middle Name,Last Name,City,Loan No,Date,Metal,Item Name,Pieces,Weight,Amount,Tag SKU,Gross Wt,Less Wt,Net Wt,Purity\n";

    this.tags.forEach(t => {
      const type = t.tagType || 'folded';
      if (type === 'folded') {
        csvContent += `"folded","${t.firstName || ''}","${t.middleName || ''}","${t.lastName || ''}","${t.city || ''}","${t.loanNo || ''}","${t.date || ''}","${t.metal || 'G'}","${t.itemName || ''}",${t.pieces || 1},"${t.weightText || ''}","${t.amount || ''}","","","","",""\n`;
      } else {
        csvContent += `"retail","","","","","","","G","${t.itemName || ''}",${t.pieces || 1},"","","${t.tagNum || ''}",${t.grossWt || 0},${t.lessWt || 0},${t.netWt || 0},"${t.purity || ''}"\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wj_jewellery_tags_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Import from existing WJ Jewellers Stock Products
  importFromStockCatalog() {
    if (typeof DataStore === 'undefined' || !DataStore.getProducts) {
      alert('Stock catalog not available.');
      return;
    }

    const products = DataStore.getProducts();
    if (!products || products.length === 0) {
      if (typeof Utils !== 'undefined') Utils.showToast('No Stock', 'No inventory items in catalog.', 'error');
      return;
    }

    const convertedTags = products.map((p, idx) => {
      const gross = p.weightGrams || (15 + (idx * 6.5));
      const less = p.stoneWeightGrams || (p.category === 'polki' ? 3.5 : 0.0);
      const net = Math.max(0, gross - less);
      const isSilver = p.category === 'silver' || (p.name && p.name.toLowerCase().includes('silver'));
      const metal = isSilver ? 'S' : 'G';
      const weightStr = `${net.toFixed(2)}G`;
      const estAmount = `${Math.round(net * 7200)}/-`;

      return {
        id: 'tag_stock_folded_' + Date.now() + '_' + p.id,
        tagType: 'folded',
        firstName: 'STOCK',
        middleName: 'ATELIER',
        lastName: 'INVENTORY',
        city: 'KANNAD',
        loanNo: `SKU-${1000 + idx}`,
        date: '02/10/2026',
        metal,
        itemName: (p.name || 'JEWELLERY PIECE').toUpperCase().substring(0, 16),
        pieces: 1,
        weightText: weightStr,
        amount: estAmount,
        selected: true
      };
    });

    this.tags = convertedTags.concat(this.tags);
    this.saveTags();
    this.render();

    if (typeof Utils !== 'undefined') {
      Utils.showToast('Catalog Imported', `Imported ${convertedTags.length} products as folded tags.`, 'success');
    }
  },

  showPrinterGuideModal() {
    const modal = document.getElementById('printer-guide-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closePrinterGuideModal() {
    const modal = document.getElementById('printer-guide-modal');
    if (modal) modal.classList.add('hidden');
  }
};

window.BarcodeTags = BarcodeTags;
