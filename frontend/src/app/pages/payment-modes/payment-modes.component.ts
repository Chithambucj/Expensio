import { LucideAngularModule } from 'lucide-angular';
import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMode } from '../../models/payment-mode.model';
import { PaymentModeService } from '../../services/payment-mode.service';
import { TransactionService } from '../../services/transaction.service';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import dayjs, { Dayjs } from 'dayjs';

@Component({
    selector: 'app-payment-modes',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, NgxDaterangepickerMd],
    templateUrl: './payment-modes.component.html',
    styleUrls: ['./payment-modes.component.css']
})
export class PaymentModesComponent implements OnInit {
    paymentModeService = inject(PaymentModeService);
    transactionService = inject(TransactionService);
    paymentModes = this.paymentModeService.paymentModes;

    isModalOpen = signal(false);
    editingMode = signal(false);
    currentMode: PaymentMode = { name: '', type: '' };

    // Date Range Filter
    filterRange = signal<{ startDate: Dayjs, endDate: Dayjs }>({
        startDate: dayjs().startOf('month'),
        endDate: dayjs().endOf('month')
    });

    ranges: any = {
        'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
        'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
        'This Year': [dayjs().startOf('year'), dayjs().endOf('year')],
        'All Time': [dayjs('2020-01-01'), dayjs().endOf('year')]
    };

    // Sorting State
    sortColumn = signal<string>('amount');
    sortDirection = signal<'asc' | 'desc'>('desc');

    toggleSort(column: string) {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
    }

    paymentModeUsage = computed(() => {
        const txs = this.transactionService.transactions();
        const range = this.filterRange();
        const rangeStart = range.startDate;
        const rangeEnd = range.endDate;
        const usageMap: { [key: string]: number } = {};
        let total = 0;

        txs.forEach((t: any) => {
            if (t.type === 'expense') {
                const txDate = dayjs(t.date);
                if (txDate.isAfter(rangeStart.subtract(1, 'day')) && txDate.isBefore(rangeEnd.add(1, 'day'))) {
                    const mode = t.paymentMode || 'Unknown';
                    const amount = Math.abs(t.amount);
                    usageMap[mode] = (usageMap[mode] || 0) + amount;
                    total += amount;
                }
            }
        });

        const usageData = Object.keys(usageMap).map(mode => ({
            mode,
            amount: usageMap[mode],
            percentage: total > 0 ? (usageMap[mode] / total) * 100 : 0
        }));

        return usageData.sort((a, b) => {
            const col = this.sortColumn();
            const dir = this.sortDirection() === 'asc' ? 1 : -1;

            let valA: any;
            let valB: any;

            if (col === 'mode') {
                valA = a.mode.toLowerCase();
                valB = b.mode.toLowerCase();
            } else if (col === 'amount') {
                valA = a.amount;
                valB = b.amount;
            } else if (col === 'percentage') {
                valA = a.percentage;
                valB = b.percentage;
            }

            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
            return 0;
        });
    });

    // Helper to convert Dayjs to Date for Angular pipes
    toDate(d: Dayjs | any): Date | null {
        return d ? (dayjs.isDayjs(d) ? d.toDate() : new Date(d)) : null;
    }

    constructor() { }

    ngOnInit(): void {
        this.paymentModeService.fetchPaymentModes();
        this.transactionService.fetchTransactions();
    }

    loadPaymentModes(): void {
        // Redundant with signals
    }

    openAddModal(): void {
        this.editingMode.set(false);
        this.currentMode = { name: '', type: '' };
        this.isModalOpen.set(true);
    }

    openEditModal(mode: PaymentMode): void {
        this.editingMode.set(true);
        this.currentMode = { ...mode };
        this.isModalOpen.set(true);
    }

    closeModal(): void {
        this.isModalOpen.set(false);
    }

    savePaymentMode(): void {
        if (this.editingMode() && this.currentMode.id) {
            this.paymentModeService.updatePaymentMode(this.currentMode.id, this.currentMode).subscribe(() => {
                this.closeModal();
            });
        } else {
            this.paymentModeService.addPaymentMode(this.currentMode).subscribe(() => {
                this.closeModal();
            });
        }
    }

    deletePaymentMode(id: string): void {
        if (confirm('Are you sure you want to delete this payment mode?')) {
            this.paymentModeService.deletePaymentMode(id).subscribe();
        }
    }
}
