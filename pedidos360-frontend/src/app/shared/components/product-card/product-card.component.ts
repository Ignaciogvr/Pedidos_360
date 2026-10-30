import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  categoria: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() producto!: Producto;
  @Input() showAdminControls = false;
  @Input() showDeleteButton = false;
  @Input() showEditButton = false;
  
  @Output() addToCart = new EventEmitter<Producto>();
  @Output() stockChange = new EventEmitter<{ id: number; amount: number }>();
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  onAddToCart() {
    if (this.producto.stock > 0) {
      this.addToCart.emit(this.producto);
    }
  }

  onStockChange(amount: number) {
    this.stockChange.emit({ id: this.producto.id, amount });
  }

  onDelete() {
    this.delete.emit(this.producto.id);
  }

  onEdit() {
    this.edit.emit(this.producto.id);
  }
}