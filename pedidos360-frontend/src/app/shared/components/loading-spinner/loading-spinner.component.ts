import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div *ngIf="overlay" class="spinner-overlay">
      <div class="spinner" [class]="'spinner-' + size + ' spinner-' + variant"></div>
    </div>
    <div *ngIf="!overlay" class="spinner" [class]="'spinner-' + size + ' spinner-' + variant"></div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal, 9999);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .spinner {
      border-radius: var(--radius-full);
      border-style: solid;
      animation: spin 0.9s linear infinite;
    }
    
    .spinner-sm {
      width: 24px;
      height: 24px;
      border-width: 3px;
    }
    
    .spinner-md {
      width: 40px;
      height: 40px;
      border-width: 4px;
    }
    
    .spinner-lg {
      width: 64px;
      height: 64px;
      border-width: 5px;
    }
    
    .spinner-primary {
      border-color: rgba(99, 102, 241, 0.2);
      border-top-color: var(--color-primary);
    }
    
    .spinner-white {
      border-color: rgba(255, 255, 255, 0.2);
      border-top-color: white;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'primary' | 'white' = 'primary';
  @Input() overlay = false;
}
