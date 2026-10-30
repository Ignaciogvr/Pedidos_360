import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="glass-card stat-card" [class]="'stat-' + variant">
      <div *ngIf="loading" class="skeleton-loader"></div>
      <ng-container *ngIf="!loading">
        <div class="stat-icon">{{ icon }}</div>
        <div class="stat-info">
          <span class="stat-label">{{ title }}</span>
          <span class="stat-number">{{ value }}</span>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      min-height: 100px;
    }
    
    .stat-icon {
      font-size: 2.2rem;
    }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: var(--spacing-xs);
    }
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
    }
    
    .stat-default .stat-number { color: var(--text-main); }
    .stat-primary .stat-number { color: var(--color-primary); }
    .stat-success .stat-number { color: var(--color-success); }
    .stat-warning .stat-number { color: var(--color-warning); }
    .stat-danger .stat-number { color: var(--color-danger); }
    
    .skeleton-loader {
      width: 100%;
      height: 60px;
      background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-md);
    }
    
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() icon = '📊';
  @Input() variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
  @Input() loading = false;
}
