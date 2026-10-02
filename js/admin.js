/**
 * WJ Jewellers - Protected Admin Panel Module
 * Secure session guard, dashboard overview, staff salary & payroll tracker,
 * daily shop ledger notebook, stock inventory manager, and live bullion API control.
 */

const Admin = {
  currentTab: 'tags',
  payrollFilter: 'all',
  payrollSearch: '',
  ledgerFilter: 'all',
  ledgerSearch: '',
  stockFilter: 'all',
  stockSearch: '',
  inquiryFilter: 'all',
  inquirySearch: '',
  editingStaffId: null,
  editingLedgerId: null,
  editingProductId: null,

  // Route entry guard (Always authorized for store barcode & tag generator)
  checkAccess() {
    this.showDashboardView();
    return true;
  },

  // Show login form (Bypassed: Direct access to tag generator)
  showLoginView() {
    this.showDashboardView();
  },

  // Show authenticated admin dashboard
  showDashboardView() {
    const adminApp = document.getElementById('admin-app-container');
    const loginView = document.getElementById('admin-login-view');
    const showcaseView = document.getElementById('public-showcase-view');

    if (showcaseView) {
      showcaseView.classList.add('hidden');
      showcaseView.style.display = 'none';
    }
    if (loginView) {
      loginView.classList.add('hidden');
      loginView.classList.remove('flex');
      loginView.style.display = 'none';
    }
    if (adminApp) {
      adminApp.classList.remove('hidden');
      adminApp.classList.add('flex');
      adminApp.style.display = 'flex';
    }

    if (document.body) document.body.style.overflow = '';
    this.renderCurrentTab();
    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  // Cryptographic Authentication Config (Zero Plaintext Secrets)
  AUTH_SALT: 'WJ_ATELIER_SECURE_SALT_2026',
  AUTH_HASH: '6d289487db40845dcaa322b0b6e16e99ddcd2a9e438700c4347a9f5613fcad26',
  failedAttempts: 0,
  lockoutUntil: 0,

  async computeCredentialHash(username, password) {
    const raw = `${username}:${password}:${this.AUTH_SALT}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Handle Login Authentication
  async handleLogin(event) {
    event.preventDefault();

    const now = Date.now();
    const errorMsg = document.getElementById('login-error-msg');
    const formContainer = document.getElementById('login-card-container');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Check brute-force lockout
    if (this.lockoutUntil > now) {
      const remainingSec = Math.ceil((this.lockoutUntil - now) / 1000);
      if (errorMsg) {
        errorMsg.classList.remove('hidden');
        errorMsg.textContent = `Security Lockout Active: Too many failed attempts. Try again in ${remainingSec}s.`;
      }
      Utils.showToast('Terminal Locked', `Security rate limit active. Please wait ${remainingSec} seconds.`, 'error');
      return;
    }

    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      if (errorMsg) {
        errorMsg.classList.remove('hidden');
        errorMsg.textContent = 'Please enter both username and passphrase.';
      }
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      const computedHash = await this.computeCredentialHash(username, password);

      if (computedHash === this.AUTH_HASH) {
        this.failedAttempts = 0;
        this.lockoutUntil = 0;
        Utils.setAdminSession(username);
        if (errorMsg) errorMsg.classList.add('hidden');
        form.reset();
        Utils.showToast('Authentication Successful', 'Welcome to WJ Jewellers Atelier Operations Center.', 'success');
        this.showDashboardView();
      } else {
        this.failedAttempts++;
        if (this.failedAttempts >= 5) {
          this.lockoutUntil = Date.now() + 60000; // 60-second lockout
          if (errorMsg) {
            errorMsg.classList.remove('hidden');
            errorMsg.textContent = 'Security Lockout: 5 failed attempts reached. Terminal locked for 60 seconds.';
          }
          Utils.showToast('Terminal Locked', 'Excessive failed attempts. Terminal locked for 60 seconds.', 'error');
        } else {
          const attemptsLeft = 5 - this.failedAttempts;
          if (errorMsg) {
            errorMsg.classList.remove('hidden');
            errorMsg.textContent = `Access Denied: Invalid administrator credentials (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining).`;
          }
          Utils.showToast('Access Denied', 'Invalid credentials provided.', 'error');
        }

        if (formContainer) {
          formContainer.classList.add('auth-shake');
          setTimeout(() => formContainer.classList.remove('auth-shake'), 500);
        }
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  // Handle Logout
  handleLogout() {
    Utils.clearAdminSession();
    Utils.showToast('Session Terminated', 'You have been safely signed out of WJ Jewellers Portal.', 'gold');
    window.location.hash = '#/';
    const showcaseView = document.getElementById('public-showcase-view');
    const adminApp = document.getElementById('admin-app-container');
    const loginView = document.getElementById('admin-login-view');

    if (adminApp) {
      adminApp.classList.add('hidden');
      adminApp.classList.remove('flex');
      adminApp.style.display = 'none';
    }
    if (loginView) {
      loginView.classList.add('hidden');
      loginView.classList.remove('flex');
      loginView.style.display = 'none';
    }
    if (showcaseView) {
      showcaseView.classList.remove('hidden');
      showcaseView.style.display = '';
    }

    if (document.body) document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  // Switch Admin Tabs (Solely tags generator)
  switchTab(tabName = 'tags') {
    this.currentTab = 'tags';
    this.renderCurrentTab();
    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  renderCurrentTab() {
    this.currentTab = 'tags';
    const activePanel = document.getElementById('admin-panel-tags');
    if (activePanel) {
      activePanel.classList.remove('hidden');
      activePanel.style.display = 'block';
    }

    if (typeof BarcodeTags !== 'undefined') {
      BarcodeTags.init();
    }
  },

  /* ==========================================================================
     1. EXECUTIVE DASHBOARD OVERVIEW
     ========================================================================== */
  renderDashboardOverview() {
    const products = DataStore.getProducts();
    const staff = DataStore.getStaff();
    const ledger = DataStore.getLedger();
    const inquiries = DataStore.getInquiries();

    // Calculations
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stockQty), 0);
    const totalStockUnits = products.reduce((acc, p) => acc + p.stockQty, 0);

    const monthlyPayrollTotal = staff.reduce((acc, s) => acc + s.baseSalary + (s.bonus || 0), 0);
    const paidStaffCount = staff.filter(s => s.status === 'Paid').length;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayExpenses = ledger
      .filter(l => l.date === todayDate)
      .reduce((acc, l) => acc + l.amount, 0);
    const monthExpenses = ledger.reduce((acc, l) => acc + l.amount, 0);

    const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;

    // Set widget values
    const inventoryValEl = document.getElementById('dash-inventory-val');
    const inventoryCountEl = document.getElementById('dash-inventory-count');
    const payrollValEl = document.getElementById('dash-payroll-val');
    const payrollStatusEl = document.getElementById('dash-payroll-status');
    const ledgerTodayEl = document.getElementById('dash-ledger-today');
    const ledgerMonthEl = document.getElementById('dash-ledger-month');
    const inquiriesCountEl = document.getElementById('dash-inquiries-count');

    if (inventoryValEl) inventoryValEl.textContent = Utils.formatPrice(totalInventoryValue);
    if (inventoryCountEl) inventoryCountEl.textContent = `${totalStockUnits} Indian master pieces across ${products.length} catalog items`;

    if (payrollValEl) payrollValEl.textContent = Utils.formatPrice(monthlyPayrollTotal);
    if (payrollStatusEl) payrollStatusEl.textContent = `${paidStaffCount} of ${staff.length} staff paid for current cycle`;

    if (ledgerTodayEl) ledgerTodayEl.textContent = Utils.formatPrice(todayExpenses);
    if (ledgerMonthEl) ledgerMonthEl.textContent = `Month Total: ${Utils.formatPrice(monthExpenses)}`;

    if (inquiriesCountEl) inquiriesCountEl.textContent = `${newInquiriesCount} Pending Review`;

    // Category breakdown widgets
    const categoryCounts = { bridal: 0, diamonds: 0, polki: 0, bangles: 0 };
    products.forEach(p => {
      if (categoryCounts[p.category] !== undefined) {
        categoryCounts[p.category] += p.stockQty;
      }
    });

    const bridalCountEl = document.getElementById('dash-cat-bridal');
    const diamondsCountEl = document.getElementById('dash-cat-diamonds');
    const polkiCountEl = document.getElementById('dash-cat-polki');
    const banglesCountEl = document.getElementById('dash-cat-bangles');

    if (bridalCountEl) bridalCountEl.textContent = `${categoryCounts.bridal} items`;
    if (diamondsCountEl) diamondsCountEl.textContent = `${categoryCounts.diamonds} items`;
    if (polkiCountEl) polkiCountEl.textContent = `${categoryCounts.polki} items`;
    if (banglesCountEl) banglesCountEl.textContent = `${categoryCounts.bangles} items`;

    // Render Recent Inquiries mini table
    const inquiriesPreview = document.getElementById('dash-inquiries-preview');
    if (inquiriesPreview) {
      if (inquiries.length === 0) {
        inquiriesPreview.innerHTML = '<div class="p-6 text-center text-gray-500 text-xs">No pending VIP inquiries.</div>';
      } else {
        inquiriesPreview.innerHTML = inquiries.slice(0, 4).map(inq => `
          <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#D4AF37]/30 transition-all">
            <div class="min-w-0 flex-1 pr-3">
              <div class="flex items-center gap-2">
                <span class="font-medium text-white text-xs truncate">${inq.clientName}</span>
                <span class="text-[10px] px-2 py-0.2 rounded-full ${inq.status === 'New' ? 'bg-amber-950 text-amber-300 border border-amber-800/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'}">
                  ${inq.status}
                </span>
              </div>
              <p class="text-[11px] text-gray-400 truncate mt-0.5">${inq.categoryOrItem}</p>
            </div>
            <div class="text-right whitespace-nowrap">
              <span class="text-[11px] text-gray-400 block">${inq.preferredDate}</span>
              <button 
                onclick="Admin.switchTab('inquiries')" 
                class="text-[10px] text-amber-400 hover:text-amber-300 font-cinzel mt-0.5 inline-block"
              >
                View Dossier <i class="fa-solid fa-arrow-right text-[8px] ml-1"></i>
              </button>
            </div>
          </div>
        `).join('');
      }
    }
  },

  /* ==========================================================================
     2. STAFF SALARY & PAYROLL TRACKER
     ========================================================================== */
  renderPayrollTable() {
    const tableBody = document.getElementById('payroll-table-body');
    if (!tableBody) return;

    let staff = DataStore.getStaff();

    // Filter
    if (this.payrollFilter !== 'all') {
      staff = staff.filter(s => s.status.toLowerCase() === this.payrollFilter.toLowerCase());
    }

    // Search
    if (this.payrollSearch) {
      staff = staff.filter(s => 
        s.name.toLowerCase().includes(this.payrollSearch) ||
        s.role.toLowerCase().includes(this.payrollSearch) ||
        s.empId.toLowerCase().includes(this.payrollSearch) ||
        s.department.toLowerCase().includes(this.payrollSearch)
      );
    }

    // Summary Calculation
    const allStaff = DataStore.getStaff();
    const totalPayroll = allStaff.reduce((sum, s) => sum + s.baseSalary + (s.bonus || 0), 0);
    const paidSum = allStaff
      .filter(s => s.status === 'Paid')
      .reduce((sum, s) => sum + s.baseSalary + (s.bonus || 0), 0);
    const pendingSum = allStaff
      .filter(s => s.status === 'Pending')
      .reduce((sum, s) => sum + s.baseSalary + (s.bonus || 0), 0);

    const totalEl = document.getElementById('payroll-metric-total');
    const paidEl = document.getElementById('payroll-metric-paid');
    const pendingEl = document.getElementById('payroll-metric-pending');
    const headcountEl = document.getElementById('payroll-metric-count');

    if (totalEl) totalEl.textContent = Utils.formatPrice(totalPayroll);
    if (paidEl) paidEl.textContent = Utils.formatPrice(paidSum);
    if (pendingEl) pendingEl.textContent = Utils.formatPrice(pendingSum);
    if (headcountEl) headcountEl.textContent = `${allStaff.length} Employees`;

    if (staff.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-gray-500 text-xs">
            No employee records match the selected filter.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = staff.map(emp => {
      const isPaid = emp.status === 'Paid';
      const totalCompensation = emp.baseSalary + (emp.bonus || 0);

      return `
        <tr class="hover:bg-[#1A1A1E]/80 transition-colors">
          <td>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B6508] to-[#D4AF37] text-black font-cinzel font-bold text-xs flex items-center justify-center shadow-md">
                ${emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <span class="font-medium text-white block text-sm">${emp.name}</span>
                <span class="text-[11px] text-gray-500 font-mono">${emp.empId}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="text-xs text-gray-300 block font-medium">${emp.role}</span>
            <span class="text-[10px] text-amber-400/80 block">${emp.department}</span>
          </td>
          <td>
            <span class="font-semibold text-white text-sm block">${Utils.formatPrice(totalCompensation)}</span>
            <span class="text-[10px] text-gray-500 block">Base: ${Utils.formatPrice(emp.baseSalary)} + Bonus: ${Utils.formatPrice(emp.bonus || 0)}</span>
          </td>
          <td>
            <span class="text-xs text-gray-300 block">${Utils.formatDate(emp.paymentDate)}</span>
            <span class="text-[10px] text-gray-500 block">${emp.paymentMethod || 'Direct Wire'}</span>
          </td>
          <td>
            <button 
              onclick="Admin.toggleStaffPaymentStatus('${emp.id}')"
              title="Click to toggle Paid/Pending"
              class="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5 ${
                isPaid
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/40 hover:bg-amber-900/60'
              }"
            >
              <i class="fa-solid fa-${isPaid ? 'check-double' : 'clock'} text-[10px]"></i>
              ${emp.status}
            </button>
          </td>
          <td class="max-w-[200px]">
            <p class="text-xs text-gray-400 truncate" title="${emp.notes || 'No notes'}">${emp.notes || '—'}</p>
          </td>
          <td class="text-right">
            <div class="flex items-center justify-end gap-2">
              <button 
                onclick="Admin.openEditStaffModal('${emp.id}')"
                class="p-1.5 text-gray-400 hover:text-[#F3E5AB] rounded hover:bg-white/5 transition-all text-xs"
                title="Edit Employee"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button 
                onclick="Admin.deleteStaffRecord('${emp.id}')"
                class="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-white/5 transition-all text-xs"
                title="Delete Employee"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Toggle Paid / Pending status
  toggleStaffPaymentStatus(empId) {
    const staff = DataStore.getStaff();
    const emp = staff.find(s => s.id === empId);
    if (!emp) return;

    if (emp.status === 'Paid') {
      emp.status = 'Pending';
      Utils.showToast('Payment Status Updated', `${emp.name} marked as Pending.`, 'gold');
    } else {
      emp.status = 'Paid';
      emp.paymentDate = new Date().toISOString().split('T')[0];
      Utils.showToast('Payment Disbursed', `${emp.name} marked as Paid.`, 'success');
    }

    DataStore.saveStaff(staff);
    this.renderPayrollTable();
    this.renderDashboardOverview();
  },

  // Open modal to add or edit employee
  openAddStaffModal() {
    this.editingStaffId = null;
    const form = document.getElementById('staff-form');
    if (form) form.reset();
    const title = document.getElementById('staff-modal-title');
    if (title) title.textContent = 'Add Employee to WJ Jewellers Payroll';
    Utils.openModal('staff-modal');
  },

  openEditStaffModal(empId) {
    this.editingStaffId = empId;
    const staff = DataStore.getStaff();
    const emp = staff.find(s => s.id === empId);
    if (!emp) return;

    const form = document.getElementById('staff-form');
    if (form) {
      form.empName.value = emp.name;
      form.empRole.value = emp.role;
      form.empDept.value = emp.department;
      form.empSalary.value = emp.baseSalary;
      form.empBonus.value = emp.bonus || 0;
      form.empStatus.value = emp.status;
      form.empMethod.value = emp.paymentMethod || 'Bank Wire / NEFT';
      form.empDate.value = emp.paymentDate || '';
      form.empNotes.value = emp.notes || '';
    }

    const title = document.getElementById('staff-modal-title');
    if (title) title.textContent = `Edit Payroll: ${emp.name}`;
    Utils.openModal('staff-modal');
  },

  handleStaffFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.empName.value.trim();
    const role = form.empRole.value.trim();
    const department = form.empDept.value.trim();
    const salary = parseFloat(form.empSalary.value);
    const bonus = parseFloat(form.empBonus.value) || 0;
    const status = form.empStatus.value;
    const method = form.empMethod.value;
    const date = form.empDate.value || new Date().toISOString().split('T')[0];
    const notes = form.empNotes.value.trim();

    if (!name || !role || isNaN(salary) || salary <= 0) {
      Utils.showToast('Validation Error', 'Please specify a valid employee name, role, and salary.', 'error');
      return;
    }

    let staff = DataStore.getStaff();

    if (this.editingStaffId) {
      const emp = staff.find(s => s.id === this.editingStaffId);
      if (emp) {
        emp.name = name;
        emp.role = role;
        emp.department = department;
        emp.baseSalary = salary;
        emp.bonus = bonus;
        emp.status = status;
        emp.paymentMethod = method;
        emp.paymentDate = date;
        emp.notes = notes;
      }
      Utils.showToast('Staff Record Updated', `${name}'s payroll details saved.`, 'success');
    } else {
      const nextNum = staff.length + 1;
      const newEmp = {
        id: 'emp-' + Date.now().toString(36),
        empId: 'WJ-EMP-' + (nextNum < 10 ? '0' + nextNum : nextNum),
        name,
        role,
        department,
        baseSalary: salary,
        bonus,
        status,
        paymentDate: date,
        paymentMethod: method,
        notes
      };
      staff.unshift(newEmp);
      Utils.showToast('Staff Enrolled', `${name} added to payroll ledger.`, 'success');
    }

    DataStore.saveStaff(staff);
    Utils.closeModal('staff-modal');
    this.renderPayrollTable();
    this.renderDashboardOverview();
  },

  deleteStaffRecord(empId) {
    const staff = DataStore.getStaff();
    const emp = staff.find(s => s.id === empId);
    if (!emp) return;

    if (confirm(`Are you sure you want to remove ${emp.name} (${emp.role}) from the payroll system?`)) {
      const updated = staff.filter(s => s.id !== empId);
      DataStore.saveStaff(updated);
      Utils.showToast('Record Removed', `${emp.name} has been deleted from payroll records.`, 'gold');
      this.renderPayrollTable();
      this.renderDashboardOverview();
    }
  },

  exportPayrollCsv() {
    const staff = DataStore.getStaff();
    const headers = ['Employee ID', 'Name', 'Role', 'Department', 'Base Salary (USD)', 'Bonus (USD)', 'Total (USD)', 'Status', 'Payment Date', 'Payment Method', 'Notes'];
    const rows = staff.map(s => [
      s.empId,
      s.name,
      s.role,
      s.department,
      s.baseSalary,
      s.bonus || 0,
      s.baseSalary + (s.bonus || 0),
      s.status,
      s.paymentDate,
      s.paymentMethod,
      s.notes || ''
    ]);

    Utils.exportToCsv(`WJ_Jewellers_Payroll_Report_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    Utils.showToast('Export Generated', 'Payroll CSV ledger downloaded.', 'success');
  },

  /* ==========================================================================
     3. DAILY SHOP LEDGER & EXPENSE NOTEBOOK
     ========================================================================== */
  renderLedgerTable() {
    const tableBody = document.getElementById('ledger-table-body');
    if (!tableBody) return;

    let ledger = DataStore.getLedger();

    // Category filter
    if (this.ledgerFilter !== 'all') {
      ledger = ledger.filter(l => l.category.toLowerCase().includes(this.ledgerFilter.toLowerCase()));
    }

    // Search
    if (this.ledgerSearch) {
      ledger = ledger.filter(l => 
        l.description.toLowerCase().includes(this.ledgerSearch) ||
        l.voucherNo.toLowerCase().includes(this.ledgerSearch) ||
        l.incurredBy.toLowerCase().includes(this.ledgerSearch) ||
        l.category.toLowerCase().includes(this.ledgerSearch)
      );
    }

    // Ledger Summary Metrics
    const allLedger = DataStore.getLedger();
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = allLedger.filter(l => l.date === today).reduce((sum, l) => sum + l.amount, 0);
    const monthTotal = allLedger.reduce((sum, l) => sum + l.amount, 0);
    const maxOutflow = allLedger.length > 0 ? Math.max(...allLedger.map(l => l.amount)) : 0;

    const todayEl = document.getElementById('ledger-metric-today');
    const monthEl = document.getElementById('ledger-metric-month');
    const maxEl = document.getElementById('ledger-metric-max');
    const countEl = document.getElementById('ledger-metric-count');

    if (todayEl) todayEl.textContent = Utils.formatPrice(todayTotal);
    if (monthEl) monthEl.textContent = Utils.formatPrice(monthTotal);
    if (maxEl) maxEl.textContent = Utils.formatPrice(maxOutflow);
    if (countEl) countEl.textContent = `${allLedger.length} Vouchers`;

    if (ledger.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-gray-500 text-xs">
            No expense vouchers match the selected filter.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = ledger.map(entry => `
      <tr class="hover:bg-[#1A1A1E]/80 transition-colors">
        <td>
          <span class="font-mono text-xs text-[#E5C558] font-medium block">${entry.voucherNo}</span>
          <span class="text-[11px] text-gray-500">${Utils.formatDate(entry.date)}</span>
        </td>
        <td>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-cinzel font-medium bg-[#1C1C22] text-[#F3E5AB] border border-[#D4AF37]/30 inline-block">
            ${entry.category}
          </span>
        </td>
        <td class="max-w-[280px]">
          <p class="text-xs text-white leading-relaxed line-clamp-2" title="${entry.description}">
            ${entry.description}
          </p>
        </td>
        <td>
          <span class="font-mono font-semibold text-rose-300 text-sm">
            -${Utils.formatPrice(entry.amount)}
          </span>
        </td>
        <td>
          <span class="text-xs text-gray-300 block">${entry.paymentMode || 'Corporate Wire'}</span>
          <span class="text-[10px] text-gray-500 block">By: ${entry.incurredBy}</span>
        </td>
        <td>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
            ${entry.status || 'Settled'}
          </span>
        </td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-2">
            <button 
              onclick="Admin.openEditLedgerModal('${entry.id}')"
              class="p-1.5 text-gray-400 hover:text-[#F3E5AB] rounded hover:bg-white/5 transition-all text-xs"
              title="Edit Voucher"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button 
              onclick="Admin.deleteLedgerRecord('${entry.id}')"
              class="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-white/5 transition-all text-xs"
              title="Delete Voucher"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // Open Ledger Modal
  openAddLedgerModal() {
    this.editingLedgerId = null;
    const form = document.getElementById('ledger-form');
    if (form) {
      form.reset();
      form.ledgerDate.value = new Date().toISOString().split('T')[0];
    }
    const title = document.getElementById('ledger-modal-title');
    if (title) title.textContent = 'Record Daily Shop Expense Voucher';
    Utils.openModal('ledger-modal');
  },

  openEditLedgerModal(id) {
    this.editingLedgerId = id;
    const ledger = DataStore.getLedger();
    const entry = ledger.find(l => l.id === id);
    if (!entry) return;

    const form = document.getElementById('ledger-form');
    if (form) {
      form.ledgerDate.value = entry.date;
      form.ledgerCategory.value = entry.category;
      form.ledgerAmount.value = entry.amount;
      form.ledgerMode.value = entry.paymentMode;
      form.ledgerAuthor.value = entry.incurredBy;
      form.ledgerDesc.value = entry.description;
    }

    const title = document.getElementById('ledger-modal-title');
    if (title) title.textContent = `Edit Voucher: ${entry.voucherNo}`;
    Utils.openModal('ledger-modal');
  },

  handleLedgerFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const date = form.ledgerDate.value;
    const category = form.ledgerCategory.value;
    const amount = parseFloat(form.ledgerAmount.value);
    const paymentMode = form.ledgerMode.value;
    const incurredBy = form.ledgerAuthor.value.trim();
    const description = form.ledgerDesc.value.trim();

    if (!description || isNaN(amount) || amount <= 0 || !incurredBy) {
      Utils.showToast('Validation Error', 'Please enter a valid expense description, amount, and author.', 'error');
      return;
    }

    let ledger = DataStore.getLedger();

    if (this.editingLedgerId) {
      const entry = ledger.find(l => l.id === this.editingLedgerId);
      if (entry) {
        entry.date = date;
        entry.category = category;
        entry.amount = amount;
        entry.paymentMode = paymentMode;
        entry.incurredBy = incurredBy;
        entry.description = description;
      }
      Utils.showToast('Voucher Updated', `Expense ${entry.voucherNo} updated.`, 'success');
    } else {
      const voucherNum = 'WJ-V-' + date.replace(/-/g, '').slice(0, 6) + '-' + (Math.floor(Math.random() * 900) + 100);
      const newEntry = {
        id: 'led-' + Date.now().toString(36),
        voucherNo: voucherNum,
        date,
        category,
        description,
        amount,
        paymentMode,
        incurredBy,
        status: 'Completed'
      };
      ledger.unshift(newEntry);
      Utils.showToast('Expense Recorded', `Voucher ${voucherNum} recorded in daily ledger.`, 'success');
    }

    DataStore.saveLedger(ledger);
    Utils.closeModal('ledger-modal');
    this.renderLedgerTable();
    this.renderDashboardOverview();
  },

  deleteLedgerRecord(id) {
    const ledger = DataStore.getLedger();
    const entry = ledger.find(l => l.id === id);
    if (!entry) return;

    if (confirm(`Delete expense voucher ${entry.voucherNo} (${Utils.formatPrice(entry.amount)})?`)) {
      const updated = ledger.filter(l => l.id !== id);
      DataStore.saveLedger(updated);
      Utils.showToast('Voucher Deleted', `${entry.voucherNo} removed from ledger.`, 'gold');
      this.renderLedgerTable();
      this.renderDashboardOverview();
    }
  },

  exportLedgerCsv() {
    const ledger = DataStore.getLedger();
    const headers = ['Voucher No', 'Date', 'Category', 'Description', 'Amount (USD)', 'Payment Mode', 'Recorded By', 'Status'];
    const rows = ledger.map(l => [
      l.voucherNo,
      l.date,
      l.category,
      l.description,
      l.amount,
      l.paymentMode,
      l.incurredBy,
      l.status
    ]);

    Utils.exportToCsv(`WJ_Jewellers_Ledger_Notebook_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    Utils.showToast('Ledger Exported', 'CSV notebook downloaded.', 'success');
  },

  /* ==========================================================================
     4. STOCK SUMMARY QUICK-GLANCE & CATALOG MANAGEMENT
     ========================================================================== */
  renderStockTable() {
    const tableBody = document.getElementById('stock-table-body');
    if (!tableBody) return;

    let products = DataStore.getProducts();

    // Category filter
    if (this.stockFilter !== 'all') {
      products = products.filter(p => p.category === this.stockFilter);
    }

    // Search
    if (this.stockSearch) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(this.stockSearch) ||
        p.sku.toLowerCase().includes(this.stockSearch) ||
        p.metalPurity.toLowerCase().includes(this.stockSearch)
      );
    }

    const allProducts = DataStore.getProducts();
    const totalQty = allProducts.reduce((sum, p) => sum + p.stockQty, 0);
    const totalVal = allProducts.reduce((sum, p) => sum + (p.price * p.stockQty), 0);
    const lowStockCount = allProducts.filter(p => p.stockQty <= 1).length;

    const countEl = document.getElementById('stock-metric-count');
    const valEl = document.getElementById('stock-metric-value');
    const alertEl = document.getElementById('stock-metric-alerts');

    if (countEl) countEl.textContent = `${totalQty} Units`;
    if (valEl) valEl.textContent = Utils.formatPrice(totalVal);
    if (alertEl) alertEl.textContent = `${lowStockCount} Low Stock`;

    if (products.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-gray-500 text-xs">
            No jewelry items found matching query.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = products.map(prod => `
      <tr class="hover:bg-[#1A1A1E]/80 transition-colors">
        <td>
          <div class="flex items-center gap-3">
            <img src="${prod.image}" alt="${prod.name}" class="w-11 h-11 object-cover rounded-lg border border-[#D4AF37]/30" onerror="this.src='assets/indian_bridal_hero.jpg'" />
            <div>
              <span class="font-medium text-white text-sm block leading-snug">${prod.name}</span>
              <span class="text-[11px] text-gray-500 font-mono">${prod.sku} · ${prod.indianType || ''}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-cinzel bg-[#1C1C22] text-[#F3E5AB] border border-[#D4AF37]/30">
            ${prod.categoryName}
          </span>
        </td>
        <td>
          <span class="text-xs text-gray-300 block">${prod.metalPurity.split('(')[0]}</span>
          <span class="text-[10px] text-gray-500 block">Gross: ${prod.grossWeight}</span>
        </td>
        <td>
          <span class="font-cinzel font-semibold text-white text-sm">
            ${Utils.formatPrice(prod.price)}
          </span>
        </td>
        <td>
          <div class="flex items-center gap-2">
            <button 
              onclick="Admin.adjustProductStock('${prod.id}', -1)"
              class="w-6 h-6 rounded bg-black/60 border border-gray-700 text-gray-300 hover:text-white hover:border-[#D4AF37] flex items-center justify-center text-xs"
              title="Decrease quantity"
            >-</button>
            <span class="font-mono text-sm font-semibold w-6 text-center text-white">${prod.stockQty}</span>
            <button 
              onclick="Admin.adjustProductStock('${prod.id}', 1)"
              class="w-6 h-6 rounded bg-black/60 border border-gray-700 text-gray-300 hover:text-white hover:border-[#D4AF37] flex items-center justify-center text-xs"
              title="Increase quantity"
            >+</button>
          </div>
        </td>
        <td>
          <span class="text-[10px] px-2 py-0.5 rounded-full ${
            prod.stockQty > 1
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
              : prod.stockQty === 1
              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
              : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
          }">
            ${prod.stockQty > 1 ? 'In Stock' : prod.stockQty === 1 ? 'Low Stock' : 'Sold Out'}
          </span>
        </td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-2">
            <button 
              onclick="Admin.openEditProductModal('${prod.id}')"
              class="p-1.5 text-gray-400 hover:text-[#F3E5AB] rounded hover:bg-white/5 transition-all text-xs"
              title="Edit Piece"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button 
              onclick="Admin.deleteProduct('${prod.id}')"
              class="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-white/5 transition-all text-xs"
              title="Delete Piece"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  adjustProductStock(productId, delta) {
    const products = DataStore.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    prod.stockQty = Math.max(0, prod.stockQty + delta);
    prod.status = prod.stockQty > 1 ? 'In Stock' : prod.stockQty === 1 ? 'Low Stock' : 'Sold Out';

    DataStore.saveProducts(products);
    this.renderStockTable();
    this.renderDashboardOverview();
    Showcase.renderCollections();
    Showcase.renderIndianBridalCarousel();
  },

  openAddProductModal() {
    this.editingProductId = null;
    const form = document.getElementById('product-form');
    if (form) form.reset();
    const title = document.getElementById('product-modal-title');
    if (title) title.textContent = 'Catalog New Indian Fine Jewelry Piece';
    Utils.openModal('product-modal');
  },

  openEditProductModal(productId) {
    this.editingProductId = productId;
    const products = DataStore.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const form = document.getElementById('product-form');
    if (form) {
      form.prodName.value = prod.name;
      form.prodCategory.value = prod.category;
      form.prodPrice.value = prod.price;
      form.prodQty.value = prod.stockQty;
      form.prodPurity.value = prod.metalPurity;
      form.prodGrossWt.value = prod.grossWeight;
      form.prodNetGold.value = prod.netGoldWeight;
      form.prodGemstones.value = prod.gemstones;
      form.prodCert.value = prod.certification;
      form.prodImage.value = prod.image;
      form.prodDesc.value = prod.description;
    }

    const title = document.getElementById('product-modal-title');
    if (title) title.textContent = `Edit Catalog Item: ${prod.sku}`;
    Utils.openModal('product-modal');
  },

  handleProductFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.prodName.value.trim();
    const category = form.prodCategory.value;
    const price = parseFloat(form.prodPrice.value);
    const stockQty = parseInt(form.prodQty.value, 10);
    const metalPurity = form.prodPurity.value.trim();
    const grossWeight = form.prodGrossWt.value.trim();
    const netGoldWeight = form.prodNetGold.value.trim();
    const gemstones = form.prodGemstones.value.trim();
    const certification = form.prodCert.value.trim();
    const image = form.prodImage.value.trim() || 'assets/indian_bridal_hero.jpg';
    const description = form.prodDesc.value.trim();

    if (!name || isNaN(price) || price <= 0 || isNaN(stockQty) || !metalPurity) {
      Utils.showToast('Validation Error', 'Please complete all required jewelry specifications.', 'error');
      return;
    }

    const categoryNames = {
      bridal: 'Bridal Sets',
      diamonds: 'Diamond Rings',
      polki: 'Polki & Kundan',
      bangles: 'Gold Bangles & Kadas'
    };

    let products = DataStore.getProducts();

    if (this.editingProductId) {
      const prod = products.find(p => p.id === this.editingProductId);
      if (prod) {
        prod.name = name;
        prod.category = category;
        prod.categoryName = categoryNames[category] || 'Indian Fine Jewelry';
        prod.price = price;
        prod.stockQty = stockQty;
        prod.status = stockQty > 1 ? 'In Stock' : stockQty === 1 ? 'Low Stock' : 'Sold Out';
        prod.metalPurity = metalPurity;
        prod.grossWeight = grossWeight;
        prod.netGoldWeight = netGoldWeight;
        prod.gemstones = gemstones;
        prod.certification = certification;
        prod.image = image;
        prod.description = description;
      }
      Utils.showToast('Item Updated', `${name} updated in showcase.`, 'success');
    } else {
      const skuPrefix = category === 'bridal' ? 'BRD' : category === 'diamonds' ? 'RNG' : category === 'polki' ? 'PLK' : 'TMP';
      const newSku = `WJ-${skuPrefix}-${Math.floor(Math.random() * 900) + 100}`;
      const newProduct = {
        id: 'wj-prod-' + Date.now().toString(36),
        sku: newSku,
        name,
        category,
        categoryName: categoryNames[category] || 'Indian Fine Jewelry',
        price,
        metalPurity,
        grossWeight: grossWeight || '35.00 g',
        netGoldWeight: netGoldWeight || '30.00 g',
        gemstones: gemstones || 'Natural Gemstones',
        diamondGrade: 'VVS1, E-F Color',
        certification: certification || 'BIS Hallmarked Laser Seal',
        makingCharges: '15% Included',
        description,
        stockQty,
        status: stockQty > 0 ? 'In Stock' : 'Sold Out',
        image,
        featured: false,
        indianType: category === 'polki' ? 'Polki Choker' : category === 'bangles' ? 'Temple Kada' : 'Indian Fine Jewelry'
      };
      products.unshift(newProduct);
      Utils.showToast('Masterpiece Cataloged', `${name} is now live in public showcase.`, 'success');
    }

    DataStore.saveProducts(products);
    Utils.closeModal('product-modal');
    this.renderStockTable();
    this.renderDashboardOverview();
    Showcase.renderCollections();
    Showcase.renderIndianBridalCarousel();
  },

  deleteProduct(productId) {
    const products = DataStore.getProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (confirm(`Remove "${prod.name}" from active catalog?`)) {
      const updated = products.filter(p => p.id !== productId);
      DataStore.saveProducts(updated);
      Utils.showToast('Item Removed', `${prod.name} uncataloged.`, 'gold');
      this.renderStockTable();
      this.renderDashboardOverview();
      Showcase.renderCollections();
      Showcase.renderIndianBridalCarousel();
    }
  },

  /* ==========================================================================
     5. CUSTOMER INQUIRIES & VIEWING APPOINTMENTS
     ========================================================================== */
  renderInquiriesTable() {
    const container = document.getElementById('inquiries-list-container');
    if (!container) return;

    let inquiries = DataStore.getInquiries();
    const allInquiries = DataStore.getInquiries();

    // Compute metrics
    const totalCount = allInquiries.length;
    const newCount = allInquiries.filter(i => i.status === 'New').length;
    const confirmedCount = allInquiries.filter(i => i.status === 'Confirmed').length;
    const completedCount = allInquiries.filter(i => i.status === 'Completed').length;

    const totalEl = document.getElementById('inquiry-metric-total');
    const newEl = document.getElementById('inquiry-metric-new');
    const confirmedEl = document.getElementById('inquiry-metric-confirmed');
    const completedEl = document.getElementById('inquiry-metric-completed');

    if (totalEl) totalEl.textContent = totalCount;
    if (newEl) newEl.textContent = newCount;
    if (confirmedEl) confirmedEl.textContent = confirmedCount;
    if (completedEl) completedEl.textContent = completedCount;

    // Filter by status
    if (this.inquiryFilter !== 'all') {
      inquiries = inquiries.filter(i => i.status === this.inquiryFilter);
    }

    // Search query
    if (this.inquirySearch) {
      const q = this.inquirySearch;
      inquiries = inquiries.filter(i =>
        (i.clientName && i.clientName.toLowerCase().includes(q)) ||
        (i.email && i.email.toLowerCase().includes(q)) ||
        (i.phone && i.phone.toLowerCase().includes(q)) ||
        (i.categoryOrItem && i.categoryOrItem.toLowerCase().includes(q)) ||
        (i.notes && i.notes.toLowerCase().includes(q))
      );
    }

    if (inquiries.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center text-gray-500 bg-[#141416] rounded-2xl border border-white/5">
          <i class="fa-regular fa-envelope-open text-4xl text-gray-600 mb-3 block"></i>
          <p class="font-cinzel text-sm text-gray-400">No VIP dossiers match the selected filter.</p>
          <span class="text-xs text-gray-600 mt-1 block">Adjust search keywords or status filter above.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = inquiries.map(inq => `
      <div class="p-5 rounded-2xl bg-black/40 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-3">
            <h4 class="font-cinzel font-semibold text-white text-base">${inq.clientName}</h4>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
              inq.status === 'New'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                : inq.status === 'Confirmed'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                : 'bg-gray-800 text-gray-300 border border-gray-700'
            }">
              ${inq.status}
            </span>
          </div>

          <p class="text-xs text-amber-400/90 font-medium">
            <i class="fa-solid fa-gem text-[10px] mr-1"></i> Interest: ${inq.categoryOrItem}
          </p>

          <p class="text-xs text-gray-300 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
            "${inq.notes || 'No custom notes provided.'}"
          </p>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 pt-1">
            <span><i class="fa-solid fa-envelope text-[10px] mr-1 text-[#D4AF37]"></i>${inq.email}</span>
            <span><i class="fa-solid fa-phone text-[10px] mr-1 text-[#D4AF37]"></i>${inq.phone}</span>
            <span><i class="fa-solid fa-calendar text-[10px] mr-1 text-[#D4AF37]"></i>Viewing: ${inq.preferredDate}</span>
            <span><i class="fa-solid fa-wallet text-[10px] mr-1 text-[#D4AF37]"></i>Budget: ${inq.budget}</span>
          </div>
        </div>

        <div class="flex md:flex-col gap-2 shrink-0 justify-end">
          <select 
            onchange="Admin.updateInquiryStatus('${inq.id}', this.value)"
            class="bg-[#18181A] border border-gray-700 text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-[#D4AF37] outline-none"
          >
            <option value="New" ${inq.status === 'New' ? 'selected' : ''}>Status: New</option>
            <option value="Confirmed" ${inq.status === 'Confirmed' ? 'selected' : ''}>Status: Confirmed</option>
            <option value="Completed" ${inq.status === 'Completed' ? 'selected' : ''}>Status: Completed</option>
          </select>

          <a 
            href="mailto:${inq.email}?subject=WJ Jewellers - VIP Salon Appointment Confirmation"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-center border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/15 transition-all"
          >
            <i class="fa-solid fa-reply mr-1"></i> Email Client
          </a>

          <button 
            onclick="Admin.deleteInquiry('${inq.id}')"
            class="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-rose-400 hover:bg-white/5 transition-all text-center"
          >
            <i class="fa-solid fa-trash-can mr-1"></i> Dismiss
          </button>
        </div>
      </div>
    `).join('');
  },

  exportInquiriesCsv() {
    const inquiries = DataStore.getInquiries();
    const headers = ['Client Name', 'Status', 'Jewelry Interest', 'Preferred Date', 'Budget', 'Email', 'Phone', 'Notes', 'Created At'];
    const rows = inquiries.map(i => [
      i.clientName,
      i.status,
      i.categoryOrItem,
      i.preferredDate,
      i.budget,
      i.email,
      i.phone,
      i.notes || '',
      i.createdAt || ''
    ]);
    Utils.exportToCsv(`WJ_Jewellers_VIP_Inquiries_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    Utils.showToast('Inquiries Exported', 'VIP appointments CSV dossier downloaded.', 'success');
  },

  updateInquiryStatus(id, newStatus) {
    const inquiries = DataStore.getInquiries();
    const inq = inquiries.find(i => i.id === id);
    if (!inq) return;

    inq.status = newStatus;
    DataStore.saveInquiries(inquiries);
    Utils.showToast('Inquiry Updated', `${inq.clientName}'s dossier marked as ${newStatus}.`, 'gold');
    this.renderInquiriesTable();
    this.renderDashboardOverview();
  },

  deleteInquiry(id) {
    const inquiries = DataStore.getInquiries();
    const updated = inquiries.filter(i => i.id !== id);
    DataStore.saveInquiries(updated);
    Utils.showToast('Inquiry Dismissed', 'Record deleted from appointment queue.', 'gold');
    this.renderInquiriesTable();
    this.renderDashboardOverview();
  },

  /* ==========================================================================
     6. PRECIOUS METALS RATES & LIVE API CONFIGURATOR
     ========================================================================== */
  renderRatesEditor() {
    const rates = DataStore.getRates();
    const form = document.getElementById('rates-form');
    const apiStatusEl = document.getElementById('admin-api-sync-status');
    if (!form) return;

    form.rateGold24k.value = rates.gold24k.priceUsdPerGram;
    form.rateGold22k.value = rates.gold22k.priceUsdPerGram;
    form.rateGold18k.value = rates.gold18k.priceUsdPerGram;
    form.ratePlat.value = rates.platinum950.priceUsdPerGram;
    form.rateSilver.value = rates.silver999.priceUsdPerGram;

    // Update Live Spot Highlights Grid (5 cards)
    const g24El = document.getElementById('rate-metric-gold24k');
    const g22El = document.getElementById('rate-metric-gold22k');
    const g18El = document.getElementById('rate-metric-gold18k');
    const platEl = document.getElementById('rate-metric-plat');
    const silvEl = document.getElementById('rate-metric-silver');

    if (g24El) g24El.textContent = `${Utils.formatPrice(rates.gold24k.priceUsdPerGram)}/g`;
    if (g22El) g22El.textContent = `${Utils.formatPrice(rates.gold22k.priceUsdPerGram)}/g`;
    if (g18El) g18El.textContent = `${Utils.formatPrice(rates.gold18k.priceUsdPerGram)}/g`;
    if (platEl) platEl.textContent = `${Utils.formatPrice(rates.platinum950.priceUsdPerGram)}/g`;
    if (silvEl) silvEl.textContent = `${Utils.formatPrice(rates.silver999.priceUsdPerGram)}/g`;

    if (apiStatusEl) {
      const syncDate = rates.lastUpdated ? new Date(rates.lastUpdated).toLocaleString() : 'N/A';
      apiStatusEl.innerHTML = `
        <div class="flex items-center justify-between text-xs text-gray-400 bg-black/30 p-3.5 rounded-xl border border-white/5 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-green"></span>
            <span>Active Spot Feed: <strong class="text-[#F3E5AB] font-mono">${rates.source || 'Automated Daily Bullion Feed'}</strong></span>
          </div>
          <span class="font-mono text-[11px] text-gray-400">Last Synced: ${syncDate}</span>
        </div>
      `;
    }
  },

  resetRatesToFeed() {
    Showcase.syncLiveGoldRates();
    this.renderRatesEditor();
    Utils.showToast('Spot Rates Reset', 'Synchronizing with live international bullion feed.', 'gold');
  },

  handleRatesFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const rates = DataStore.getRates();

    rates.gold24k.priceUsdPerGram = parseFloat(form.rateGold24k.value) || rates.gold24k.priceUsdPerGram;
    rates.gold22k.priceUsdPerGram = parseFloat(form.rateGold22k.value) || rates.gold22k.priceUsdPerGram;
    rates.gold18k.priceUsdPerGram = parseFloat(form.rateGold18k.value) || rates.gold18k.priceUsdPerGram;
    rates.platinum950.priceUsdPerGram = parseFloat(form.ratePlat.value) || rates.platinum950.priceUsdPerGram;
    rates.silver999.priceUsdPerGram = parseFloat(form.rateSilver.value) || rates.silver999.priceUsdPerGram;
    rates.lastUpdated = new Date().toISOString();
    rates.source = 'Admin Manual Adjustment';

    DataStore.saveRates(rates);
    Showcase.renderMetalRates();
    this.renderRatesEditor();
    Utils.showToast('Bullion Rates Updated', 'Live prices synchronized across public showcase ticker.', 'success');
  },

  // Reset to factory defaults
  resetAllDemoData() {
    if (confirm('Reset all catalog pieces, payroll entries, ledger vouchers, and inquiries to factory luxury demo state?')) {
      DataStore.resetAllDemoData();
      Utils.showToast('Atelier Data Restored', 'All sample data has been reset to defaults.', 'gold');
      this.renderCurrentTab();
      Showcase.renderCollections();
      Showcase.renderIndianBridalCarousel();
      Showcase.renderMetalRates();
    }
  }
};

if (typeof window !== 'undefined') {
  window.Admin = Admin;
}
