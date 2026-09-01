import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { sketchDeactivateGuard } from './core/guards/sketch-deactivate.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/feed/feed').then(m => m.Feed)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    canActivate: [authGuard]
  },
  {
    path: 'logout',
    loadComponent: () => import('./features/auth/logout/logout').then(m => m.Logout)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
    canActivate: [authGuard]
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
    canActivate: [authGuard],
    canDeactivate: [sketchDeactivateGuard]
  },
  {
    path: 'profile/:slug',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./features/post/post').then(m => m.Post)
  },
  {
    path: '**',
    redirectTo: ''
  }
];