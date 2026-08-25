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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    this.currentUser.set(null);
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
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('username', response.username);
    this.currentUser.set(response.username);
  }
}