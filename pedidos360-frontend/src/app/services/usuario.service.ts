import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://54.82.58.51/api/usuarios';

  constructor(private http: HttpClient) {}

  registrar(email: string, nombre: string, rol?: string): Observable<Usuario> {
    const payload: any = { email, nombre };
    if (rol) {
      payload.rol = rol;
    }
    return this.http.post<Usuario>(`${this.apiUrl}/registrar`, payload)
      .pipe(catchError(this.handleError));
  }

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  cambiarRol(id: number, nuevoRol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/rol`, { nuevoRol })
      .pipe(catchError(this.handleError));
  }

  suspender(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/suspender`, {})
      .pipe(catchError(this.handleError));
  }

  activar(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/activar`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en UsuarioService:', error);
    return throwError(() => new Error(error.message || 'Error del servidor'));
  }
}