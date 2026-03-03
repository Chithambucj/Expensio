import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent {
    userService = inject(UserService);

    profileData = {
        fullName: '',
        email: '',
        profileImage: ''
    };

    isUploading = signal(false);
    isSaving = signal(false);
    saveSuccess = signal(false);
    saveError = signal(false);

    constructor() {
        // React to profile signal changes — keeps the form in sync even if data loads after init
        effect(() => {
            const current = this.userService.currentUserProfile();
            if (current) {
                this.profileData = { ...current };
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            this.isUploading.set(true);
            reader.onload = (e: any) => {
                this.profileData.profileImage = e.target.result;
                this.isUploading.set(false);
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        this.isSaving.set(true);
        this.saveSuccess.set(false);
        this.saveError.set(false);

        this.userService.updateProfile({
            fullName: this.profileData.fullName,
            profileImage: this.profileData.profileImage
        }).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.saveSuccess.set(true);
                // Auto-hide success message after 3 seconds
                setTimeout(() => this.saveSuccess.set(false), 3000);
            },
            error: (err) => {
                this.isSaving.set(false);
                this.saveError.set(true);
                console.error(err);
            }
        });
    }
}
