/**
 * WJ Jewellers - Jewellery Barcode & QR Tag Generator Component
 * Production-ready thermal label printing engine for rat-tail / cricket bat labels
 * Dimensions: 86mm Total Width x 15mm Height (56mm Printable Blade + 30mm Ink-Free Looping Tail)
 * Compatible with TSC, Zebra, TVS, Honeywell thermal barcode printers (203 / 300 DPI)
 */

const BarcodeTags = {
  // Local storage key
  STORAGE_KEY: 'wj_jewellery_barcode_tags_v1',

  // Current working state
  tags: [],
  previewScale: 1.5, // 1.0 (100% 1:1 scale), 1.5 (150%), 2.0 (200%)
  showLoopTailBorder: true,
  autoIncrementSku: true,

  // Default sample tags for staff preview
  defaultTags: [
    {
      id: 'tag_1',
      tagNum: 'WJ-GL-8401',
      itemName: 'GENTS CHAIN',
      grossWt: 14.850,
      lessWt: 0.000,
      netWt: 14.850,
      makingPct: 12.0,
      pieces: 1,
      purity: '91.6%',
      huid: '6A7K29',
      showHuid: true,
      selected: true
    },
    {
      id: 'tag_2',
      tagNum: 'WJ-PK-8402',
      itemName: 'POLKI CHOKER',
      grossWt: 48.600,
      lessWt: 6.200,
      netWt: 42.400,
      makingPct: 16.5,
      pieces: 1,
      purity: '91.6%',
      huid: '9M3X71',
      showHuid: true,
      selected: true
    },
    {
      id: 'tag_3',
      tagNum: 'WJ-KD-8403',
      itemName: 'TEMPLE KADA',
      grossWt: 32.150,
      lessWt: 1.100,
      netWt: 31.050,
      makingPct: 14.0,
      pieces: 2,
      purity: '91.6%',
      huid: '4B8L12',
      showHuid: true,
      selected: true
    },
    {
      id: 'tag_4',
      tagNum: 'WJ-RN-8404',
      itemName: 'SOLITAIRE RING',
      grossWt: 5.620,
      lessWt: 0.450,
      netWt: 5.170,
      makingPct: 18.0,
      pieces: 1,
      purity: '75.0%',
      huid: '7K2P90',
      showHuid: true,
      selected: true
    }
  ],

  init() {
    this.loadTags();
    this.render();
    this.setupEventListeners();
  },

  loadTags() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.tags = JSON.parse(saved);
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
    const count = this.tags.length + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `WJ-JW-${randomSuffix}`;
  },

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

    // Reset form with smart next tag num
    form.reset();
    form.tagNum.value = this.generateNextTagNum();
    form.purity.value = '91.6%';
    form.makingPct.value = '12.0';
    form.pieces.value = '1';
    form.showHuid.checked = true;
    this.calculateFormNet();

    if (typeof Utils !== 'undefined') {
      Utils.showToast('Tag Created', `Label ${newTag.tagNum} generated and added to print queue.`, 'success');
    }
  },

  addBlankTag() {
    const newTag = {
      id: 'tag_' + Date.now(),
      tagNum: this.generateNextTagNum(),
      itemName: 'CUSTOM ITEM',
      grossWt: 10.000,
      lessWt: 0.000,
      netWt: 10.000,
      makingPct: 12.0,
      pieces: 1,
      purity: '91.6%',
      huid: 'WJ' + Math.floor(1000 + Math.random() * 9000),
      showHuid: true,
      selected: true
    };
    this.tags.unshift(newTag);
    this.saveTags();
    this.render();
    if (typeof Utils !== 'undefined') {
      Utils.showToast('Blank Tag Added', 'Click on any field on the tag preview to edit values.', 'gold');
    }
  },

  duplicateTag(tagId) {
    const existing = this.tags.find(t => t.id === tagId);
    if (!existing) return;

    const copy = JSON.parse(JSON.stringify(existing));
    copy.id = 'tag_' + Date.now();
    copy.tagNum = this.generateNextTagNum();
    copy.selected = true;

    this.tags.unshift(copy);
    this.saveTags();
    this.render();
    if (typeof Utils !== 'undefined') {
      Utils.showToast('Tag Duplicated', `Created copy as ${copy.tagNum}`, 'gold');
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
      Utils.showToast('Demo Tags Loaded', '4 factory calibration sample tags loaded.', 'success');
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
    // Update active scale button styles
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
      tag.itemName = value.toUpperCase();
    } else if (field === 'tagNum') {
      tag.tagNum = value.toUpperCase();
    } else if (field === 'huid') {
      tag.huid = value.toUpperCase();
    } else if (field === 'purity') {
      tag.purity = value;
    }

    this.saveTags();
    this.refreshSingleTagDOM(tagId);
  },

  // Generates 2D QR Code payload formatted as: WJ-{tag_num},{net_wt},{purity_pct}
  getQrPayload(tag) {
    const netFormatted = typeof tag.netWt === 'number' ? tag.netWt.toFixed(3) : parseFloat(tag.netWt || 0).toFixed(3);
    const purityClean = (tag.purity || '91.6%').trim();
    return `WJ-${tag.tagNum},${netFormatted},${purityClean}`;
  },

  // Render QR into target element
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
        // Fallback canvas if QRCode library is loading
        this.renderQrFallback(containerEl, payload);
      }
    } catch (e) {
      console.warn('QRCode library render error, using fallback canvas', e);
      this.renderQrFallback(containerEl, payload);
    }
  },

  // Minimal clean canvas fallback for QR representation
  renderQrFallback(containerEl, payload) {
    const canvas = document.createElement('canvas');
    canvas.width = 52;
    canvas.height = 52;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 52, 52);
    ctx.fillStyle = '#000000';
    // Draw outer frame & alignment markers
    ctx.fillRect(4, 4, 16, 16);
    ctx.clearRect(7, 7, 10, 10);
    ctx.fillRect(9, 9, 6, 6);

    ctx.fillRect(32, 4, 16, 16);
    ctx.clearRect(35, 7, 10, 10);
    ctx.fillRect(37, 9, 6, 6);

    ctx.fillRect(4, 32, 16, 16);
    ctx.clearRect(7, 35, 10, 10);
    ctx.fillRect(9, 37, 6, 6);

    // Dynamic data pseudo-matrix based on payload hash
    let hash = 0;
    for (let i = 0; i < payload.length; i++) hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 6; y++) {
        if ((hash & (1 << ((x * 6 + y) % 31))) !== 0) {
          ctx.fillRect(23 + x * 2, 23 + y * 2, 2, 2);
        }
      }
    }
    containerEl.appendChild(canvas);
  },

  // Master UI Renderer
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
            <i class="fa-solid fa-qrcode text-2xl"></i>
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

    // Render QR codes for all tags in the DOM
    this.tags.forEach(tag => {
      const qrEl = document.getElementById(`qr-preview-${tag.id}`);
      if (qrEl) {
        this.renderQrToElement(qrEl, this.getQrPayload(tag));
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

    const qrEl = document.getElementById(`qr-preview-${tag.id}`);
    if (qrEl) {
      this.renderQrToElement(qrEl, this.getQrPayload(tag));
    }
  },

  generateTagCardHTML(tag) {
    const isChecked = tag.selected ? 'checked' : '';
    const netFormatted = typeof tag.netWt === 'number' ? tag.netWt.toFixed(3) : parseFloat(tag.netWt || 0).toFixed(3);
    const grossFormatted = typeof tag.grossWt === 'number' ? tag.grossWt.toFixed(3) : parseFloat(tag.grossWt || 0).toFixed(3);
    const lessFormatted = typeof tag.lessWt === 'number' ? tag.lessWt.toFixed(3) : parseFloat(tag.lessWt || 0).toFixed(3);

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
              <span class="font-mono text-gray-200 font-semibold text-xs tracking-wider">${tag.tagNum}</span>
            </label>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-cinzel font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30">
              ${tag.purity}
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
      id: 'test_calib',
      tagNum: 'TEST-CALIB-01',
      itemName: 'CALIBRATION TAG',
      grossWt: 10.000,
      lessWt: 0.000,
      netWt: 10.000,
      makingPct: 12.0,
      pieces: 1,
      purity: '91.6%',
      huid: 'CALIB1',
      showHuid: true
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
      const netFormatted = typeof tag.netWt === 'number' ? tag.netWt.toFixed(3) : parseFloat(tag.netWt || 0).toFixed(3);
      const grossFormatted = typeof tag.grossWt === 'number' ? tag.grossWt.toFixed(3) : parseFloat(tag.grossWt || 0).toFixed(3);
      const lessFormatted = typeof tag.lessWt === 'number' ? tag.lessWt.toFixed(3) : parseFloat(tag.lessWt || 0).toFixed(3);

      const tagSheet = document.createElement('div');
      tagSheet.className = 'thermal-tag-sheet';

      tagSheet.innerHTML = `
        <!-- 56mm PRINTABLE BLADE -->
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

      stage.appendChild(tagSheet);

      // Render crisp thermal QR into the print sheet
      const qrBox = tagSheet.querySelector(`#print-qr-${tag.id}`);
      if (qrBox) {
        this.renderQrToElement(qrBox, this.getQrPayload(tag));
      }
    });

    // Short timeout to guarantee QR canvases have painted before browser print dialog triggers
    setTimeout(() => {
      window.print();
    }, 250);
  },

  // Bulk CSV Upload Support
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

        // Header mapping
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const importedTags = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 2) continue;

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
            id: 'tag_import_' + Date.now() + '_' + i,
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
    event.target.value = ''; // Reset input
  },

  downloadSampleCsv() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Item Name,Gross Wt,Less Wt,Making %,Pieces,Purity,HUID,Tag Number\n" +
      "GENTS CHAIN,14.850,0.000,12.0,1,91.6%,6A7K29,WJ-GL-8401\n" +
      "POLKI CHOKER,48.600,6.200,16.5,1,91.6%,9M3X71,WJ-PK-8402\n" +
      "TEMPLE KADA,32.150,1.100,14.0,2,91.6%,4B8L12,WJ-KD-8403\n" +
      "SOLITAIRE RING,5.620,0.450,18.0,1,75.0%,7K2P90,WJ-RN-8404\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wj_jewellery_tags_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportCurrentTagsCsv() {
    if (this.tags.length === 0) {
      if (typeof Utils !== 'undefined') Utils.showToast('No Tags', 'Print queue is empty.', 'error');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8," + 
      "Item Name,Gross Wt,Less Wt,Net Wt,Making %,Pieces,Purity,HUID,Tag Number\n";

    this.tags.forEach(t => {
      csvContent += `"${t.itemName}",${t.grossWt},${t.lessWt},${t.netWt},${t.makingPct},${t.pieces},"${t.purity}","${t.huid}","${t.tagNum}"\n`;
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
      // Estimate weights from product properties
      const gross = p.weightGrams || (15 + (idx * 6.5));
      const less = p.stoneWeightGrams || (p.category === 'polki' ? 3.5 : 0.0);
      const net = Math.max(0, gross - less);
      const purity = p.purity || (p.category === 'polki' || p.category === 'gold' ? '91.6%' : '75.0%');

      return {
        id: 'tag_stock_' + Date.now() + '_' + p.id,
        tagNum: `WJ-${(p.category || 'JW').substring(0, 2).toUpperCase()}-${1000 + idx}`,
        itemName: (p.name || 'JEWELLERY PIECE').toUpperCase().substring(0, 22),
        grossWt: parseFloat(gross.toFixed(3)),
        lessWt: parseFloat(less.toFixed(3)),
        netWt: parseFloat(net.toFixed(3)),
        makingPct: 14.0,
        pieces: 1,
        purity,
        huid: 'WJ' + (1000 + idx),
        showHuid: true,
        selected: true
      };
    });

    this.tags = convertedTags.concat(this.tags);
    this.saveTags();
    this.render();

    if (typeof Utils !== 'undefined') {
      Utils.showToast('Catalog Imported', `Imported ${convertedTags.length} products from inventory.`, 'success');
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
