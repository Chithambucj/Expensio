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
    isSubmitting = signal(false);
    message = signal('');
    isError = signal(false);

    onSubmit() {
        if (!this.email) return;

        this.isSubmitting.set(true);
        this.message.set('');

        this.authService.forgotPassword({ email: this.email }).subscribe({
            next: () => {
                this.message.set('Password reset instructions have been sent to your email');
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
}
