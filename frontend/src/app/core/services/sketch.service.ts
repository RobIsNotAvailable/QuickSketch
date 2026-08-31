import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SketchInitResponse, Sketch } from '../models/sketch.model';

export interface CreateSketchRequest
{
  imageData: string;
  wordId: number;
}

export interface GuessRequest
{
  text: string;
  sketchId: number;
}

export interface ReactRequest
{
  sketchId: number;
  reaction: 'LIKE' | 'DISLIKE';
}

@Injectable({ providedIn: 'root' })
export class SketchService
{
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sketches`;
  private readonly guessUrl = `${environment.apiUrl}/guesses`;
  private readonly reactionUrl = `${environment.apiUrl}/reactions`;

  initSketchSession(): Observable<SketchInitResponse>
  {
    return this.http.get<SketchInitResponse>(`${this.apiUrl}/init`);
  }

  createSketch(request: CreateSketchRequest): Observable<Sketch>
  {
    return this.http.post<Sketch>(`${this.apiUrl}/create`, request);
  }

  getGlobalFeed(page: number = 0): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/feed/global?page=${page}`);
  }

  getFollowedFeed(page: number = 0): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/feed/followed?page=${page}`);
  }

  guessWord(text: string, sketchId: number): Observable<any>
  {
    return this.http.post<any>(`${this.guessUrl}/guess`, { text, sketchId });
  }

  giveUp(sketchId: number): Observable<any>
  {
    return this.http.post<any>(`${this.guessUrl}/give-up/${sketchId}`, {});
  }

  react(sketchId: number, reaction: 'LIKE' | 'DISLIKE'): Observable<any>
  {
    return this.http.post<any>(`${this.reactionUrl}/react`, { sketchId: sketchId, type: reaction });
  }
}