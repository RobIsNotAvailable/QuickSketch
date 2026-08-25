import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component
({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './feed.scss',
  templateUrl: './feed.html',
})
export class Feed
{
  authService = inject(AuthService);
}