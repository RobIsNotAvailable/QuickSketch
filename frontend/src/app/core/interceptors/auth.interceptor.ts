import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

export const authInterceptor: HttpInterceptorFn = (req, next) =>
{
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);
  const token = authService.getAccessToken();

  let authReq = req;

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register') && !req.url.includes('/auth/refresh'))
  {
    authReq = req.clone(
    {
      setHeaders:
      {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) =>
    {
      if (error.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login') && !req.url.includes('/auth/logout'))
      {
        return authService.refreshToken().pipe(
          switchMap((response) =>
          {
            const newReq = req.clone(
            {
              setHeaders:
              {
                Authorization: `Bearer ${response.jwt}`
              }
            });
            return next(newReq);
          }),
          catchError((refreshError: HttpErrorResponse) =>
          {
            const msg = refreshError.error;
            
            errorService.showError(msg);
            authService.logout();
            
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};