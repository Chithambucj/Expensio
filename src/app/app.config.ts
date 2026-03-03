import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {
  LucideAngularModule,
  IndianRupee,
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Info,
  Search,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Calendar,
  X,
  ShoppingBag,
  Car,
  Home,
  Shirt,
  GraduationCap,
  DollarSign,
  Circle,
  PieChart,
  Receipt,
  Pencil,
  CreditCard,
  QrCode,
  Banknote,
  ChevronDown,
  Lock,
  Mail,
  User
} from 'lucide-angular';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(LucideAngularModule.pick({
      IndianRupee, Wallet, LayoutDashboard, ArrowLeftRight, Info,
      Search, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
      SlidersHorizontal, Calendar, X, ShoppingBag, Car, Home, Shirt, GraduationCap, DollarSign, Circle, PieChart,
      Receipt, Pencil, CreditCard, QrCode, Banknote, ChevronDown, Lock, Mail, User
    })),
    importProvidersFrom(NgxDaterangepickerMd.forRoot())
  ]
};
