import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [MsalGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(c => c.OrdersComponent),
        canActivate: [MsalGuard]
    },
    {
        path: 'catalog',
        loadComponent: () => import('./products/products.component').then(c => c.ProductsComponent),
        canActivate: [MsalGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent),
        canActivate: [MsalGuard]
    },
    {
        path: 'unauthorized',
        loadComponent: () => import('./unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
    },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: '**',
        loadComponent: () => import('./not-found/not-found.component').then(c => c.NotFoundComponent)
    }
];
