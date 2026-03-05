import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    token = '';
    newPassword = '';
    confirmPassword = '';
    isSubmitting = signal(false);
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);
    message = signal('');
    isError = signal(false);

    toggleNewPasswordVisibility() {
        this.showNewPassword.update(v => !v);
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword.update(v => !v);
    }

    ngOnInit() {
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
        if (!this.token) {
            this.message.set('Invalid or missing reset token.');
            this.isError.set(true);
        }
    }

    onSubmit() {
        if (!this.token || !this.newPassword) return;

        if (this.newPassword !== this.confirmPassword) {
            this.message.set('Passwords do not match');
            this.isError.set(true);
            return;
        }

        this.isSubmitting.set(true);
        this.message.set('');

        this.authService.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
            next: () => {
                this.message.set('Password has been reset successfully! Redirecting to login...');
                this.isError.set(false);
                this.isSubmitting.set(false);
                setTimeout(() => this.router.navigate(['/login']), 2000);
            },
            error: (err) => {
                this.message.set(err.error?.message || 'Failed to reset password');
                this.isError.set(true);
                this.isSubmitting.set(false);
            }
        });
    }
}
