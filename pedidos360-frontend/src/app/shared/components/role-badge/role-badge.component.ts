import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="badgeClass" [class]="'badge-' + size">
      {{ role | uppercase }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-full);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    
    .badge-admin {
      background: rgba(99, 102, 241, 0.2);
      color: var(--color-secondary);
      border: var(--border-width) solid rgba(167, 139, 250, 0.3);
    }
    
    .badge-operador {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: var(--border-width) solid rgba(147, 197, 253, 0.3);
    }
    
    .badge-cliente {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      border: var(--border-width) solid rgba(110, 231, 183, 0.3);
    }
    
    .badge-default {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-muted);
      border: var(--border-width) solid var(--border-color);
    }
    
    .badge-sm {
      font-size: 0.625rem;
      padding: 0.15rem var(--spacing-xs);
    }
    
    .badge-lg {
      font-size: 0.875rem;
      padding: var(--spacing-sm) var(--spacing-md);
    }
  `]
})
export class RoleBadgeComponent {
  @Input() role = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  get badgeClass(): string {
    const normalized = this.role.toLowerCase();
    
    if (normalized === 'admin') return 'badge-admin';
    if (normalized === 'operador') return 'badge-operador';
    if (normalized === 'cliente') return 'badge-cliente';
    
    return 'badge-default';
  }
}
