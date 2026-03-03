import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="page-container animate-fade-in">
      <header class="page-header">
        <h1>About</h1>
        <p class="subtitle">Project Information</p>
      </header>

      <div class="glass-panel content">
        <h3>Expense Tracker Pro</h3>
        <p>A modern, lightweight expense tracking application built with Angular.</p>
        <p>Version: 24.0.4</p>
      </div>
    </div>
  `,
  styles: [`
    .content { padding: 2rem; }
    h3 { margin-bottom: 1rem; color: var(--color-primary); }
    p { margin-bottom: 0.5rem; color: var(--color-text-dim); }
  `]
})
export class AboutComponent { }
