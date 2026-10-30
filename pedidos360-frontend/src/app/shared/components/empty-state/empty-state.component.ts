import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="glass-card empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <button 
        *ngIf="actionLabel" 
        class="btn btn-primary"
        (click)="onAction()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-2xl);
      min-height: 300px;
    }
    
    .empty-icon {
      font-size: 4rem;
      opacity: 0.3;
      margin-bottom: var(--spacing-lg);
    }
    
    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 var(--spacing-sm) 0;
    }
    
    .empty-message {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0 0 var(--spacing-xl) 0;
      max-width: 400px;
    }
    
    .btn {
      margin-top: var(--spacing-md);
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No hay datos';
  @Input() message = 'No se encontraron resultados para mostrar';
  @Input() icon = '📭';
  @Input() actionLabel = '';
  @Output() actionClick = new EventEmitter<void>();
  
  onAction(): void {
    this.actionClick.emit();
  }
}
