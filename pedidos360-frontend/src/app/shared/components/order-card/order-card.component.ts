import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="order-card" (click)="onClick()">
      <div class="order-card-header">
        <span class="id-badge">#{{ pedido.id }}</span>
        <span class="status-badge" [ngClass]="getEstadoClass()">{{ getEstadoLabel() }}</span>
      </div>
      <h3 class="order-product">{{ pedido.producto || 'Sin nombre' }}</h3>

      <div class="order-meta">
        <span class="order-meta-item">👤 {{ pedido.clienteNombre || pedido.clienteEmail || 'Cliente' }}</span>
        <span class="order-meta-item" *ngIf="pedido.direccionEnvio">📍 {{ pedido.direccionEnvio }}</span>
        <span class="order-meta-item" *ngIf="!pedido.direccionEnvio" style="color:#475569">📍 Sin dirección</span>
        <span class="order-meta-item">🗓️ {{ pedido.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}</span>
      </div>

      <!-- Timeline de estados -->
      <div class="timeline" *ngIf="pedido.estado !== 'CANCELADO'">
        <div class="timeline-step" [class.done]="isEstadoAlcanzado('PENDIENTE')" [class.active]="pedido.estado === 'PENDIENTE'">
          <div class="timeline-dot"></div>
          <span>Pendiente</span>
        </div>
        <div class="timeline-line" [class.done]="isEstadoAlcanzado('EN_PROCESO')"></div>
        <div class="timeline-step" [class.done]="isEstadoAlcanzado('EN_PROCESO')" [class.active]="pedido.estado === 'EN_PROCESO'">
          <div class="timeline-dot"></div>
          <span>En Proceso</span>
        </div>
        <div class="timeline-line" [class.done]="pedido.estado === 'COMPLETADO'"></div>
        <div class="timeline-step" [class.done]="pedido.estado === 'COMPLETADO'" [class.active]="pedido.estado === 'COMPLETADO'">
          <div class="timeline-dot"></div>
          <span>Completado</span>
        </div>
      </div>

      <div class="cancelado-banner" *ngIf="pedido.estado === 'CANCELADO'">
        ❌ Pedido cancelado
      </div>

      <div class="admin-comment" *ngIf="pedido.comentarioAdmin">
        <span class="comment-icon">💬</span>
        <span class="comment-text">{{ pedido.comentarioAdmin }}</span>
      </div>

      <div class="order-card-footer">
        <span class="order-qty">Cantidad: {{ pedido.cantidad }}</span>
        <span class="order-total" *ngIf="pedido.total">\${{ pedido.total | number }}</span>
        <span class="ver-detalle">Ver detalle →</span>
      </div>
    </div>
  `,
  styleUrls: ['./order-card.component.css']
})
export class OrderCardComponent {
  @Input() pedido!: Pedido;
  @Output() cardClick = new EventEmitter<Pedido>();

  onClick() {
    this.cardClick.emit(this.pedido);
  }

  getEstadoClass(): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'estado-pendiente',
      'EN_PROCESO': 'estado-proceso',
      'COMPLETADO': 'estado-completado',
      'CANCELADO': 'estado-cancelado'
    };
    return map[this.pedido.estado || ''] || '';
  }

  getEstadoLabel(): string {
    const map: Record<string, string> = {
      'PENDIENTE': '🕐 Pendiente',
      'EN_PROCESO': '⚙️ En Proceso',
      'COMPLETADO': '✅ Completado',
      'CANCELADO': '❌ Cancelado'
    };
    return map[this.pedido.estado || ''] || this.pedido.estado || 'Desconocido';
  }

  isEstadoAlcanzado(estadoCheck: string): boolean {
    if (this.pedido.estado === 'CANCELADO') return false;
    const orden = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'];
    return orden.indexOf(this.pedido.estado || '') >= orden.indexOf(estadoCheck);
  }
}
