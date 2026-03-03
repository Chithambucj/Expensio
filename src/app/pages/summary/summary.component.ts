import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TransactionService } from '../../services/transaction.service';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { PaymentModeService } from '../../services/payment-mode.service';
import { OnInit } from '@angular/core';

@Component({
    selector: 'app-summary',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, NgxDaterangepickerMd],
    templateUrl: './summary.component.html',
    styleUrl: './summary.component.css'
})
export class SummaryComponent implements OnInit {
    transactionService = inject(TransactionService);
    paymentModeService = inject(PaymentModeService);

    viewMode = signal<'monthly' | 'yearly'>('monthly');
    selectedYear = signal(dayjs().year());
    sortColumn = signal<string | null>(null);
    sortDirection = signal<'asc' | 'desc' | null>(null);

    // Modal & Filter State
    isFilterOpen = signal(false);

    selectedCategoryFilters = signal<string[]>([]);
    selectedTypeFilters = signal<string[]>(['expense']);
    selectedPaymentFilters = signal<string[]>([]);
    minAmount = signal<number | null>(null);
    maxAmount = signal<number | null>(null);

    paymentModes = computed(() => {
        const backendModes = this.paymentModeService.paymentModes().map(m => m.name);
        // Default modes as per user implementation plus backend modes
        const defaults = ['Rubyx MC', 'Regalia', 'Amzn', 'HDFC-Debit', 'Rupay', 'ICICI-Debit', 'Cash', 'Yes', 'E-Wallet', 'AMEX', 'Coral'];
        return [...new Set([...defaults, ...backendModes])];
    });

    ngOnInit() {
        this.transactionService.fetchTransactions();
        this.paymentModeService.fetchPaymentModes();
    }

    // Available categories for the grid as per user image
    categories = signal([
        'Food & Grocery',
        'Household Expense',
        'Travel',
        'Beauty, Health & Fitness',
        'Shopping',
        'Finance',
        'Entertainment'
    ]);

    // Monthly Data structure: Array of { month: string, totals: { [category: string]: number } }
    monthlySummary = computed(() => {
        const txs = this.transactionService.transactions();
        const year = this.selectedYear();

        const categories = this.selectedCategoryFilters();
        const types = this.selectedTypeFilters();
        const payments = this.selectedPaymentFilters();
        const min = this.minAmount();
        const max = this.maxAmount();

        // Filter by year, expense only, and applied filters
        const expenses = txs.filter((t: any) => {
            const matchesYear = dayjs(t.date).year() === year;
            const matchesType = t.type === 'expense'; // Summary grid usually shows expenses
            const matchesCategory = categories.length === 0 || categories.includes(t.category);
            const matchesTypeFilter = types.includes(t.type);
            const matchesPayment = payments.length === 0 || payments.includes(t.paymentMode);
            const absAmount = Math.abs(t.amount);
            const matchesMin = min === null || absAmount >= min;
            const matchesMax = max === null || absAmount <= max;

            return matchesYear && matchesType && matchesCategory && matchesTypeFilter && matchesPayment && matchesMin && matchesMax;
        });

        const summaryMap = new Map<string, { [cat: string]: number }>();

        // Initialize months
        for (let i = 0; i < 12; i++) {
            const monthKey = dayjs().year(year).month(i).format('MM/YY');
            summaryMap.set(monthKey, {});
        }

        expenses.forEach(t => {
            const monthKey = dayjs(t.date).format('MM/YY');
            if (summaryMap.has(monthKey)) {
                const monthObj = summaryMap.get(monthKey)!;
                monthObj[t.category] = (monthObj[t.category] || 0) + Math.abs(t.amount);
            }
        });

        let result = Array.from(summaryMap.entries()).map(([month, totals]) => ({
            month,
            totals,
            total: Object.values(totals).reduce((a, b) => a + b, 0)
        })).reverse(); // Show latest months first or as per image order

        const sortCol = this.sortColumn();
        const sortDir = this.sortDirection();

        if (sortCol && sortDir) {
            result.sort((a, b) => {
                const valA = a.totals[sortCol] || 0;
                const valB = b.totals[sortCol] || 0;
                return sortDir === 'asc' ? valA - valB : valB - valA;
            });
        }

        return result;
    });


    // Yearly Data
    yearlySummary = computed(() => {
        const txs = this.transactionService.transactions();
        const categories = this.selectedCategoryFilters();
        const types = this.selectedTypeFilters();
        const payments = this.selectedPaymentFilters();
        const min = this.minAmount();
        const max = this.maxAmount();

        const expenses = txs.filter((t: any) => {
            const matchesType = t.type === 'expense';
            const matchesCategory = categories.length === 0 || categories.includes(t.category);
            const matchesTypeFilter = types.includes(t.type);
            const matchesPayment = payments.length === 0 || payments.includes(t.paymentMode);
            const absAmount = Math.abs(t.amount);
            const matchesMin = min === null || absAmount >= min;
            const matchesMax = max === null || absAmount <= max;

            return matchesType && matchesCategory && matchesTypeFilter && matchesPayment && matchesMin && matchesMax;
        });

        const summaryMap = new Map<number, { [cat: string]: number }>();

        expenses.forEach(t => {
            const year = dayjs(t.date).year();
            if (!summaryMap.has(year)) {
                summaryMap.set(year, {});
            }
            const yearObj = summaryMap.get(year)!;
            yearObj[t.category] = (yearObj[t.category] || 0) + Math.abs(t.amount);
        });

        let result = Array.from(summaryMap.entries()).map(([year, totals]) => ({
            year,
            totals,
            total: Object.values(totals).reduce((a, b) => a + b, 0)
        })).sort((a, b) => b.year - a.year);

        const sortCol = this.sortColumn();
        const sortDir = this.sortDirection();

        if (sortCol && sortDir) {
            result.sort((a, b) => {
                const valA = a.totals[sortCol] || 0;
                const valB = b.totals[sortCol] || 0;
                return sortDir === 'asc' ? valA - valB : valB - valA;
            });
        }

        return result;
    });

    toggleSort(column: string) {
        if (this.sortColumn() === column) {
            if (this.sortDirection() === 'asc') {
                this.sortDirection.set('desc');
            } else if (this.sortDirection() === 'desc') {
                this.sortColumn.set(null);
                this.sortDirection.set(null);
            } else {
                this.sortDirection.set('asc');
            }
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
    }

    getCategoryTotal(totals: { [cat: string]: number }, cat: string): number {
        return totals[cat] || 0;
    }

    changeYear(delta: number) {
        this.selectedYear.update(y => y + delta);
    }

    toggleFilterPopup() {
        this.isFilterOpen.update(v => !v);
    }

    closeFilterPopup() {
        this.isFilterOpen.set(false);
    }

    toggleFilter(list: any, item: string) {
        list.update((current: string[]) => {
            if (current.includes(item)) return current.filter((i: any) => i !== item);
            return [...current, item];
        });
    }

    isFilterSelected(signalToCheck: any, item: string): boolean {
        return signalToCheck().includes(item);
    }

    downloadPDF() {
        const doc = new jsPDF('landscape');
        const isMonthly = this.viewMode() === 'monthly';
        const title = isMonthly ? `Monthly Summary Report - ${this.selectedYear()}` : 'Yearly Summary Report';
        const fileName = isMonthly ? `monthly_summary_${this.selectedYear()}.pdf` : 'yearly_summary.pdf';

        doc.setFontSize(18);
        doc.text(title, 14, 20);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${dayjs().format('MMMM D, YYYY HH:mm')}`, 14, 28);

        const cats = this.categories();
        const head = [
            [
                isMonthly ? 'Month' : 'Year',
                ...cats,
                'Total'
            ]
        ];

        const data = isMonthly
            ? this.monthlySummary().map(row => [
                row.month,
                ...cats.map(cat => row.totals[cat] ? row.totals[cat].toLocaleString() : '0'),
                row.total.toLocaleString()
            ])
            : this.yearlySummary().map(row => [
                row.year.toString(),
                ...cats.map(cat => row.totals[cat] ? row.totals[cat].toLocaleString() : '0'),
                row.total.toLocaleString()
            ]);

        autoTable(doc, {
            head: head,
            body: data,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [67, 24, 255], textColor: 255 },
            styles: { fontSize: 9, halign: 'center' },
            columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } }
        });

        doc.save(fileName);
    }
}
