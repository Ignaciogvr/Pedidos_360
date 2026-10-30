import { ApplicationConfig, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';

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
            clientId: environment.msalConfig.clientId,
            authority: environment.msalConfig.authority,
            redirectUri: environment.msalConfig.redirectUri,
            postLogoutRedirectUri: environment.msalConfig.redirectUri
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
    
    // Use environment-based API URL (54.82.58.51 for dev, AWS/Azure for prod)
    const API_URL = environment.apiUrl;
    
    protectedResourceMap.set(`${API_URL}/`, ['api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user']);

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
            withInterceptors([authInterceptor, errorInterceptor]),
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
