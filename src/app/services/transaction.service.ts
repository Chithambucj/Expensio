import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../models/transaction.model';
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private http = inject(HttpClient);
    private apiUrl = '/api/transactions';

    // Core Signal
    private transactionsSignal = signal<Transaction[]>([]);

    // Public Read-only Signal
    transactions = this.transactionsSignal.asReadonly();

    // Computed Stats
    totalExpense = computed(() =>
        this.transactionsSignal()
            .reduce((acc, t) => acc + Math.abs(t.amount), 0)
    );



    public fetchTransactions() {
        this.http.get<Transaction[]>(this.apiUrl).subscribe(data => {
            this.transactionsSignal.set(data);
        });
    }

    clearData() {
        this.transactionsSignal.set([]);
    }

    addTransaction(description: string, amount: number, category: string, subCategory: string, categoryDetail: string, descriptionDetail: string, paymentMode: any, date: string) {
        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            description,
            subCategory,
            categoryDetail,
            descriptionDetail,
            amount,
            category,
            paymentMode,
            date: date || new Date().toISOString(),
            type: 'expense'
        };

        return this.http.post<Transaction>(this.apiUrl, newTransaction).pipe(
            tap(() => {
                this.fetchTransactions();
            })
        );
    }

    updateTransaction(transaction: Transaction) {
        return this.http.put<Transaction>(`${this.apiUrl}/${transaction.id}`, transaction).pipe(
            tap(() => {
                this.fetchTransactions();
            })
        );
    }

    deleteTransaction(id: string) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
            this.fetchTransactions();
        });
    }

    uploadTransactions(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/upload`, formData, { responseType: 'text' }).pipe(
            tap(() => {
                this.fetchTransactions();
            })
        );
    }
}
