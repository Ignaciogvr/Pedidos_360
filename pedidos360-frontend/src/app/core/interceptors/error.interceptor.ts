import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error del cliente: ${error.error.message}`;
        console.error('[ErrorInterceptor] Client error:', error.error.message);
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Intenta más tarde.';
            break;
          default:
            errorMessage = `Error del servidor (${error.status}): ${error.message}`;
        }
        
        console.error('[ErrorInterceptor] Server error:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error
        });
      }

      // Return user-friendly error
      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        oripáPáginalError: error
      }));
    })
  );
};