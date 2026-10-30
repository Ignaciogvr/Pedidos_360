import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  stockMax: number;
}

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>🛒 Tu Carrito</h3>
          <button class="modal-close" (click)="close()">✕</button>
        </div>

        <!-- Carrito vacío -->
        <div class="cart-empty" *ngIf="items.length === 0">
          <span>🛒</span>
          <p>Tu carrito está vacío</p>
        </div>

        <!-- Items del carrito -->
        <div class="cart-items" *ngIf="items.length > 0">
          <div class="cart-item" *ngFor="let item of items">
            <img [src]="item.imagen" [alt]="item.nombre" class="cart-item-img" />
            <div class="cart-item-info">
              <span class="cart-item-name">{{ item.nombre }}</span>
              <span class="cart-item-price">\$ {{ item.precio | number }} c/u</span>
            </div>
            <div class="cart-item-qty">
              <button class="qty-btn" (click)="onDecrease(item.id)">−</button>
              <span class="qty-num">{{ item.cantidad }}</span>
              <button class="qty-btn" (click)="onIncrease(item.id)" [disabled]="item.cantidad >= item.stockMax">+</button>
            </div>
            <span class="cart-item-total">\$ {{ (item.precio * item.cantidad) | number }}</span>
            <button class="btn-danger" (click)="onRemove(item.id)">🗑</button>
          </div>
        </div>

        <!-- Total y botón pagar -->
        <div class="cart-footer" *ngIf="items.length > 0">
          <div class="cart-total">
            <span class="total-label">Total:</span>
            <span class="total-price">\$ {{ totalPrice | number }}</span>
          </div>
          <div class="cart-footer-actions">
            <button class="btn-outline" (click)="onClear()">Vaciar carrito</button>
            <button class="btn-primary" (click)="onCheckout()">💳 Proceder al pago</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal { background: #12121f; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; width: 100%; max-width: 460px; padding: 1.8rem; box-shadow: 0 30px 60px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 1.2rem; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 560px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0; }
    .modal-close { background: none; border: none; color: #64748b; font-size: 1.1rem; cursor: pointer; padding: 0.2rem 0.5rem; transition: color 0.2s; }
    .modal-close:hover { color: #f1f5f9; }
    .cart-empty { text-align: center; padding: 2rem; color: #475569; font-size: 1.2rem; }
    .cart-empty span { font-size: 3rem; display: block; margin-bottom: 0.5rem; }
    .cart-items { display: flex; flex-direction: column; gap: 0.75rem; }
    .cart-item { display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.04); padding: 0.75rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); }
    .cart-item-img { width: 52px; height: 40px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
    .cart-item-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
    .cart-item-name { font-size: 0.88rem; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cart-item-price { font-size: 0.75rem; color: #64748b; }
    .cart-item-qty { display: flex; align-items: center; gap: 0.4rem; }
    .qty-btn { width: 26px; height: 26px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #f1f5f9; border-radius: 6px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .qty-btn:hover { background: rgba(99,102,241,0.3); }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-num { font-weight: 700; font-size: 0.9rem; min-width: 20px; text-align: center; }
    .cart-item-total { font-weight: 700; color: #a78bfa; font-size: 0.9rem; min-width: 90px; text-align: right; }
    .btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 0.4rem 0.7rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
    .btn-danger:hover { background: rgba(239,68,68,0.3); }
    .cart-footer { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .cart-total { display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 0.9rem; color: #94a3b8; font-weight: 600; }
    .total-price { font-size: 1.4rem; font-weight: 800; color: #a78bfa; }
    .cart-footer-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
    .btn-outline { background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); padding: 0.55rem 1.2rem; border-radius: 8px; font-weight: 500; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: rgba(255,255,255,0.06); color: #f1f5f9; }
    .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.55rem 1.3rem; border-radius: 8px; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(99,102,241,0.3); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 25px rgba(99,102,241,0.5); }
  `]
})
export class CartModalComponent {
  @Input() isOpen = false;
  @Input() items: CartItem[] = [];
  @Input() totalPrice = 0;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() increase = new EventEmitter<number>();
  @Output() decrease = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();
  @Output() clear = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }

  onIncrease(id: number) {
    this.increase.emit(id);
  }

  onDecrease(id: number) {
    this.decrease.emit(id);
  }

  onRemove(id: number) {
    this.remove.emit(id);
  }

  onClear() {
    this.clear.emit();
  }

  onCheckout() {
    this.checkout.emit();
  }
}
