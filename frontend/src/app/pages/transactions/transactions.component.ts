import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TransactionService } from '../../services/transaction.service';
import { PaymentModeService } from '../../services/payment-mode.service';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import dayjs, { Dayjs } from 'dayjs';
import { Transaction } from '../../models/transaction.model';

export interface ComboOption {
  category: string;
  subCategory: string;
  categoryDetail: string;
  matchText: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, NgxDaterangepickerMd],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {
  transactionService = inject(TransactionService);
  paymentModeService = inject(PaymentModeService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Search & Filter State
  searchTerm = signal('');
  selectedCategoryFilters = signal<string[]>([]);
  selectedTypeFilters = signal<string[]>(['expense']);
  selectedPaymentFilters = signal<string[]>([]);
  selectedTxIds = signal<string[]>([]);

  // Amount Filter
  minAmount = signal<number | null>(null);
  maxAmount = signal<number | null>(null);

  // Date Range Filter
  filterRange: { startDate: Dayjs, endDate: Dayjs } = {
    startDate: dayjs('2017-01-01'),
    endDate: dayjs().endOf('year')
  };

  ranges: any = {
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
    'This Year': [dayjs().startOf('year'), dayjs().endOf('year')],
    'All Time': [dayjs('2015-01-01'), dayjs().endOf('year')]
  };

  // Sorting State
  sortColumn = signal<string>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Pagination State
  currentPage = signal(1);
  itemsPerPage = 8;

  toggleSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // Filtered & Searched Transactions
  filteredTransactions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const categories = this.selectedCategoryFilters();
    const types = this.selectedTypeFilters();
    const payments = this.selectedPaymentFilters();
    const rangeStart = this.filterRange.startDate;
    const rangeEnd = this.filterRange.endDate;

    let filtered = this.transactionService.transactions().filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(term) || t.category?.toLowerCase().includes(term);
      const matchesCategory = categories.length === 0 || categories.includes(t.category);
      const matchesType = types.includes(t.type);
      const matchesPayment = payments.length === 0 || payments.includes(t.paymentMode);
      const matchesDate = dayjs(t.date).isAfter(rangeStart) && dayjs(t.date).isBefore(rangeEnd);

      const absAmount = Math.abs(t.amount);
      const matchesMin = this.minAmount() === null || absAmount >= this.minAmount()!;
      const matchesMax = this.maxAmount() === null || absAmount <= this.maxAmount()!;

      return matchesSearch && matchesCategory && matchesType && matchesPayment && matchesDate && matchesMin && matchesMax;
    });

    return filtered.sort((a, b) => {
      const col = this.sortColumn();
      const dir = this.sortDirection() === 'asc' ? 1 : -1;

      let valA: any = a[col as keyof Transaction] || '';
      let valB: any = b[col as keyof Transaction] || '';

      if (col === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (col === 'amount') {
        valA = Math.abs(valA);
        valB = Math.abs(valB);
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  // Paginated Transactions
  paginatedTransactions = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredTransactions().slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredTransactions().length / this.itemsPerPage));

  // Modal State
  isModalOpen = false;
  isFilterOpen = signal(false);
  isEditMode = false;
  editingTxId: string | null = null;

  // New Transaction Form Data
  newTx = {
    type: 'expense',
    date: dayjs(),
    time: '12:00',
    category: 'Food',
    subCategory: '',
    categoryDetail: '',
    descriptionDetail: '',
    amount: null,
    description: '',
    paymentMode: 'Cash'
  };

  categoryOptions: { [key: string]: string[] } = {
    'Food & Grocery': ['Food Outing', 'Snacks', 'Misc', 'Grocery', 'Meat'],
    'Household Expense': ['Rent', 'Maintenance', 'Utilities', 'Mobile & Internet'],
    'Travel': ['Transportation', 'Maintenance', 'Other', 'Hotel'],
    'Finance': ['Govt Fee & Taxes', 'Online Fee', 'Refund', 'Education', 'Debt', 'Other'],
    'Entertainment': ['Movies & Shows', 'Others', 'Games & Sports'],
    'Shopping': ['Furniture & Electronics', 'Dress', 'Jewellery', 'Household Items', 'Delivery', 'Toys', 'Gifts', 'Stationery'],
    'Beauty, Health & Fitness': ['Medical', 'Grooming', 'Home Decor', 'Fitness']
  };

  get categories(): string[] {
    return Object.keys(this.categoryOptions);
  }

  subCategoryOptions: { [key: string]: string[] } = {
    'Food Outing': ['Breakfast', 'Lunch', 'Dinner', 'Tips', 'Tea/Coffee/Cool Drinks'],
    'Snacks': ['Snacks', 'Chocolates', 'Sweets/Cake', 'IceCream'],
    'Misc': ['OH/Cig'],
    'Grocery': ['Grocery', 'Fruits & Vegetables', 'Milk', 'Water'],
    'Meat': ['Chicken/Mutton/Fish'],
    'Rent': ['House Rent'],
    'Maintenance': ['Maintenance Fee', 'Electrical/Plumbing/Carpenter', 'Packers & Movers', 'Vehicle Maintenance', 'Vehicle Insurance'],
    'Utilities': ['EB Charges', 'Water Charges', 'Gas', 'Property Tax'],
    'Mobile & Internet': ['Mobile Recharge', 'Internet Recharge', 'OTT Recharge', 'Cable Charges', 'E-News Recharge'],
    'Transportation': ['Fuel', 'Train/Metro', 'Bus', 'Flight', 'Auto/Cab/Bike Taxi'],
    'Other': ['Entrance Fee', 'Other Fee', 'Toll', 'Fine', 'Manual Expenses', 'Insurance'],
    'Hotel': ['Hotel Expenses', 'Tips'],
    'Govt Fee & Taxes': ['Income Tax'],
    'Online Fee': ['ID Card'],
    'Refund': ['IT Refund', 'Other Refund'],
    'Education': ['School Fees', 'Other Fees'],
    'Debt': ['EMI', 'Home Loan'],
    'Movies & Shows': ['Movie', 'Music Show', 'Standup Comedy', 'Games'],
    'Others': ['Entrance Fee'],
    'Games & Sports': ['Games', 'Sports'],
    'Furniture & Electronics': ['Furniture', 'Electronics', 'Electrical/Plumbing'],
    'Dress': ['Clothing', 'Stitching'],
    'Jewellery': ['Gold/Silver', 'Watches', 'Eyewear', 'Belts & Shoes'],
    'Household Items': ['Plates/Cups', 'Bed', 'Bags', 'Other Accessories'],
    'Delivery': ['Delivery Fee', 'Driver Bata'],
    'Toys': ['Toys'],
    'Gifts': ['Gift - Toys', 'Gift - Dress', 'Gift - Other', 'Photo', 'Crackers'],
    'Stationery': ['Stationery', 'Xerox'],
    'Medical': ['Medicine', 'Consultation Fee', 'Surgery'],
    'Grooming': ['Haircut/Shave', 'Facial', 'Makeup', 'Iron'],
    'Home Decor': ['Other Accessories', 'Plants'],
    'Fitness': ['Gym', 'Swimming']

  };

  availableSubCategories: string[] = [];
  availableCategoryDetails: string[] = [];

  onCategoryChange() {
    const input = this.newTx.category.toLowerCase();
    const actualCategory = this.categories.find(cat => cat.toLowerCase() === input);

    if (actualCategory) {
      this.newTx.category = actualCategory; // Normalize casing
      this.availableSubCategories = this.categoryOptions[actualCategory] || [];
    } else {
      this.availableSubCategories = [];
    }
    this.newTx.subCategory = ''; // Reset dependent fields
    this.newTx.categoryDetail = '';
    this.availableCategoryDetails = [];
  }

  onSubCategoryChange() {
    const input = this.newTx.subCategory.toLowerCase();
    const allSubs = Object.keys(this.subCategoryOptions);
    const actualSub = allSubs.find(sub => sub.toLowerCase() === input);

    if (actualSub) {
      this.newTx.subCategory = actualSub; // Normalize casing
      this.availableCategoryDetails = this.subCategoryOptions[actualSub] || [];

      // Auto-populate parent Category
      let foundCat = '';
      for (const [cat, subs] of Object.entries(this.categoryOptions)) {
        if (subs.includes(actualSub)) {
          foundCat = cat;
          break;
        }
      }

      if (foundCat) {
        this.newTx.category = foundCat;
        this.availableSubCategories = this.categoryOptions[foundCat] || [];
      }
    } else {
      this.availableCategoryDetails = [];
    }
    this.newTx.categoryDetail = ''; // Reset dependent field
  }

  onCategoryDetailChange() {
    const input = this.newTx.categoryDetail.toLowerCase();
    if (!input) return;

    // Find Sub Category (Case-Insensitive)
    let foundSub = '';
    let foundActualDetail = '';

    for (const [sub, details] of Object.entries(this.subCategoryOptions)) {
      const match = details.find(d => d.toLowerCase() === input);
      if (match) {
        foundSub = sub;
        foundActualDetail = match;
        break;
      }
    }

    if (foundSub) {
      this.newTx.categoryDetail = foundActualDetail; // Normalize casing
      this.newTx.subCategory = foundSub;
      this.availableCategoryDetails = this.subCategoryOptions[foundSub] || [];

      // Find Category
      let foundCat = '';
      for (const [cat, subs] of Object.entries(this.categoryOptions)) {
        if (subs.includes(foundSub)) {
          foundCat = cat;
          break;
        }
      }

      if (foundCat) {
        this.newTx.category = foundCat;
        this.availableSubCategories = this.categoryOptions[foundCat] || [];
      }
    }
  }

  paymentModes = computed(() => {
    const backendModes = this.paymentModeService.paymentModes().map(m => m.name);
    return [...new Set(['Cash', ...backendModes])];
  });

  // Combo Box State
  showCombo = false;
  comboSearchTerm = '';
  allComboOptions: ComboOption[] = [];
  filteredComboOptions: ComboOption[] = [];

  // Payment Mode Dropdown State
  showPaymentModeDropdown = false;
  filteredPaymentModesList: string[] = [];

  // Category Dropdowns State
  showCategoryDropdown = false;
  filteredCategoriesList: string[] = [];
  showSubCategoryDropdown = false;
  filteredSubCategoriesList: string[] = [];
  showCategoryDetailDropdown = false;
  filteredCategoryDetailsList: string[] = [];

  ngOnInit() {
    this.loadPaymentModes();
    this.allComboOptions = this.buildComboOptions();
  }

  buildComboOptions(): ComboOption[] {
    const options: ComboOption[] = [];
    for (const cat of this.categories) {
      options.push({ category: cat, subCategory: '', categoryDetail: '', matchText: cat.toLowerCase() });
      const subs = this.categoryOptions[cat] || [];
      for (const sub of subs) {
        options.push({ category: cat, subCategory: sub, categoryDetail: '', matchText: `${cat.toLowerCase()} ${sub.toLowerCase()}` });
        const details = this.subCategoryOptions[sub] || [];
        for (const det of details) {
          options.push({ category: cat, subCategory: sub, categoryDetail: det, matchText: `${cat.toLowerCase()} ${sub.toLowerCase()} ${det.toLowerCase()}` });
        }
      }
    }
    return options;
  }

  onComboInput() {
    const input = (this.comboSearchTerm || '').toLowerCase();
    if (!input) {
      this.filteredComboOptions = this.allComboOptions;
    } else {
      const terms = input.split(' ').filter(t => t);
      this.filteredComboOptions = this.allComboOptions.filter(opt =>
        terms.every(term => opt.matchText.includes(term))
      );
    }
  }

  openCombo() {
    this.showCombo = true;
    this.onComboInput();
  }

  closeCombo() {
    setTimeout(() => {
      this.showCombo = false;
    }, 200);
  }

  selectComboOption(opt: ComboOption) {
    this.comboSearchTerm = '';
    this.newTx.category = opt.category;
    this.onCategoryChange();

    if (opt.subCategory) {
      this.newTx.subCategory = opt.subCategory;
      this.onSubCategoryChange();
    }

    if (opt.categoryDetail) {
      this.newTx.categoryDetail = opt.categoryDetail;
      this.onCategoryDetailChange();
    }

    this.showCombo = false;
  }

  onPaymentModeInput() {
    const input = (this.newTx.paymentMode || '').toLowerCase();
    if (!input) {
      this.filteredPaymentModesList = this.paymentModes();
    } else {
      this.filteredPaymentModesList = this.paymentModes().filter(mode =>
        mode.toLowerCase().includes(input)
      );
    }
  }

  openPaymentModeDropdown() {
    this.showPaymentModeDropdown = true;
    this.onPaymentModeInput();
  }

  closePaymentModeDropdown() {
    setTimeout(() => {
      this.showPaymentModeDropdown = false;
    }, 200);
  }

  selectPaymentMode(mode: string) {
    this.newTx.paymentMode = mode;
    this.showPaymentModeDropdown = false;
  }

  // Category Dropdown Methods
  onCategoryInput() {
    const input = (this.newTx.category || '').toLowerCase();
    if (!input) {
      this.filteredCategoriesList = this.categories;
    } else {
      this.filteredCategoriesList = this.categories.filter(cat =>
        cat.toLowerCase().includes(input)
      );
    }
    this.onCategoryChange();
  }

  openCategoryDropdown() {
    this.showCategoryDropdown = true;
    this.onCategoryInput();
  }

  closeCategoryDropdown() {
    setTimeout(() => {
      this.showCategoryDropdown = false;
    }, 200);
  }

  selectCategory(cat: string) {
    this.newTx.category = cat;
    this.onCategoryChange();
    this.showCategoryDropdown = false;
  }

  // Sub Category Dropdown Methods
  onSubCategoryInput() {
    const input = (this.newTx.subCategory || '').toLowerCase();
    if (!input) {
      this.filteredSubCategoriesList = this.availableSubCategories;
    } else {
      this.filteredSubCategoriesList = this.availableSubCategories.filter(sub =>
        sub.toLowerCase().includes(input)
      );
    }
    this.onSubCategoryChange();
  }

  openSubCategoryDropdown() {
    this.showSubCategoryDropdown = true;
    this.onSubCategoryInput();
  }

  closeSubCategoryDropdown() {
    setTimeout(() => {
      this.showSubCategoryDropdown = false;
    }, 200);
  }

  selectSubCategory(sub: string) {
    this.newTx.subCategory = sub;
    this.onSubCategoryChange();
    this.showSubCategoryDropdown = false;
  }

  // Category Detail Dropdown Methods
  onCategoryDetailInput() {
    const input = (this.newTx.categoryDetail || '').toLowerCase();
    if (!input) {
      this.filteredCategoryDetailsList = this.availableCategoryDetails;
    } else {
      this.filteredCategoryDetailsList = this.availableCategoryDetails.filter(det =>
        det.toLowerCase().includes(input)
      );
    }
    this.onCategoryDetailChange();
  }

  openCategoryDetailDropdown() {
    this.showCategoryDetailDropdown = true;
    this.onCategoryDetailInput();
  }

  closeCategoryDetailDropdown() {
    setTimeout(() => {
      this.showCategoryDetailDropdown = false;
    }, 200);
  }

  selectCategoryDetail(det: string) {
    this.newTx.categoryDetail = det;
    this.onCategoryDetailChange();
    this.showCategoryDetailDropdown = false;
  }

  loadPaymentModes() {
    // We already have paymentModes signal in the service, but let's keep the method 
    // context if other parts of the component rely on this specific logic.
    // However, the best way is to use the signal directly in the template
    // or through a computed property.
    // For now, let's just make sure this doesn't error.
  }

  openModal() {
    this.isModalOpen = true;
    this.isEditMode = false;
    this.editingTxId = null;
    this.comboSearchTerm = '';
    this.newTx = {
      type: 'expense',
      date: dayjs(),
      time: dayjs().format('HH:mm'),
      category: '',
      subCategory: '',
      categoryDetail: '',
      descriptionDetail: '',
      amount: null,
      description: '',
      paymentMode: ''
    };
    this.availableSubCategories = [];
    this.availableCategoryDetails = [];
  }

  openEditModal(t: Transaction) {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.editingTxId = t.id;
    this.comboSearchTerm = '';
    this.newTx = {
      type: t.type,
      date: dayjs(t.date),
      time: dayjs(t.date).format('HH:mm'),
      category: t.category,
      subCategory: t.subCategory,
      categoryDetail: t.categoryDetail,
      descriptionDetail: t.descriptionDetail,
      amount: Math.abs(t.amount) as any,
      description: t.description,
      paymentMode: t.paymentMode
    };

    // Populate datalists
    const catInput = this.newTx.category.toLowerCase();
    const actualCategory = this.categories.find(c => c.toLowerCase() === catInput);
    if (actualCategory) {
      this.availableSubCategories = this.categoryOptions[actualCategory] || [];
    }

    const subInput = this.newTx.subCategory.toLowerCase();
    const allSubs = Object.keys(this.subCategoryOptions);
    const actualSub = allSubs.find(s => s.toLowerCase() === subInput);
    if (actualSub) {
      this.availableCategoryDetails = this.subCategoryOptions[actualSub] || [];
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.editingTxId = null;
  }

  toggleFilterPopup() {
    this.isFilterOpen.update(v => !v);
  }

  closeFilterPopup() {
    this.isFilterOpen.set(false);
  }

  onSubmit() {
    if (this.newTx.amount && this.newTx.description) {
      const amount = -Math.abs(this.newTx.amount);
      const date = this.newTx.date.hour(parseInt(this.newTx.time.split(':')[0]))
        .minute(parseInt(this.newTx.time.split(':')[1]))
        .toISOString();

      if (this.isEditMode && this.editingTxId) {
        const updatedTx: Transaction = {
          id: this.editingTxId,
          description: this.newTx.description,
          amount: amount,
          category: this.newTx.category,
          subCategory: this.newTx.subCategory,
          categoryDetail: this.newTx.categoryDetail,
          descriptionDetail: this.newTx.descriptionDetail,
          paymentMode: this.newTx.paymentMode,
          date: date,
          type: 'expense'
        };
        this.transactionService.updateTransaction(updatedTx).subscribe(() => {
          this.closeModal();
        });
      } else {
        this.transactionService.addTransaction(
          this.newTx.description,
          amount,
          this.newTx.category,
          this.newTx.subCategory,
          this.newTx.categoryDetail,
          this.newTx.descriptionDetail,
          this.newTx.paymentMode,
          date
        ).subscribe(() => {
          this.closeModal();
        });
      }
    }
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id);
    }
  }

  toggleFilter(list: any, item: string) {
    list.update((current: string[]) => {
      if (current.includes(item)) return current.filter(i => i !== item);
      return [...current, item];
    });
  }

  // To help with template checking
  isFilterSelected(signalToCheck: any, item: string): boolean {
    return signalToCheck().includes(item);
  }

  // Row Selection Logic
  toggleSelection(id: string) {
    this.selectedTxIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  isRowSelected(id: string): boolean {
    return this.selectedTxIds().includes(id);
  }

  toggleAll(checked: boolean) {
    if (checked) {
      this.selectedTxIds.set(this.paginatedTransactions().map(t => t.id));
    } else {
      this.selectedTxIds.set([]);
    }
  }

  isAllSelected(): boolean {
    const currentPageIds = this.paginatedTransactions().map(t => t.id);
    return currentPageIds.length > 0 && currentPageIds.every(id => this.selectedTxIds().includes(id));
  }

  deleteSelected() {
    const idsToDelete = this.selectedTxIds();
    if (idsToDelete.length > 0 && confirm(`Are you sure you want to delete ${idsToDelete.length} transactions?`)) {
      idsToDelete.forEach(id => this.transactionService.deleteTransaction(id));
      this.selectedTxIds.set([]);
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    this.transactionService.uploadTransactions(file).subscribe({
      next: (res) => {
        alert('Import successful: ' + res);
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Import failed: ' + (err.error || err.message));
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      }
    });
  }
}
