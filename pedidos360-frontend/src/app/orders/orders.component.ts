import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersStore } from '../core/stores/orders.store';
import { UIStore } from '../core/stores/ui.store';
import { UserStore } from '../core/stores/user.store';
import { PermissionService } from '../core/services/permission.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { OrderCardComponent } from '../shared/components/order-card/order-card.component';
import { OrderTableComponent } from '../shared/components/order-table/order-table.component';
import { Pedido } from '../shared/models/pedido.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ModalComponent,
    OrderCardComponent,
    OrderTableComponent
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  private ordersStore = inject(OrdersStore);
  private uiStore = inject(UIStore);
  private userStore = inject(UserStore);
  private permissionService = inject(PermissionService);

  // Reactive state from stores
  readonly orders = this.ordersStore.filteredOrders;
  readonly loading = this.ordersStore.loading;
  readonly error = this.ordersStore.error;
  readonly activeFilter = this.ordersStore.activeFilter;
  readonly isAdmin = this.userStore.isAdmin;
  readonly isOperador = this.userStore.isOperador;

  // Permissions
  readonly canDelete = this.permissionService.canDeleteOrder$;
  readonly canUpdateStatus = this.permissionService.canUpdateOrderStatus$;
  readonly canViewAll = this.permissionService.canViewAllOrders$;

  // Local UI state
  searchQuery = signal('');
  modalDetalle = signal(false);
  modalAbierto = signal(false);
  pedidoDetalle = signal<Pedido | null>(null);
  pedidoSeleccionado = signal<Pedido | null>(null);
  nuevoEstado = signal('');
  comentarioAdmin = '';

  // Filter options
  filtrosEstado = [
    { label: 'Todos', value: 'all' },
    { label: '🕐 Pendiente', value: 'PENDIENTE' },
    { label: '⚙️ En Proceso', value: 'EN_PROCESO' },
    { label: '✅ Completado', value: 'COMPLETADO' },
    { label: '❌ Cancelado', value: 'CANCELADO' }
  ];

  // Status options for modal
  estados = [
    { icon: '🕐', label: 'Pendiente', value: 'PENDIENTE' },
    { icon: '⚙️', label: 'En Proceso', value: 'EN_PROCESO' },
    { icon: '✅', label: 'Completado', value: 'COMPLETADO' },
    { icon: '❌', label: 'Cancelado', value: 'CANCELADO' }
  ];

  ngOnInit() {
    this.ordersStore.loadOrders();
  }

  get esAdminUOperador(): boolean {
    return this.isAdmin() || this.isOperador();
  }

  get cargando() {
    return this.loading;
  }

  get pedidosFiltrados() {
    return this.orders;
  }

  get filtroActivo() {
    return this.activeFilter;
  }

  get puedeCambiarEstado(): boolean {
    return this.canUpdateStatus();
  }

  get puedeEliminar(): boolean {
    return this.canDelete();
  }

  cargarPedidos() {
    this.ordersStore.loadOrders();
  }

  setFiltro(filtro: any) {
    this.ordersStore.updateFilter(filtro);
  }

  abrirDetalle(pedido: Pedido) {
    this.pedidoDetalle.set(pedido);
    this.modalDetalle.set(true);
  }

  abrirModalEstado(pedido: Pedido) {
    this.pedidoSeleccionado.set(pedido);
    this.nuevoEstado.set(pedido.estado || 'PENDIENTE');
    this.comentarioAdmin = pedido.comentarioAdmin || '';
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.pedidoSeleccionado.set(null);
    this.nuevoEstado.set('');
    this.comentarioAdmin = '';
  }

  confirmarEstado() {
    const pedido = this.pedidoSeleccionado();
    if (!pedido) return;

    if (!pedido.id) return;

    this.ordersStore.updateOrderStatus(

      pedido.id,
      this.nuevoEstado(),
      this.comentarioAdmin || undefined
    );
    this.cerrarModal();
  }

  cancelar(pedidoId: number) {
    const pedido = this.orders().find(p => p.id === pedidoId);
    if (confirm(`¿Estás seguro de cancelar el pedido #${pedidoId}?`)) {
      this.ordersStore.deleteOrder(pedidoId);
    }
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'PENDIENTE': 'status-pending',
      'EN_PROCESO': 'status-processing',
      'COMPLETADO': 'status-completed',
      'CANCELADO': 'status-cancelled'
    };
    return classes[estado] || '';
  }
}