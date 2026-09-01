import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component
({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login
{
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm = this.fb.nonNullable.group
  ({
    key: ['', Validators.required],
    password: ['', Validators.required]
  });

  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  toggleShowPassword(): void
  {
    this.showPassword.update(val => !val);
  }

  onSubmit(): void
  {
    if (this.loginForm.invalid)
    {
      return;
    }
    
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe
    ({
      next: () => 
      {
        this.router.navigate(['/']);
      },
      error: (err) => 
      {
        this.errorMessage.set(err.error?.message || 'Invalid credentials');
      }
    });
  }
}