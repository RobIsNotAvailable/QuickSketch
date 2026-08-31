import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommentRequest, CommentResponse } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService
{
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/comments`;

  createComment(request: CommentRequest): Observable<CommentResponse>
  {
    return this.http.post<CommentResponse>(`${this.apiUrl}/create`, request);
  }

  getSketchComments(sketchId: number, page: number = 0): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/sketch/${sketchId}?page=${page}`);
  }

  getCommentReplies(commentId: number, page: number = 0): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/replies/${commentId}?page=${page}`);
  }
}