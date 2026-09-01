import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { ErrorModalComponent } from './shared/components/error-modal/error-modal';

@Component(
{
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ErrorModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App
{
  title = 'frontend';
}