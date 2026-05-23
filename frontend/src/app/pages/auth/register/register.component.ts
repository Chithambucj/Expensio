import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    authService = inject(AuthService);
    router = inject(Router);

    fullName = '';
    email = '';
    password = '';
    confirmPassword = '';
    showPassword = false;
    showConfirmPassword = false;
    error = '';
    loading = false;

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.error = 'Passwords do not match';
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.register({
            fullName: this.fullName,
            email: this.email,
            password: this.password
        }).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                if (err.status === 0) {
                    this.error = 'Cannot connect to server. Please check if backend is running.';
                } else {
                    let errMsg = 'Registration failed. Please try again.';
                    if (err.error) {
                        if (typeof err.error === 'string') errMsg = err.error;
                        else if (err.error.message) errMsg = err.error.message;
                        else errMsg = JSON.stringify(err.error);
                    } else if (err.message) {
                        errMsg = err.message;
                    }
                    this.error = errMsg;
                }
                this.loading = false;
            }
        });
    }
}
