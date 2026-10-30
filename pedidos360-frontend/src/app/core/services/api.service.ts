/**
 * API Service
 * 
 * Centralizes HTTP operations with consistent error handling.
 * This service wraps Angular's HttpClient and provides:
 * - Automatic base URL prepending
 * - Centralized error handling with user-friendly Spanish messages
 * - Error event streams for global error handling (auth, permission, network)
 * - Type-safe generic methods for CRUD operations
 * 
 * @Injectable providedIn: 'root' - Singleton service available application-wide
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ApiError } from '../../shared/models/api.model';

/**
 * ApiService
 * 
 * Provides centralized HTTP operations with automatic error handling.
 * Components should use this service instead of HttpClient directly.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  
  // Error subjects for global error handling
  private authErrorSubject = new Subject<ApiError>();
  private permissionErrorSubject = new Subject<ApiError>();
  private networkErrorSubject = new Subject<ApiError>();
  
  // Public error observables
  authError$ = this.authErrorSubject.asObservable();
  permissionError$ = this.permissionErrorSubject.asObservable();
  networkError$ = this.networkErrorSubject.asObservable();
  
  /**
   * Perform a GET request
   * @param endpoint - API endpoint path (without base URL)
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable with response data
   */
  get<T>(endpoint: string, options?: object): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.get<T>(url, { ...options, observe: 'body' }).pipe(
      catchError(err => this.handleError(err))
    ) as Observable<T>;
  }
  
  /**
   * Perform a POST request
   * @param endpoint - API endpoint path (without base URL)
   * @param body - Request body data
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable with response data
   */
  post<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.post<T>(url, body, { ...options, observe: 'body' }).pipe(
      catchError(err => this.handleError(err))
    ) as Observable<T>;
  }
  
  /**
   * Perform a PUT request
   * @param endpoint - API endpoint path (without base URL)
   * @param body - Request body data
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable with response data
   */
  put<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.put<T>(url, body, { ...options, observe: 'body' }).pipe(
      catchError(err => this.handleError(err))
    ) as Observable<T>;
  }
  
  /**
   * Perform a DELETE request
   * @param endpoint - API endpoint path (without base URL)
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable with response data
   */
  delete<T>(endpoint: string, options?: object): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.delete<T>(url, { ...options, observe: 'body' }).pipe(
      catchError(err => this.handleError(err))
    ) as Observable<T>;
  }
  
  /**
   * Build full URL by combining base URL with endpoint
   * @param endpoint - API endpoint path
   * @returns Complete URL string
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = this.config.getApiUrl();
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // Remove trailing slash from baseUrl if present
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}/${cleanEndpoint}`;
  }
  
  /**
   * Handle HTTP errors with logging and error stream emission
   * @param error - HTTP error response
   * @returns Observable that throws ApiError
   */
  private handleError(error: unknown): Observable<never> {
    const apiError: ApiError = {
      status: (error as { status?: number })?.status || 0,
      message: this.extractErrorMessage(error),
      originalError: error,
      timestamp: new Date()
    };
    
    // Log error to console for debugging
    console.error('[ApiService] Error:', apiError);
    
    // Emit to appropriate error stream based on status code
    const status = (error as { status?: number })?.status;
    if (status === 401) {
      this.authErrorSubject.next(apiError);
    } else if (status === 403) {
      this.permissionErrorSubject.next(apiError);
    } else if (status === 0 || !navigator.onLine) {
      this.networkErrorSubject.next(apiError);
    }
    
    return throwError(() => apiError);
  }
  
  /**
   * Extract user-friendly error message from HTTP error
   * @param error - HTTP error response
   * @returns Spanish language error message
   */
  private extractErrorMessage(error: unknown): string {
    const httpError = error as { status?: number; error?: { message?: string } | string; message?: string };
    const status = httpError.status;
    
    // Network error (status 0)
    if (status === 0) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    
    // Authentication error (401)
    if (status === 401) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    
    // Permission error (403)
    if (status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }
    
    // Not found error (404)
    if (status === 404) {
      return 'El recurso solicitado no existe.';
    }
    
    // Server error (500+)
    if (status && status >= 500) {
      return 'Error del servidor. Intenta nuevamente más tarde.';
    }
    
    // Try to extract backend error message
    if (httpError.error && typeof httpError.error === 'object' && httpError.error.message) {
      return httpError.error.message;
    }
    if (typeof httpError.error === 'string') {
      return httpError.error;
    }
    
    // Generic error message
    return 'Ocurrió un error inesperado.';
  }
}