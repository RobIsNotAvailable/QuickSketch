import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { ErrorModalComponent } from './shared/components/error-modal/error-modal';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { environment } from '../environments/environment';

@Component(
{
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ErrorModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit 
{
    private readonly apiUrl = `${environment.apiUrl}/bombo`;

    private http = inject(HttpClient);

    ngOnInit() 
    {
        interval(300000).subscribe(() => 
        {
            this.http.get(this.apiUrl, { responseType: 'text' }).subscribe();
        });
    }
}