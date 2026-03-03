import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface UserProfile {
    email: string;
    fullName: string;
    profileImage: string;
}

const PROFILE_CACHE_KEY = 'userProfile';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = '/api/profile';

    // Initialize from localStorage cache for zero-flash on refresh
    currentUserProfile = signal<UserProfile | null>(this.loadFromCache());



    fetchProfile() {
        return this.http.get<UserProfile>(this.apiUrl).pipe(
            tap(profile => {
                this.currentUserProfile.set(profile);
                this.saveToCache(profile);
            })
        ).subscribe();
    }

    updateProfile(profile: Partial<UserProfile>) {
        return this.http.put<UserProfile>(this.apiUrl, profile).pipe(
            tap(updatedProfile => {
                this.currentUserProfile.set(updatedProfile);
                this.saveToCache(updatedProfile);
            })
        );
    }

    clearProfile() {
        this.currentUserProfile.set(null);
        localStorage.removeItem(PROFILE_CACHE_KEY);
    }

    private saveToCache(profile: UserProfile) {
        try {
            localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
        } catch { }
    }

    private loadFromCache(): UserProfile | null {
        try {
            const cached = localStorage.getItem(PROFILE_CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }
}
