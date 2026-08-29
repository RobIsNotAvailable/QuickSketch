import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Sketcher } from '../../features/sketcher/sketcher';
import { AuthService } from '../services/auth.service';

export const sketchDeactivateGuard: CanDeactivateFn<Sketcher> = (component) =>
{
  const authService = inject(AuthService);
  if (authService.isLoggingOut())
  {
    return true;
  }

  if (component.gameState() === 'DRAWING' && !component.isPublishing())
  {
    return component.canDeactivate();
  }
  return true;
};