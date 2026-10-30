import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TokenClaim {
  key: string;
  value: string;
  category?: string;
}

@Component({
  selector: 'app-token-display',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="glass-card token-card">
      <div class="token-header">
        <h3 class="token-title">{{ title }}</h3>
        <span class="token-badge">ID Token</span>
      </div>
      
      <div *ngIf="claims && claims.length > 0" class="token-grid">
        <div class="token-row" *ngFor="let claim of claims">
          <span class="token-key">{{ claim.key }}</span>
          <span class="token-value">{{ claim.value }}</span>
        </div>
      </div>
      
      <div *ngIf="!claims || claims.length === 0" class="empty-state">
        <span>No hay información de token disponible</span>
      </div>
    </div>
  `,
  styles: [`
    .token-card {
      width: 100%;
    }
    
    .token-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
    }
    
    .token-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-secondary);
      margin: 0;
    }
    
    .token-badge {
      background: rgba(99, 102, 241, 0.2);
      color: var(--color-secondary);
      border: var(--border-width) solid rgba(139, 92, 246, 0.3);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-full);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    
    .token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-sm);
    }
    
    .token-row {
      display: flex;
      gap: var(--spacing-sm);
      align-items: flex-start;
      background: rgba(255, 255, 255, 0.03);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
    }
    
    .token-key {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-primary);
      min-width: 120px;
      flex-shrink: 0;
      font-family: monospace;
    }
    
    .token-value {
      font-size: 0.82rem;
      color: var(--text-muted);
      word-break: break-all;
      font-family: monospace;
    }
    
    .empty-state {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .token-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TokenDisplayComponent {
  @Input() claims: TokenClaim[] = [];
  @Input() title = '🔐 Claims del Token JWT (Azure)';
}
