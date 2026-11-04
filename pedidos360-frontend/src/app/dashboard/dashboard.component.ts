import { Component, OnInit, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserStore } from '../core/stores/user.store';
import { OrdersStore } from '../core/stores/orders.store';

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

  readonly user = this.userStore.currentUser;
  readonly stats = this.ordersStore.stats;
  readonly loading = this.ordersStore.loading;
  readonly orders = this.ordersStore.orders;

  readonly recentOrders = computed(() =>
    [...this.orders()].sort((a, b) =>
      new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime()
    ).slice(0, 5)
  );

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

  readonly ordenesUltimos7Dias = computed(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('es-CL', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      const count = this.orders().filter(o =>
        (o.fechaCreacion || '').startsWith(dateStr)
      ).length;
      days.push({ label, count });
    }
    return days;
  });

  readonly maxDayCount = computed(() =>
    Math.max(1, ...this.ordenesUltimos7Dias().map(d => d.count))
  );

  ngOnInit() {
    this.ordersStore.loadOrders();
  }

  getEstadoClass(estado: string | undefined): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'estado-pendiente',
      'EN_PROCESO': 'estado-proceso',
      'COMPLETADO': 'estado-completado',
      'CANCELADO': 'estado-cancelado'
    };
    return map[estado || ''] || '';
  }
}
