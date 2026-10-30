import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" class="error-container" [class]="'error-' + type">
      <span class="error-icon">{{ icon }}</span>
      <span class="error-text">{{ message }}</span>
      <button *ngIf="dismissible" class="error-close" (click)="onDismiss()">✕</button>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-md);
      border: var(--border-width) solid;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: var(--spacing-md);
    }
    
    .error-error {
      background: rgba(239, 68, 68, 0.15);
      color: var(--color-danger);
      border-color: var(--color-danger);
    }
    
    .error-warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--color-warning);
      border-color: var(--color-warning);
    }
    
    .error-info {
      background: rgba(59, 130, 246, 0.15);
      color: var(--color-info);
      border-color: var(--color-info);
    }
    
    .error-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    
    .error-text {
      flex: 1;
    }
    
    .error-close {
      background: transparent;
      border: none;
      color: currentColor;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
      flex-shrink: 0;
    }
    
    .error-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() dismissible = true;
  @Output() dismissed = new EventEmitter<void>();
  
  get icon(): string {
    switch (this.type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  }
  
  onDismiss(): void {
    this.dismissed.emit();
  }
}
