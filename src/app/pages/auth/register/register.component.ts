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

    email = '';
    password = '';
    confirmPassword = '';
    mobileNumber = '+91 ';
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

        this.authService.register({ email: this.email, password: this.password, mobileNumber: this.mobileNumber }).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                if (err.status === 0) {
                    this.error = 'Cannot connect to server. Please check if backend is running.';
                } else {
                    this.error = 'Registration failed. Email might already be in use or server error.';
                }
                this.loading = false;
            }
        });
    }
}
