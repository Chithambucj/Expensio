import { Injectable, signal, effect } from '@angular/core';

export type ThemeType = 'light' | 'dark' | 'navy' | 'emerald' | 'purple' | 'amber' | 'magenta';

export interface ThemeConfig {
    name: string;
    type: ThemeType;
    colors: {
        bg: string;
        surface: string;
        text: string;
        textDim: string;
        primary: string; // Dynamic Primary Color
        primaryLight: string;
        border: string;
        glassBorder: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    themes: Record<ThemeType, ThemeConfig> = {
        light: {
            name: 'Royal Blue (Light)',
            type: 'light',
            colors: {
                bg: '#f5f7fa',
                surface: '#ffffff',
                text: '#2b3674',
                textDim: '#a3aed0',
                primary: '#4318ff', // Royal Blue
                primaryLight: '#eff4fb',
                border: '#e2e8f0',
                glassBorder: 'rgba(255, 255, 255, 0.5)'
            }
        },
        dark: {
            name: 'Midnight (Dark)',
            type: 'dark',
            colors: {
                bg: '#0f172a',
                surface: '#1e293b',
                text: '#f8fafc',
                textDim: '#94a3b8',
                primary: '#4318ff', // Royal Blue (consistent with dark mode)
                primaryLight: '#1e293b',
                border: '#334155',
                glassBorder: 'rgba(255, 255, 255, 0.1)'
            }
        },
        navy: {
            name: 'Navy Blue (Dark)',
            type: 'navy',
            colors: {
                bg: '#1a252e',
                surface: '#2b3c47',
                text: '#ffffff',
                textDim: '#cbd5e1',
                primary: '#4318ff', // Royal Blue
                primaryLight: '#2b3c47',
                border: 'rgba(255, 255, 255, 0.08)',
                glassBorder: 'rgba(255, 255, 255, 0.1)'
            }
        },
        emerald: {
            name: 'Emerald Forest (Light)',
            type: 'emerald',
            colors: {
                bg: '#f0fdf4', // Emerald 50
                surface: '#ffffff',
                text: '#064e3b', // Emerald 900
                textDim: '#059669', // Emerald 600
                primary: '#10b981', // Emerald 500
                primaryLight: '#ecfdf5', // Emerald 50
                border: '#d1fae5', // Emerald 100
                glassBorder: 'rgba(16, 185, 129, 0.1)'
            }
        },
        purple: {
            name: 'Deep Purple (Light)',
            type: 'purple',
            colors: {
                bg: '#f5f3ff', // Violet 50
                surface: '#ffffff',
                text: '#4c1d95', // Violet 900
                textDim: '#7c3aed', // Violet 600
                primary: '#8b5cf6', // Violet 500
                primaryLight: '#ede9fe', // Violet 100
                border: '#ddd6fe', // Violet 200
                glassBorder: 'rgba(139, 92, 246, 0.1)'
            }
        },
        amber: {
            name: 'Sunset Amber (Light)',
            type: 'amber',
            colors: {
                bg: '#fffbeb', // Amber 50
                surface: '#ffffff',
                text: '#78350f', // Amber 900
                textDim: '#d97706', // Amber 600
                primary: '#f59e0b', // Amber 500
                primaryLight: '#fef3c7', // Amber 100
                border: '#fde68a', // Amber 200
                glassBorder: 'rgba(245, 158, 11, 0.1)'
            }
        },
        magenta: {
            name: 'Magenta (Light)',
            type: 'magenta',
            colors: {
                bg: '#fdf4ff', // Fuchsia 50
                surface: '#ffffff',
                text: '#701a75', // Fuchsia 900
                textDim: '#e2327cff', // Fuchsia 600
                primary: '#ff5f82ff', // Fuchsia 500
                primaryLight: '#fae8ff', // Fuchsia 100
                border: '#f5d0fe', // Fuchsia 200
                glassBorder: 'rgba(217, 70, 239, 0.1)'
            }
        }
    };

    currentTheme = signal<ThemeType>(this.loadThemePreference());

    constructor() {
        effect(() => {
            this.applyTheme(this.currentTheme());
        });
    }

    setTheme(theme: ThemeType): void {
        this.currentTheme.set(theme);
        this.saveThemePreference(theme);
    }

    private applyTheme(themeType: ThemeType): void {
        const theme = this.themes[themeType];
        const root = document.documentElement;

        for (const [key, value] of Object.entries(theme.colors)) {
            const cssVar = `--color-${this.camelToKebab(key)}`;
            root.style.setProperty(cssVar, value);
        }

        // Only Dark and Navy are true dark modes now
        if (['dark', 'navy'].includes(themeType)) {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }
    }

    private camelToKebab(str: string): string {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    private loadThemePreference(): ThemeType {
        const saved = localStorage.getItem('theme-preference') as ThemeType;
        if (saved && this.themes[saved]) {
            return saved;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    private saveThemePreference(theme: ThemeType): void {
        localStorage.setItem('theme-preference', theme);
    }
}
