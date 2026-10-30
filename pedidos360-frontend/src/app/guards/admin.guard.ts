import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserStore } from '../core/stores/user.store';

export const adminGuard: CanActivateFn = () => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  if (userStore.isAdmin()) {
    return true;
  }
  alert('Acceso denegado: Se requiere rol de ADMIN');
  router.navigate(['/catalog']);
  return false;
};