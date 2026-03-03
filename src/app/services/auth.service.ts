import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { TransactionService } from './transaction.service';
import { PaymentModeService } from './payment-mode.service';
import { UserService } from './user.service';

export interface AuthResponse {
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private transactionService = inject(TransactionService);
    private paymentModeService = inject(PaymentModeService);
    private userService = inject(UserService);
    private apiUrl = '/api/auth';

    isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

    initializeData() {
        if (this.isAuthenticated()) {
            this.transactionService.fetchTransactions();
            this.paymentModeService.fetchPaymentModes();
            this.userService.fetchProfile();
        }
    }

    login(credentials: any) {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                this.isAuthenticated.set(true);
                this.transactionService.fetchTransactions();
                this.paymentModeService.fetchPaymentModes();
                this.userService.fetchProfile();
            })
        );
    }

    register(user: any) {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                this.isAuthenticated.set(true);
                this.transactionService.fetchTransactions();
                this.paymentModeService.fetchPaymentModes();
                this.userService.fetchProfile();
            })
        );
    }

    forgotPassword(data: { email?: string, mobileNumber?: string }) {
        return this.http.post(`${this.apiUrl}/forgot-password`, data);
    }

    verifyOtp(mobileNumber: string, otp: string) {
        return this.http.post<{ token: string }>(`${this.apiUrl}/verify-otp`, { mobileNumber, otp });
    }

    resetPassword(data: any) {
        return this.http.post(`${this.apiUrl}/reset-password`, data);
    }

    logout() {
        localStorage.removeItem('token');
        this.isAuthenticated.set(false);
        this.transactionService.clearData();
        this.paymentModeService.clearData();
        this.userService.clearProfile();
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}
