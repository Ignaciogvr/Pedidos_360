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
        <span class="status-badge" [ngClass]="getEstadoClass()">{{ pedido.estado }}</span>
      </div>
      <h3 class="order-product">{{ pedido.producto }}</h3>
      <p class="order-date">{{ pedido.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}</p>

      <!-- Timeline de estados -->
      <div class="timeline">
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

      <div class="admin-comment" *ngIf="pedido.comentarioAdmin">
        <span class="comment-icon">💬</span>
        <span class="comment-text">{{ pedido.comentarioAdmin }}</span>
      </div>

      <div class="order-card-footer">
        <span class="order-qty">Cantidad: {{ pedido.cantidad }}</span>
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
    if (!this.pedido.estado) return '';
    return this.pedido.estado.toLowerCase().replace('_', '_');
  }

  isEstadoAlcanzado(estadoCheck: string): boolean {
    if (this.pedido.estado === 'CANCELADO') return false;
    const orden = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'];
    return orden.indexOf(this.pedido.estado || '') >= orden.indexOf(estadoCheck);
  }
}
