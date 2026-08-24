import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService
{
  private readonly API_URL = 'http://localhost:8080/api/auth';
  
  currentUser = signal<string | null>(localStorage.getItem('username'));

  constructor(private http: HttpClient)
  {
  }

  register(credentials: RegisterRequest): Observable<AuthResponse>
  {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, credentials).pipe(
      tap(response => this.saveTokens(response))
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse>
  {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.saveTokens(response))
    );
  }

  logout(): void
  {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    this.currentUser.set(null);
  }

  refreshToken(): Observable<AuthResponse>
  {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(response => this.saveTokens(response))
    );
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
    localStorage.setItem('userId', response.userId.toString());
    this.currentUser.set(response.username);
  }
}