import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar
{
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void
  {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}