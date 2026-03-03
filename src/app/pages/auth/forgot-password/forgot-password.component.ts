import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    email = '';
    mobileNumber = '';
    otp = '';
    recoveryMode = signal<'email' | 'mobile'>('email');
    step = signal<'request' | 'verify'>('request');
    isSubmitting = signal(false);
    message = signal('');
    isError = signal(false);

    setMode(mode: 'email' | 'mobile') {
        this.recoveryMode.set(mode);
        this.message.set('');
        this.step.set('request');
    }

    onSubmit() {
        if (this.recoveryMode() === 'email' && !this.email) return;
        if (this.recoveryMode() === 'mobile' && !this.mobileNumber) return;

        this.isSubmitting.set(true);
        this.message.set('');

        const request = this.recoveryMode() === 'email'
            ? { email: this.email }
            : { mobileNumber: this.mobileNumber };

        this.authService.forgotPassword(request).subscribe({
            next: () => {
                if (this.recoveryMode() === 'email') {
                    this.message.set('Password reset instructions have been sent to your email');
                } else {
                    this.message.set('OTP has been sent to your mobile number');
                    this.step.set('verify');
                }
                this.isError.set(false);
                this.isSubmitting.set(false);
            },
            error: (err) => {
                this.message.set(err.error?.message || 'Failed to send reset request');
                this.isError.set(true);
                this.isSubmitting.set(false);
            }
        });
    }

    onVerifyOtp() {
        if (!this.otp) return;

        this.isSubmitting.set(true);
        this.message.set('');

        this.authService.verifyOtp(this.mobileNumber, this.otp).subscribe({
            next: (res) => {
                this.message.set('OTP verified! Redirecting to reset password...');
                this.isError.set(false);
                this.isSubmitting.set(false);
                setTimeout(() => {
                    this.router.navigate(['/auth/reset-password'], { queryParams: { token: res.token } });
                }, 1500);
            },
            error: (err) => {
                this.message.set(err.error?.message || 'Invalid OTP');
                this.isError.set(true);
                this.isSubmitting.set(false);
            }
        });
    }
}
