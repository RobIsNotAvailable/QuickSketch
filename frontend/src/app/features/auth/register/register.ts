import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register
{
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };

  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  toggleShowPassword(): void
  {
    this.showPassword.update(val => !val);
  }

  onSubmit(): void
  {
    this.errorMessage.set(null);

    this.authService.register(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Registration failed');
      }
    });
  }
}