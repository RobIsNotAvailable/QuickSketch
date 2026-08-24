import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  let authReq = req;
  if (token)
  {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se il token è scaduto (401) e non stiamo già cercando di fare il refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh'))
      {
        return authService.refreshToken().pipe(
          switchMap(newTokens => {
            // Riprova la richiesta originale con il nuovo Access Token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newTokens.accessToken}`
              }
            });
            return next(newReq);
          }),
          catchError(refreshError => {
            // Se anche il refresh token è scaduto o non valido, fai il logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};