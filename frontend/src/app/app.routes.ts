import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { guestGuard } from './services/guest.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { SummaryComponent } from './pages/summary/summary.component';
import { PaymentModesComponent } from './pages/payment-modes/payment-modes.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'auth',
        canActivate: [guestGuard],
        children: [
            { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
            { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
            { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) }
        ]
    },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
    { path: 'summary', component: SummaryComponent, canActivate: [authGuard] },
    { path: 'payment-modes', component: PaymentModesComponent, canActivate: [authGuard] },
    { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: 'about', component: AboutComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];

