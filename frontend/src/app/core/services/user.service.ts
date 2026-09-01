import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable
({
  providedIn: 'root'
})
export class UserService
{
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUserProfile(userId: number): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }

  getFollowers(userId: number, page: number = 0): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/${userId}/followers?page=${page}`);
  }

  getFollowed(userId: number, page: number = 0): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/${userId}/followed?page=${page}`);
  }

  toggleFollow(targetUserId: number): Observable<boolean>
  {
    return this.http.post<boolean>(`${this.apiUrl}/${targetUserId}/follow`, {});
  }
}