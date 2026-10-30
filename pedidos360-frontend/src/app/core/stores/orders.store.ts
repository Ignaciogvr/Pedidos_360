import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../services/api.service';
import { PermissionService } from '../services/permission.service';
import { Pedido } from '../../shared/models/pedido.model';

export type OrderFilter = 'all' | 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

export interface OrderStats {
  total: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  cancelados: number;
}

export interface OrdersState {
  orders: Pedido[];
  loading: boolean;
  error: string | null;
  activeFilter: OrderFilter;
  searchQuery: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private apiService = inject(ApiService);
  private permissionService = inject(PermissionService);
  
  // Private writable signals
  private ordersSignal = signal<Pedido[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private activeFilterSignal = signal<OrderFilter>('all');
  private searchQuerySignal = signal('');
  
  // Public readonly signals
  readonly orders = this.ordersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly activeFilter = this.activeFilterSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();
  
  // Computed filteredOrders with filter and search logic
  readonly filteredOrders = computed(() => {
    const orders = this.ordersSignal();
    const filter = this.activeFilterSignal();
    const query = this.searchQuerySignal().toLowerCase();
    
    let filtered = orders;
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(o => o.estado === filter);
    }
    
    // Apply search query
    if (query) {
      filtered = filtered.filter(o =>
        o.producto?.toLowerCase().includes(query) ||
        o.clienteNombre?.toLowerCase().includes(query) ||
        o.clienteEmail?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  });
  
  // Computed stats with counts for each status
  readonly stats = computed<OrderStats>(() => {
    const orders = this.ordersSignal();
    return {
      total: orders.length,
      pendientes: orders.filter(o => o.estado === 'PENDIENTE').length,
      enProceso: orders.filter(o => o.estado === 'EN_PROCESO').length,
      completados: orders.filter(o => o.estado === 'COMPLETADO').length,
      cancelados: orders.filter(o => o.estado === 'CANCELADO').length
    };
  });
  
  loadOrders(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.apiService.get<Pedido[]>('/api/pedidos').subscribe({
      next: (orders) => {
        this.ordersSignal.set(orders);
        this.loadingSignal.set(false);
        console.info('[OrdersStore] Orders loaded successfully:', orders.length);
      },
      error: (err) => {
        const errorMsg = err?.message || 'Error al cargar los pedidos. Intenta nuevamente.';
        console.error('[OrdersStore] Error loading orders:', err);
        this.errorSignal.set(errorMsg);
        this.loadingSignal.set(false);
      }
    });
  }
  
  updateFilter(filter: OrderFilter): void {
    this.activeFilterSignal.set(filter);
    this.errorSignal.set(null);
  }
  
  updateSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
    this.errorSignal.set(null);
  }
  
  clearError(): void {
    this.errorSignal.set(null);
  }
  
  updateOrderStatus(orderId: number, estado: string, comentarioAdmin?: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.apiService.put<Pedido>(`/api/pedidos/${orderId}/estado`, { estado, comentarioAdmin }).subscribe({
      next: () => {
        console.info('[OrdersStore] Order status updated successfully:', orderId);
        this.loadOrders();
      },
      error: (err) => {
        const errorMsg = err?.message || 'No se pudo actualizar el estado del pedido. Verifica tu conexión.';
        console.error('[OrdersStore] Error updating order status:', err);
        this.errorSignal.set(errorMsg);
        this.loadingSignal.set(false);
      }
    });
  }
  
  createOrder(pedido: Pedido): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.apiService.post<Pedido>('/api/pedidos', pedido).subscribe({
      next: (created) => {
        console.info('[OrdersStore] Order created successfully:', created);
        this.loadOrders();
      },
      error: (err) => {
        const errorMsg = err?.message || 'No se pudo crear el pedido. Verifica los datos e intenta nuevamente.';
        console.error('[OrdersStore] Error creating order:', err);
        this.errorSignal.set(errorMsg);
        this.loadingSignal.set(false);
      }
    });
  }
  
  deleteOrder(orderId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.apiService.delete<void>(`/api/pedidos/${orderId}`).subscribe({
      next: () => {
        console.info('[OrdersStore] Order deleted successfully:', orderId);
        this.loadOrders();
      },
      error: (err) => {
        const errorMsg = err?.message || 'No se pudo eliminar el pedido. Intenta nuevamente.';
        console.error('[OrdersStore] Error deleting order:', err);
        this.errorSignal.set(errorMsg);
        this.loadingSignal.set(false);
      }
    });
  }
}