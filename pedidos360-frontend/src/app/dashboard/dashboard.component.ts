import { Component, OnInit, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserStore } from '../core/stores/user.store';
import { OrdersStore } from '../core/stores/orders.store';
import { ApiService } from '../core/services/api.service';

interface Producto {
  id: number;
  nombre: string;
  stock: number;
  precio: number;
  categoria: string;
  imagen: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private userStore = inject(UserStore);
  private ordersStore = inject(OrdersStore);
  private apiService = inject(ApiService);

  readonly user = this.userStore.currentUser;
  readonly stats = this.ordersStore.stats;
  readonly loading = this.ordersStore.loading;
  readonly orders = this.ordersStore.orders;

  readonly esCliente = computed(() => {
    const roles = this.userStore.userRoles();
    return !roles.some(r => r.toUpperCase().includes('ADMIN') || r.toUpperCase().includes('OPERADOR') || r.toUpperCase().includes('OPERATOR'));
  });

  productos = signal<Producto[]>([]);
  rango = signal<7 | 30 | 365>(7);

  readonly recentOrders = computed(() =>
    [...this.orders()].sort((a, b) =>
      new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime()
    ).slice(0, 5)
  );

  readonly ingresoTotal = computed(() =>
    this.orders().filter(o => o.estado !== 'CANCELADO')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  );

  readonly tasaCompletados = computed(() => {
    const total = this.stats().total;
    return total === 0 ? 0 : Math.round((this.stats().completados / total) * 100);
  });

  readonly productoMasVendido = computed(() => {
    const counts: Record<string, number> = {};
    this.orders().forEach(o => {
      if (o.producto) counts[o.producto] = (counts[o.producto] || 0) + (o.cantidad || 1);
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? { nombre: top[0], cantidad: top[1] } : null;
  });

  readonly lowStockProductos = computed(() =>
    [...this.productos()].filter(p => p.stock < 5).sort((a, b) => a.stock - b.stock).slice(0, 6)
  );

  readonly catalogStats = computed(() => ({
    total: this.productos().length,
    enStock: this.productos().filter(p => p.stock > 0).length,
    agotados: this.productos().filter(p => p.stock === 0).length,
    stockCritico: this.productos().filter(p => p.stock > 0 && p.stock < 5).length,
    productosDisponibles: this.productos().filter(p => p.stock > 0).slice(0, 4)
  }));

  readonly donutDegrees = computed(() => {
    const s = this.stats();
    if (s.total === 0) return 'conic-gradient(rgba(255,255,255,0.08) 0deg 360deg)';
    const pct = (n: number) => Math.round((n / s.total) * 360);
    let deg = 0;
    const segments: string[] = [];
    const add = (color: string, count: number) => {
      if (count === 0) return;
      segments.push(`${color} ${deg}deg ${deg + pct(count)}deg`);
      deg += pct(count);
    };
    add('#fbbf24', s.pendientes);
    add('#60a5fa', s.enProceso);
    add('#34d399', s.completados);
    add('#f87171', s.cancelados);
    return `conic-gradient(${segments.join(', ')})`;
  });

  readonly barData = computed(() => {
    const dias = this.rango();
    const days: { label: string; count: number; revenue: number }[] = [];
    const now = new Date();

    if (dias <= 30) {
      for (let i = dias - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = dias === 7
          ? d.toLocaleDateString('es-CL', { weekday: 'short' })
          : d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
        const dayOrders = this.orders().filter(o => (o.fechaCreacion || '').startsWith(dateStr));
        days.push({
          label,
          count: dayOrders.length,
          revenue: dayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
        });
      }
    } else {
      // 1 año — agrupar por mes
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('es-CL', { month: 'short' });
        const monthOrders = this.orders().filter(o => (o.fechaCreacion || '').startsWith(ym));
        days.push({
          label,
          count: monthOrders.length,
          revenue: monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
        });
      }
    }
    return days;
  });

  readonly maxBar = computed(() => Math.max(1, ...this.barData().map(d => d.count)));

  ngOnInit() {
    this.ordersStore.loadOrders();
    this.apiService.get<Producto[]>('/api/catalogo/productos').subscribe({
      next: (data) => this.productos.set(data),
      error: () => {}
    });
  }

  setRango(r: 7 | 30 | 365) { this.rango.set(r); }

  getEstadoClass(estado: string | undefined): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'estado-pendiente', 'EN_PROCESO': 'estado-proceso',
      'COMPLETADO': 'estado-completado', 'CANCELADO': 'estado-cancelado'
    };
    return map[estado || ''] || '';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-zero';
    if (stock < 3) return 'stock-critical';
    return 'stock-low';
  }
}
