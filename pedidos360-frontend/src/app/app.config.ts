import { ApplicationConfig, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';

import {
    IPublicClientApplication,
    PublicClientApplication,
    InteractionType,
    BrowserCacheLocation
} from '@azure/msal-browser';

import {
    MsalGuard,
    MsalInterceptor,
    MSAL_INSTANCE,
    MSAL_GUARD_CONFIG,
    MSAL_INTERCEPTOR_CONFIG,
    MsalGuardConfiguration,
    MsalInterceptorConfiguration,
    MsalService,
    MsalBroadcastService
} from '@azure/msal-angular';

export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: '6979a62f-803d-40d1-a7be-75ecd52f12a0',
            authority: 'https://login.microsoftonline.com/b6f34517-563c-4ce9-a10b-6f3958083091/v2.0',
            redirectUri: 'https://3.93.182.109',
            postLogoutRedirectUri: 'https://3.93.182.109'
        },
        cache: {
            cacheLocation: BrowserCacheLocation.LocalStorage
        }
    });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: ['api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user']
        }
    };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>();
    
    // Backend en AWS API Gateway
    const API_URL = 'https://6yhwhad3ea.execute-api.us-east-1.amazonaws.com';
    
    protectedResourceMap.set(`${API_URL}/api/pedidos`, ['api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user']);
    protectedResourceMap.set(`${API_URL}/api/catalogo`, ['api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user']);
    protectedResourceMap.set(`${API_URL}/api/debug-token`, ['api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user']);

    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap
    };
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(
            withInterceptorsFromDi()
        ),
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory
        },
        provideAppInitializer(async () => {
            const msalInstance = inject(MSAL_INSTANCE) as unknown as IPublicClientApplication;
            await msalInstance.initialize();
            await msalInstance.handleRedirectPromise();
        }),
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true
        },
        MsalService,
        MsalGuard,
        MsalBroadcastService
    ]
};
