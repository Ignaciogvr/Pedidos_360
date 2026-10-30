import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { catchError, switchMap, from } from 'rxjs';

/**
 * Auth Interceptor
 * 
 * Automatically adds the JWT Bearer token to all HTTP requests.
 * This interceptor:
 * 1. Acquires an access token from MSAL (silent or interactive)
 * 2. Adds Authorization header with Bearer token
 * 3. Handles token acquisition failures gracefully
 * 
 * Applied to all HTTP requests via app.config.ts
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const msalService = inject(MsalService);

  // Skip token for public endpoints (if any)
  const publicEndpoints = ['/assets/', '/api/public/'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  if (isPublicEndpoint) {
    return next(req);
  }

  // Get the active account
  const account = msalService.instance.getActiveAccount();
  
  if (!account) {
    console.warn('[AuthInterceptor] No active account found, proceeding without token');
    return next(req);
  }

  // Acquire token silently
  return from(
    msalService.instance.acquireTokenSilent({
      scopes: ['api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user'],
      account: account
    })
  ).pipe(
    switchMap(response => {
      // Clone request and add Authorization header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });
      
      console.log('[AuthInterceptor] Token added to request:', {
        url: authReq.url,
        method: authReq.method,
        hasToken: !!response.accessToken
      });
      
      return next(authReq);
    }),
    catchError(error => {
      console.error('[AuthInterceptor] Token acquisition failed:', error);
      
      // Attempt interactive token acquisition if silent fails
      return from(
        msalService.instance.acquireTokenPopup({
          scopes: ['api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user']
        })
      ).pipe(
        switchMap(response => {
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          });
          return next(authReq);
        }),
        catchError(popupError => {
          console.error('[AuthInterceptor] Interactive token acquisition failed:', popupError);
          // Proceed without token - backend will return 401
          return next(req);
        })
      );
    })
  );
};
