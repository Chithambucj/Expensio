import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { PaymentMode } from '../models/payment-mode.model';

@Injectable({
    providedIn: 'root'
})
export class PaymentModeService {
    private http = inject(HttpClient);
    private apiUrl = '/api/payment-modes';

    private paymentModesSignal = signal<PaymentMode[]>([]);
    paymentModes = this.paymentModesSignal.asReadonly();



    public fetchPaymentModes() {
        this.http.get<PaymentMode[]>(this.apiUrl).subscribe(modes => {
            this.paymentModesSignal.set(modes);
        });
    }

    clearData() {
        this.paymentModesSignal.set([]);
    }

    addPaymentMode(paymentMode: PaymentMode): Observable<PaymentMode> {
        return this.http.post<PaymentMode>(this.apiUrl, paymentMode).pipe(
            tap(newMode => {
                this.paymentModesSignal.update(current => [...current, newMode]);
            })
        );
    }

    updatePaymentMode(id: string, paymentMode: PaymentMode): Observable<PaymentMode> {
        return this.http.put<PaymentMode>(`${this.apiUrl}/${id}`, paymentMode).pipe(
            tap(updated => {
                this.paymentModesSignal.update(current =>
                    current.map(m => m.id === updated.id ? updated : m)
                );
            })
        );
    }

    deletePaymentMode(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.paymentModesSignal.update(current => current.filter(m => m.id !== id));
            })
        );
    }
}
