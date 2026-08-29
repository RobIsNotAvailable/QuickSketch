import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SketchInitResponse } from '../models/sketch.model';

export interface CreateSketchRequest
{
  imageData: string;
  wordId: number;
}

@Injectable
({
  providedIn: 'root'
})
export class SketchService
{
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sketches`;

  initSketchSession(): Observable<SketchInitResponse>
  {
    return this.http.get<SketchInitResponse>(`${this.apiUrl}/init`);
  }

  createSketch(request: CreateSketchRequest): Observable<any>
  {
    return this.http.post<any>(`${this.apiUrl}/create`, request);
  }
}