import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  template: `
    @if (authService.isAuthenticated()) {
      <app-header></app-header>
      <div class="layout-container">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
})
export class AppComponent {
  authService = inject(AuthService);

  ngOnInit() {
    // Small delay to ensure all services are ready and interceptor is in place
    setTimeout(() => {
      this.authService.initializeData();
    }, 0);
  }
}
