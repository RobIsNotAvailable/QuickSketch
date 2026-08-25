import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component
({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login
{
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: LoginRequest =
  {
    key: '',
    password: ''
  };

  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  toggleShowPassword(): void
  {
    this.showPassword.update(val => !val);
  }

  isFormValid(): boolean
  {
    return (
      this.credentials.key.trim() !== '' &&
      this.credentials.password.trim() !== ''
    );
  }

  onSubmit(): void
  {
    if (!this.isFormValid())
    {
      return;
    }
    
    this.errorMessage.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Invalid credentials');
      }
    });
  }
}