import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

export interface Pedido {
  id?: number;
  clienteEmail?: string;
  clienteNombre?: string;
  producto: string;
  cantidad: number;
  estado?: string;
  fechaCreacion?: string;
  comentarioAdmin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'https://6yhwhad3ea.execute-api.us-east-1.amazonaws.com/api/pedidos';

  constructor(private http: HttpClient, private msalService: MsalService) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  crearPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  actualizarEstado(id: number, estado: string, comentarioAdmin?: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}/estado`, { estado, comentarioAdmin });
  }

  eliminarPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  hasRole(role: string): boolean {
    const account = this.msalService.instance.getActiveAccount();
    if (!account || !account.idTokenClaims || !account.idTokenClaims['roles']) {
      return false;
    }
    const roles = account.idTokenClaims['roles'] as string[];
    return roles.includes(role);
  }

  getUserEmail(): string {
    const account = this.msalService.instance.getActiveAccount();
    return account?.username || '';
  }

  getUserName(): string {
    const account = this.msalService.instance.getActiveAccount();
    return account?.name || '';
  }
}
