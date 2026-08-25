import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) =>
{
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const isLoggedIn = authService.isLoggedIn();
  const targetPath = route.routeConfig?.path;

  if (targetPath === 'login' || targetPath === 'register')
  {
    if (isLoggedIn)
    {
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  if (isLoggedIn)
  {
    return true;
  }

  router.navigate(['/login']);
  return false;
};