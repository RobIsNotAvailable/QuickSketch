import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/feed/feed').then(m => m.Feed)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'following',
    loadComponent: () => import('./features/feed/feed').then(m => m.Feed),
    canActivate: [authGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard').then(m => m.Leaderboard)
  },
  {
    path: 'sketcher',
    loadComponent: () => import('./features/sketcher/sketcher').then(m => m.Sketcher),
    canActivate: [authGuard]
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
  },
  {
    path: '**',
    redirectTo: ''
  }
];