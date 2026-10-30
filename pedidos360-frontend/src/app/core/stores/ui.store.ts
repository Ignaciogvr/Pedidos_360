import { Injectable, signal } from '@angular/core';
import { Pedido } from '../../shared/models/pedido.model';

export interface ModalState<T = unknown> {
  isOpen: boolean;
  data: T | null;
}

export interface StatusChangeData {
  order: Pedido;
  newStatus: string;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class UIStore {
  // Private writable signals for each modal
  private orderDetailModalSignal = signal<ModalState<Pedido>>({ isOpen: false, data: null });
  private statusChangeModalSignal = signal<ModalState<StatusChangeData>>({ isOpen: false, data: null });
  private globalLoadingSignal = signal(false);
  
  // Public readonly signals
  readonly orderDetailModal = this.orderDetailModalSignal.asReadonly();
  readonly statusChangeModal = this.statusChangeModalSignal.asReadonly();
  readonly globalLoading = this.globalLoadingSignal.asReadonly();
  
  // Order Detail Modal
  openOrderDetail(order: Pedido): void {
    this.orderDetailModalSignal.set({ isOpen: true, data: order });
  }
  
  closeOrderDetail(): void {
    this.orderDetailModalSignal.set({ isOpen: false, data: null });
  }
  
  // Status Change Modal
  openStatusChange(order: Pedido): void {
    this.statusChangeModalSignal.set({ 
      isOpen: true, 
      data: { order, newStatus: order.estado || 'PENDIENTE' }
    });
  }
  
  closeStatusChange(): void {
    this.statusChangeModalSignal.set({ isOpen: false, data: null });
  }
  
  // Global Loading
  setGlobalLoading(loading: boolean): void {
    this.globalLoadingSignal.set(loading);
  }
}