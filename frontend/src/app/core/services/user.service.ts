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

  toggleFollow(targetUserId: number): Observable<boolean>
  {
    return this.http.post<boolean>(`${this.apiUrl}/${targetUserId}/follow`, {});
  }
}