import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  stockMax: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  items = this._items.asReadonly();

  totalItems = computed(() => this._items().reduce((acc, i) => acc + i.cantidad, 0));
  totalPrecio = computed(() => this._items().reduce((acc, i) => acc + i.precio * i.cantidad, 0));

  agregar(item: Omit<CartItem, 'cantidad'>) {
    this._items.update(lista => {
      const existe = lista.find(i => i.id === item.id);
      if (existe) {
        return lista.map(i =>
          i.id === item.id && i.cantidad < i.stockMax
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...lista, { ...item, cantidad: 1 }];
    });
  }

  quitar(id: number) {
    this._items.update(lista => {
      const item = lista.find(i => i.id === id);
      if (!item) return lista;
      if (item.cantidad <= 1) return lista.filter(i => i.id !== id);
      return lista.map(i => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i);
    });
  }

  eliminar(id: number) {
    this._items.update(lista => lista.filter(i => i.id !== id));
  }

  vaciar() {
    this._items.set([]);
  }
}
