import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService, ThemeType, ThemeConfig } from '../../services/theme.service';
import { SidebarService } from '../../services/sidebar.service';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  userService = inject(UserService);

  isProfileMenuOpen = signal(false);
  isThemeMenuOpen = signal(false);
  isMobileNavOpen = signal(false);

  // Expose themes for the template
  themes = this.themeService.themes;
  currentTheme = this.themeService.currentTheme;
  themeKeys = Object.keys(this.themeService.themes) as ThemeType[];

  getTheme(key: string): ThemeConfig {
    return this.themes[key as ThemeType];
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen.update(isOpen => !isOpen);
  }

  closeMobileNav(): void {
    this.isMobileNavOpen.set(false);
  }

  toggleThemeMenu(): void {
    this.isThemeMenuOpen.update(isOpen => !isOpen);
  }

  setTheme(theme: string): void {
    this.themeService.setTheme(theme as ThemeType);
    this.isThemeMenuOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(isOpen => !isOpen);
  }

  signOut(): void {
    this.authService.logout();
    this.isProfileMenuOpen.set(false);
  }
}
