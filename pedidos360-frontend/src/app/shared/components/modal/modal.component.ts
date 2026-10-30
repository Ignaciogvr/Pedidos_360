import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onBackdropClick()">
      <div 
        class="modal" 
        [class]="'modal-' + size" 
        (click)="$event.stopPropagation()">
        <div class="modal-header">
          <ng-content select="[modalHeader]"></ng-content>
          <button 
            *ngIf="showCloseButton" 
            class="modal-close" 
            (click)="close()"
            aria-label="Cerrar">✕</button>
        </div>
        <div class="modal-body">
          <ng-content select="[modalBody]"></ng-content>
          <ng-content></ng-content>
        </div>
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[modalFooter]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(5px);
      z-index: var(--z-modal-backdrop, 1000);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-md);
    }
    
    .modal {
      background: var(--bg-card);
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--radius-xl);
      width: 100%;
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      max-height: 90vh;
      overflow-y: auto;
      z-index: var(--z-modal, 1001);
    }
    
    .modal-sm { max-width: 400px; }
    .modal-md { max-width: 600px; }
    .modal-lg { max-width: 800px; }
    .modal-xl { max-width: 1000px; }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-md);
    }
    
    .modal-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      padding: var(--spacing-xs);
      transition: color var(--transition-fast);
      line-height: 1;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
    }
    
    .modal-close:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }
    
    .modal-body {
      flex: 1;
      overflow-y: auto;
    }
    
    .modal-footer {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      border-top: var(--border-width) solid var(--border-color);
      padding-top: var(--spacing-md);
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdrop = true;
  @Input() showCloseButton = true;
  @Input() showFooter = false;
  @Output() onClose = new EventEmitter<void>();

  close(): void {
    this.onClose.emit();
  }
  
  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
}
