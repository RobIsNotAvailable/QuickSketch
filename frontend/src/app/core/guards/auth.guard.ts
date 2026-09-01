import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) =>
{
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const isLoggedIn = authService.isLoggedIn();
  const targetPath = route.routeConfig?.path;
  const isAuthRoute = targetPath === 'login' || targetPath === 'register';

  if (isAuthRoute && isLoggedIn)
  {
    return router.createUrlTree(['/']);
  }

  if (!isAuthRoute && !isLoggedIn)
  {
    return router.createUrlTree(['/login']);
  }

  return true;
};