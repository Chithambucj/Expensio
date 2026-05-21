import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    isSidebarOpen = signal(false);

    toggleSidebar(): void {
        this.isSidebarOpen.update(state => !state);
    }

    closeSidebar(): void {
        this.isSidebarOpen.set(false);
    }
}
