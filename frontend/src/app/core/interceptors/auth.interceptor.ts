import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

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
        if (!isRefreshing)
        {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response) =>
            {
              isRefreshing = false;
              refreshTokenSubject.next(response.jwt);
              
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
              isRefreshing = false;
              
              if (!(refreshError.error?.message?.includes("Token not found") || refreshError.error === "Token not found"))
              {
                errorService.showError(refreshError.error);
              }
              
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }
        else
        {
          return refreshTokenSubject.pipe(
            filter(newToken => newToken !== null),
            take(1),
            switchMap((jwt) =>
            {
              const newReq = req.clone(
              {
                setHeaders:
                {
                  Authorization: `Bearer ${jwt}`
                }
              });
              return next(newReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};