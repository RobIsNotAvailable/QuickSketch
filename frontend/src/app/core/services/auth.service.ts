import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService
{
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<string | null>(localStorage.getItem('username'));
  currentUserId = signal<number | null>(localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null);
  isLoggingOut = signal<boolean>(false);

  login(credentials: LoginRequest): Observable<AuthResponse>
  {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.saveTokens(response);
      })
    );
  }

  register(credentials: RegisterRequest): Observable<AuthResponse>
  {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => {
        this.saveTokens(response);
      })
    );
  }

  refreshToken(): Observable<AuthResponse>
  {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken)
    {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.saveTokens(response);
      })
    );
  }

  logout(): void
    {
      this.isLoggingOut.set(true);
      
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => {
          localStorage.clear();
          this.currentUser.set(null);
          this.currentUserId.set(null);
          this.isLoggingOut.set(false);
        },
        error: () => {
          localStorage.clear();
          this.currentUser.set(null);
          this.currentUserId.set(null);
          this.isLoggingOut.set(false);
        }
      });
    }

  getAccessToken(): string | null
  {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null
  {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean
  {
    return !!this.getAccessToken();
  }

  private saveTokens(response: AuthResponse): void
  {
    localStorage.setItem('accessToken', response.jwt);
    localStorage.setItem('refreshToken', response.refresh);

    const tokenData = this.decodeToken(response.jwt);

    if (tokenData)
    {
      const username = tokenData.username || tokenData.sub;
      const userId = tokenData.userId;

      if (username)
      {
        localStorage.setItem('username', username);
        this.currentUser.set(username);
      }

      if (userId)
      {
        localStorage.setItem('userId', userId.toString());
        this.currentUserId.set(Number(userId));
      }
    }
  }

  private decodeToken(token: string): any
  {
    try
    {
      const payload = token.split('.')[1];
      const decodedJson = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedJson);
    }
    catch (e)
    {
      console.error('Error decoding token:', e);
      return null;
    }
  }
}