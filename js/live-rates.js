/**
 * WJ Jewellers - Live Indian Bullion & Jewellery Market Rates
 * Powered by GoldAPI.io (Live INR Rates for Gold XAU & Silver XAG)
 * Features:
 * - Accurate Indian Market Karats: 24K (999), 22K (916 BIS), 18K (750), 14K (585)
 * - Indian Silver Rates: Fine 999 & Sterling 925 per Gram & per Kilogram
 * - Traditional Indian Units: 1 Gram, 8 Grams (1 Sovereign / Pavan), 10 Grams (1 Tola), 1 Kilogram
 * - Intelligent Quota-Protection Cache (stores in localStorage to preserve the 100 reqs/month free tier)
 * - Indian Jewellery Price & 3% GST Calculator
 * - Seamless 1-Click Sync to Tag Generator
 */

const LiveRates = {
  config: {
    apiKey: 'goldapi-c7559af3974d319d88058554f455f305-io',
    baseUrl: 'https://www.goldapi.io/api',
    cacheKeyXau: 'wj_goldapi_xau_inr',
    cacheKeyXag: 'wj_goldapi_xag_inr',
    cacheKeyStat: 'wj_goldapi_stat',
    cacheTTLMs: 2 * 60 * 60 * 1000, // 2 Hours Cache to strictly safeguard 100 reqs/month limit
    localMandiOffsetKey: 'wj_mandi_offset_10g'
  },

  // Fallback baseline rates if offline or quota fully exhausted
  fallbackData: {
    gold: {
      timestamp: Date.now() / 1000,
      price_gram_24k: 12943.91,
      price_gram_22k: 11865.25,
      price_gram_20k: 10786.59,
      price_gram_18k: 9707.93,
      price_gram_14k: 7550.62,
      price_gram_10k: 5393.30,
      ch: 82.80,
      chp: 0.02,
      price: 402600.70
    },
    silver: {
      timestamp: Date.now() / 1000,
      price_gram_24k: 189.88,
      price_gram_22k: 174.06,
      price_gram_18k: 142.41,
      ch: 34.60,
      chp: 0.59,
      price: 5906.00
    },
    stat: {
      requests_today: 4,
      requests_month: 4
    }
  },

  state: {
    gold: null,
    silver: null,
    stat: null,
    lastFetchedAt: null,
    isFetching: false,
    mandiOffset10g: 0, // +/- ₹ per 10 grams local mandi adjustment
    calc: {
      metalType: 'gold22k',
      weightGrams: 10,
      makingType: 'percent', // 'percent' or 'perGram'
      makingValue: 12, // 12% or ₹600/g
      hallmarkFee: 45, // ₹45 BIS Hallmark fee per gold piece
      applyGst: true
    }
  },

  init() {
    // Load local mandi offset from storage
    const savedOffset = localStorage.getItem(this.config.localMandiOffsetKey);
    if (savedOffset !== null) {
      this.state.mandiOffset10g = parseFloat(savedOffset) || 0;
    }

    // Load cached data or fallbacks
    this.loadFromCache();

    // Render immediately so UI is populated in 0ms
    this.renderAll();

    // Check if cache is older than TTL; if so, fetch fresh rates silently
    const isStale = !this.state.lastFetchedAt || (Date.now() - this.state.lastFetchedAt > this.config.cacheTTLMs);
    if (isStale) {
      this.fetchRates(false);
    }

    // Attach calculator listeners
    this.bindCalculatorEvents();
  },

  loadFromCache() {
    try {
      const cachedGold = localStorage.getItem(this.config.cacheKeyXau);
      const cachedSilver = localStorage.getItem(this.config.cacheKeyXag);
      const cachedStat = localStorage.getItem(this.config.cacheKeyStat);

      if (cachedGold && cachedSilver) {
        const parsedGold = JSON.parse(cachedGold);
        const parsedSilver = JSON.parse(cachedSilver);

        this.state.gold = parsedGold.data;
        this.state.silver = parsedSilver.data;
        this.state.lastFetchedAt = parsedGold.timestamp || Date.now();

        if (cachedStat) {
          this.state.stat = JSON.parse(cachedStat).data;
        }
        return true;
      }
    } catch (e) {
      console.warn('Could not read cached bullion rates:', e);
    }

    // Use initial fallback
    this.state.gold = { ...this.fallbackData.gold };
    this.state.silver = { ...this.fallbackData.silver };
    this.state.stat = { ...this.fallbackData.stat };
    this.state.lastFetchedAt = Date.now();
    return false;
  },

  saveToCache(goldData, silverData, statData) {
    try {
      const now = Date.now();
      localStorage.setItem(this.config.cacheKeyXau, JSON.stringify({ data: goldData, timestamp: now }));
      localStorage.setItem(this.config.cacheKeyXag, JSON.stringify({ data: silverData, timestamp: now }));
      if (statData) {
        localStorage.setItem(this.config.cacheKeyStat, JSON.stringify({ data: statData, timestamp: now }));
      }
      this.state.lastFetchedAt = now;
    } catch (e) {
      console.warn('Failed to save bullion rates to cache:', e);
    }
  },

  async fetchRates(force = false) {
    if (this.state.isFetching) return;

    // Guard against spam clicking if user forces refresh within 30 seconds
    if (force && this.state.lastFetchedAt && (Date.now() - this.state.lastFetchedAt < 30 * 1000)) {
      if (typeof Utils !== 'undefined' && Utils.showToast) {
        Utils.showToast('Rates are Up-to-Date', 'Refreshed less than 30 seconds ago. Safeguarding your 100 reqs/month quota.', 'info');
      }
      return;
    }

    this.state.isFetching = true;
    this.updateRefreshButton(true);

    try {
      const headers = {
        'x-access-token': this.config.apiKey,
        'Content-Type': 'application/json'
      };

      // Parallel fetch for Gold & Silver
      const [goldRes, silverRes, statRes] = await Promise.allSettled([
        fetch(`${this.config.baseUrl}/XAU/INR`, { headers }),
        fetch(`${this.config.baseUrl}/XAG/INR`, { headers }),
        fetch(`${this.config.baseUrl}/stat`, { headers })
      ]);

      let newGold = null;
      let newSilver = null;
      let newStat = null;

      if (goldRes.status === 'fulfilled' && goldRes.value.ok) {
        newGold = await goldRes.value.json();
      }

      if (silverRes.status === 'fulfilled' && silverRes.value.ok) {
        newSilver = await silverRes.value.json();
      }

      if (statRes.status === 'fulfilled' && statRes.value.ok) {
        newStat = await statRes.value.json();
      }

      if (newGold && newSilver) {
        this.state.gold = newGold;
        this.state.silver = newSilver;
        if (newStat) this.state.stat = newStat;
        this.saveToCache(newGold, newSilver, newStat);

        if (force && typeof Utils !== 'undefined' && Utils.showToast) {
          Utils.showToast('Rates Updated Successfully', 'Live Indian market rates fetched from GoldAPI.io (Cached for 2 hours).', 'success');
        }
      } else {
        throw new Error('API request failed or limit reached');
      }
    } catch (err) {
      console.error('Error fetching live rates:', err);
      if (force && typeof Utils !== 'undefined' && Utils.showToast) {
        Utils.showToast('Using Latest Cached Rates', 'Could not refresh live feed. Displaying cached Indian market rates.', 'warning');
      }
    } finally {
      this.state.isFetching = false;
      this.updateRefreshButton(false);
      this.renderAll();
    }
  },

  // Helper: Format Indian Rupee currency (e.g. ₹1,29,439)
  formatInr(number, decimals = 0) {
    if (typeof number !== 'number' || isNaN(number)) return '₹0';
    return '₹' + number.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  // Helper: Apply local mandi offset (+/- ₹ per 10g)
  getGoldGramRate(karatKey) {
    if (!this.state.gold) return 0;
    const baseRate = this.state.gold[karatKey] || 0;
    // Mandi offset is per 10g, so per gram offset is offset / 10
    const offsetPerGram = (this.state.mandiOffset10g || 0) / 10;
    return Math.max(0, baseRate + offsetPerGram);
  },

  getSilverGramRate(isSterling = false) {
    if (!this.state.silver) return 0;
    const baseRate = this.state.silver.price_gram_24k || 0;
    return isSterling ? (baseRate * 0.925) : baseRate;
  },

  renderAll() {
    this.renderTopMiniTicker();
    this.renderSummaryCards();
    this.renderRatesTable();
    this.renderCalculator();
    this.renderMetadata();
  },

  renderTopMiniTicker() {
    const gold24k = this.getGoldGramRate('price_gram_24k');
    const gold22k = this.getGoldGramRate('price_gram_22k');
    const silver = this.getSilverGramRate(false);

    const el24k = document.getElementById('ticker-gold-24k');
    const el22k = document.getElementById('ticker-gold-22k');
    const elSil = document.getElementById('ticker-silver');

    if (el24k) el24k.innerText = `${this.formatInr(gold24k)}/g`;
    if (el22k) el22k.innerText = `${this.formatInr(gold22k)}/g`;
    if (elSil) elSil.innerText = `${this.formatInr(silver, 1)}/g`;
  },

  renderSummaryCards() {
    const gold = this.state.gold;
    const silver = this.state.silver;
    if (!gold || !silver) return;

    const g24kGram = this.getGoldGramRate('price_gram_24k');
    const g22kGram = this.getGoldGramRate('price_gram_22k');
    const g18kGram = this.getGoldGramRate('price_gram_18k');
    const g14kGram = this.getGoldGramRate('price_gram_14k');
    const silGram = this.getSilverGramRate(false);

    // 24K Pure Gold
    this.setText('rate-24k-1g', this.formatInr(g24kGram));
    this.setText('rate-24k-10g', this.formatInr(g24kGram * 10));
    this.setChange('rate-24k-change', gold.ch, gold.chp);

    // 22K Hallmark Gold (916)
    this.setText('rate-22k-1g', this.formatInr(g22kGram));
    this.setText('rate-22k-10g', this.formatInr(g22kGram * 10));
    this.setText('rate-22k-8g', this.formatInr(g22kGram * 8));

    // 18K Hallmark Gold (750)
    this.setText('rate-18k-1g', this.formatInr(g18kGram));
    this.setText('rate-18k-10g', this.formatInr(g18kGram * 10));

    // 14K Hallmark Gold (585)
    this.setText('rate-14k-1g', this.formatInr(g14kGram));
    this.setText('rate-14k-10g', this.formatInr(g14kGram * 10));

    // Silver 999
    this.setText('rate-silver-1g', this.formatInr(silGram, 2));
    this.setText('rate-silver-10g', this.formatInr(silGram * 10, 1));
    this.setText('rate-silver-1kg', this.formatInr(silGram * 1000));
    this.setChange('rate-silver-change', silver.ch, silver.chp);
  },

  renderRatesTable() {
    const gold = this.state.gold;
    const silver = this.state.silver;
    if (!gold || !silver) return;

    const g24 = this.getGoldGramRate('price_gram_24k');
    const g22 = this.getGoldGramRate('price_gram_22k');
    const g20 = this.getGoldGramRate('price_gram_20k');
    const g18 = this.getGoldGramRate('price_gram_18k');
    const g14 = this.getGoldGramRate('price_gram_14k');
    const g10 = this.getGoldGramRate('price_gram_10k');

    const s999 = this.getSilverGramRate(false);
    const s925 = this.getSilverGramRate(true);

    const tbody = document.getElementById('bullion-rates-table-body');
    if (!tbody) return;

    const rows = [
      {
        metal: 'Gold 24K (999)',
        desc: 'Pure Bullion Bar / Coin',
        purity: '99.9%',
        tag: 'Fine Gold',
        tagClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        p1g: g24,
        p8g: g24 * 8,
        p10g: g24 * 10,
        p100g: g24 * 100
      },
      {
        metal: 'Gold 22K (916)',
        desc: 'BIS Hallmark Jewellery Standard',
        purity: '91.6%',
        tag: 'Jewellery Benchmark',
        tagClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold',
        p1g: g22,
        p8g: g22 * 8,
        p10g: g22 * 10,
        p100g: g22 * 100
      },
      {
        metal: 'Gold 20K (833)',
        desc: 'Traditional Antique / Kundan Jewellery',
        purity: '83.3%',
        tag: 'Traditional',
        tagClass: 'bg-white/10 text-gray-300 border-white/10',
        p1g: g20,
        p8g: g20 * 8,
        p10g: g20 * 10,
        p100g: g20 * 100
      },
      {
        metal: 'Gold 18K (750)',
        desc: 'BIS Hallmark Studded / Diamond Jewellery',
        purity: '75.0%',
        tag: 'Diamond / Studded',
        tagClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        p1g: g18,
        p8g: g18 * 8,
        p10g: g18 * 10,
        p100g: g18 * 100
      },
      {
        metal: 'Gold 14K (585)',
        desc: 'Modern Lightweight / Everyday Jewellery',
        purity: '58.5%',
        tag: 'Dailywear',
        tagClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        p1g: g14,
        p8g: g14 * 8,
        p10g: g14 * 10,
        p100g: g14 * 100
      },
      {
        metal: 'Gold 10K (417)',
        desc: 'Fashion & Chainwear Grade',
        purity: '41.7%',
        tag: 'Standard',
        tagClass: 'bg-gray-800 text-gray-400 border-gray-700',
        p1g: g10,
        p8g: g10 * 8,
        p10g: g10 * 10,
        p100g: g10 * 100
      },
      {
        metal: 'Silver 999 (Pure)',
        desc: 'Fine Bullion Bar / Pooja Coin',
        purity: '99.9%',
        tag: 'Fine Bullion',
        tagClass: 'bg-slate-300/20 text-slate-200 border-slate-300/30',
        p1g: s999,
        p8g: s999 * 8,
        p10g: s999 * 10,
        p100g: s999 * 100,
        isSilver: true,
        p1kg: s999 * 1000
      },
      {
        metal: 'Silver 925 (Sterling)',
        desc: 'Hallmarked Silver Jewellery & Utensils',
        purity: '92.5%',
        tag: 'Sterling 925',
        tagClass: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
        p1g: s925,
        p8g: s925 * 8,
        p10g: s925 * 10,
        p100g: s925 * 100,
        isSilver: true,
        p1kg: s925 * 1000
      }
    ];

    tbody.innerHTML = rows.map(r => `
      <tr class="border-b border-white/5 hover:bg-white/[0.03] transition-colors text-xs font-mono">
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <span class="font-sans font-bold text-white">${r.metal}</span>
            <span class="text-[9px] px-2 py-0.5 rounded-full border ${r.tagClass}">${r.tag}</span>
          </div>
          <span class="text-[10px] text-gray-400 font-sans block mt-0.5">${r.desc}</span>
        </td>
        <td class="py-3 px-4 text-center font-bold text-gray-300">${r.purity}</td>
        <td class="py-3 px-4 text-right font-bold text-white">${this.formatInr(r.p1g, r.isSilver ? 2 : 0)}</td>
        <td class="py-3 px-4 text-right text-gray-300">${this.formatInr(r.p8g, 0)}</td>
        <td class="py-3 px-4 text-right font-bold text-[#E8B676]">${this.formatInr(r.p10g, 0)}</td>
        <td class="py-3 px-4 text-right text-gray-300">
          ${r.isSilver ? `<span class="text-emerald-400 font-bold">${this.formatInr(r.p1kg)}/kg</span>` : this.formatInr(r.p100g, 0)}
        </td>
      </tr>
    `).join('');
  },

  renderMetadata() {
    const lastEl = document.getElementById('rates-last-updated-text');
    if (lastEl && this.state.lastFetchedAt) {
      const d = new Date(this.state.lastFetchedAt);
      const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      lastEl.innerText = `Last Refreshed: ${dateStr} at ${timeStr} · Safe-Cached (2 hrs)`;
    }

    // Quota Counter
    const quotaEl = document.getElementById('rates-quota-badge');
    if (quotaEl && this.state.stat) {
      const used = this.state.stat.requests_month || 4;
      const left = Math.max(0, 100 - used);
      quotaEl.innerHTML = `<i class="fa-solid fa-gauge-high mr-1"></i> API Quota: <strong>${used}/100</strong> used (${left} remaining this month)`;
    }

    // Mandi Offset Input
    const offsetInput = document.getElementById('mandi-offset-input');
    if (offsetInput) {
      offsetInput.value = this.state.mandiOffset10g || 0;
    }
  },

  updateMandiOffset(val) {
    const num = parseFloat(val) || 0;
    this.state.mandiOffset10g = num;
    localStorage.setItem(this.config.localMandiOffsetKey, num.toString());
    this.renderAll();
    if (typeof Utils !== 'undefined' && Utils.showToast) {
      const sign = num >= 0 ? `+₹${num}` : `-₹${Math.abs(num)}`;
      Utils.showToast('Local Mandi Adjusted', `Applied ${sign}/10g local Sarafa offset across Indian rates.`, 'info');
    }
  },

  bindCalculatorEvents() {
    const metalSel = document.getElementById('calc-metal-select');
    const weightInp = document.getElementById('calc-weight-input');
    const makeTypeSel = document.getElementById('calc-making-type');
    const makeValInp = document.getElementById('calc-making-value');
    const gstCheck = document.getElementById('calc-gst-checkbox');
    const hallmarkInp = document.getElementById('calc-hallmark-fee');

    if (metalSel) {
      metalSel.addEventListener('change', (e) => {
        this.state.calc.metalType = e.target.value;
        this.renderCalculator();
      });
    }

    if (weightInp) {
      weightInp.addEventListener('input', (e) => {
        this.state.calc.weightGrams = parseFloat(e.target.value) || 0;
        this.renderCalculator();
      });
    }

    if (makeTypeSel) {
      makeTypeSel.addEventListener('change', (e) => {
        this.state.calc.makingType = e.target.value;
        this.renderCalculator();
      });
    }

    if (makeValInp) {
      makeValInp.addEventListener('input', (e) => {
        this.state.calc.makingValue = parseFloat(e.target.value) || 0;
        this.renderCalculator();
      });
    }

    if (gstCheck) {
      gstCheck.addEventListener('change', (e) => {
        this.state.calc.applyGst = e.target.checked;
        this.renderCalculator();
      });
    }

    if (hallmarkInp) {
      hallmarkInp.addEventListener('input', (e) => {
        this.state.calc.hallmarkFee = parseFloat(e.target.value) || 0;
        this.renderCalculator();
      });
    }
  },

  renderCalculator() {
    const calc = this.state.calc;
    let ratePerGram = 0;
    let metalLabel = 'Gold 22K (916)';

    switch (calc.metalType) {
      case 'gold24k':
        ratePerGram = this.getGoldGramRate('price_gram_24k');
        metalLabel = 'Gold 24K (999 Pure)';
        break;
      case 'gold22k':
        ratePerGram = this.getGoldGramRate('price_gram_22k');
        metalLabel = 'Gold 22K (916 BIS)';
        break;
      case 'gold18k':
        ratePerGram = this.getGoldGramRate('price_gram_18k');
        metalLabel = 'Gold 18K (750 Diamond/Studded)';
        break;
      case 'gold14k':
        ratePerGram = this.getGoldGramRate('price_gram_14k');
        metalLabel = 'Gold 14K (585 Dailywear)';
        break;
      case 'silver999':
        ratePerGram = this.getSilverGramRate(false);
        metalLabel = 'Silver 999 (Pure)';
        break;
      case 'silver925':
        ratePerGram = this.getSilverGramRate(true);
        metalLabel = 'Silver 925 (Sterling)';
        break;
    }

    const weight = Math.max(0, calc.weightGrams || 0);
    const metalCost = ratePerGram * weight;

    // Making Charges
    let makingCost = 0;
    if (calc.makingType === 'percent') {
      makingCost = metalCost * ((calc.makingValue || 0) / 100);
    } else {
      makingCost = (calc.makingValue || 0) * weight;
    }

    const hallmarkCost = (calc.metalType.startsWith('silver') ? 35 : 45);
    const subtotal = metalCost + makingCost + hallmarkCost;
    const gstRate = calc.applyGst ? 0.03 : 0;
    const gstAmount = subtotal * gstRate;
    const grandTotal = Math.round(subtotal + gstAmount);

    this.setText('calc-out-rate', `${this.formatInr(ratePerGram)}/g`);
    this.setText('calc-out-metal-cost', this.formatInr(metalCost));
    this.setText('calc-out-making-cost', this.formatInr(makingCost));
    this.setText('calc-out-hallmark-cost', this.formatInr(hallmarkCost));
    this.setText('calc-out-subtotal', this.formatInr(subtotal));
    this.setText('calc-out-gst', this.formatInr(gstAmount));
    this.setText('calc-out-grand-total', this.formatInr(grandTotal));

    // Store calculated value for 1-click sync
    this.lastCalculation = {
      metalLabel,
      metalCode: calc.metalType.startsWith('silver') ? 'S' : 'G',
      weightGrams: weight,
      grandTotal: grandTotal,
      safeAmountText: `${grandTotal}/-`
    };
  },

  // 1-Click: Sync calculated valuation directly into Tag Generator
  applyCalculatedToTag() {
    if (!this.lastCalculation) return;

    // Switch to Tag Generator view
    switchMainView('tags');

    // Fill the Tag Generator inputs
    const metalSelect = document.getElementById('tag-metal');
    const weightInput = document.getElementById('tag-weight-text');
    const amountInput = document.getElementById('tag-amount');

    if (metalSelect) metalSelect.value = this.lastCalculation.metalCode;
    if (weightInput) weightInput.value = `${this.lastCalculation.weightGrams}G`;
    if (amountInput) amountInput.value = this.lastCalculation.safeAmountText;

    if (typeof Utils !== 'undefined' && Utils.showToast) {
      Utils.showToast('Calculation Synced to Tag Form', `Pre-filled ${this.lastCalculation.metalCode}-item, ${this.lastCalculation.weightGrams}g, and ${this.lastCalculation.safeAmountText}`, 'success');
    }
  },

  updateRefreshButton(isSpinning) {
    const btn = document.getElementById('refresh-rates-btn');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
      if (isSpinning) {
        icon.classList.add('fa-spin');
        btn.classList.add('opacity-75');
      } else {
        icon.classList.remove('fa-spin');
        btn.classList.remove('opacity-75');
      }
    }
  },

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  },

  setChange(id, ch, chp) {
    const el = document.getElementById(id);
    if (!el) return;
    const isPositive = (ch || 0) >= 0;
    const sign = isPositive ? '+' : '';
    el.innerHTML = `
      <span class="inline-flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}">
        <i class="fa-solid fa-arrow-trend-${isPositive ? 'up' : 'down'} text-[10px]"></i>
        <span>${sign}₹${Math.abs(ch || 0).toFixed(1)} (${sign}${(chp || 0).toFixed(2)}%)</span>
      </span>
    `;
  }
};

// Global View Switcher: Switches between 'tags' and 'rates'
function switchMainView(viewName) {
  const tagsView = document.getElementById('admin-panel-tags');
  const ratesView = document.getElementById('main-panel-live-rates');

  const tabTags = document.getElementById('nav-tab-tag-generator');
  const tabRates = document.getElementById('nav-tab-live-rates');

  if (viewName === 'rates') {
    if (tagsView) tagsView.style.setProperty('display', 'none', 'important');
    if (ratesView) {
      ratesView.classList.remove('hidden');
      ratesView.style.setProperty('display', 'block', 'important');
    }

    if (tabTags) {
      tabTags.className = 'px-4 py-2 rounded-xl text-xs font-cinzel font-semibold flex items-center gap-2 transition-all text-gray-400 hover:text-white hover:bg-white/5 border border-transparent';
    }
    if (tabRates) {
      tabRates.className = 'px-4 py-2 rounded-xl text-xs font-cinzel font-bold flex items-center gap-2 transition-all bg-[#D4AF37] text-black shadow-lg border border-[#D4AF37]';
    }

    window.location.hash = '#live-rates';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof LiveRates !== 'undefined') {
      LiveRates.renderAll();
    }
  } else {
    // Default 'tags'
    if (ratesView) ratesView.style.setProperty('display', 'none', 'important');
    if (tagsView) {
      tagsView.classList.remove('hidden');
      tagsView.style.setProperty('display', 'block', 'important');
    }

    if (tabTags) {
      tabTags.className = 'px-4 py-2 rounded-xl text-xs font-cinzel font-bold flex items-center gap-2 transition-all bg-[#D4AF37] text-black shadow-lg border border-[#D4AF37]';
    }
    if (tabRates) {
      tabRates.className = 'px-4 py-2 rounded-xl text-xs font-cinzel font-semibold flex items-center gap-2 transition-all text-gray-400 hover:text-white hover:bg-white/5 border border-transparent';
    }

    window.location.hash = '#tag-generator';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Auto-initialize when loaded
document.addEventListener('DOMContentLoaded', () => {
  if (typeof LiveRates !== 'undefined' && typeof LiveRates.init === 'function') {
    LiveRates.init();
  }

  // Check URL hash to open rates directly if accessed via #live-rates
  if (window.location.hash === '#live-rates' || window.location.hash === '#rates') {
    switchMainView('rates');
  }
});

// Window load fallback
window.addEventListener('load', () => {
  if (typeof LiveRates !== 'undefined' && typeof LiveRates.init === 'function') {
    LiveRates.init();
  }
  if (window.location.hash === '#live-rates' || window.location.hash === '#rates') {
    switchMainView('rates');
  }
});
