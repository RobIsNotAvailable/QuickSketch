import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component
({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register
{
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: RegisterRequest =
  {
    username: '',
    email: '',
    password: ''
  };

  errorMessage = signal<string | null>(null);
  fieldErrors = signal<{ [key: string]: boolean }>({});
  showPassword = signal<boolean>(false);

  togglePasswordVisibility(): void
  {
    this.showPassword.update((val) => !val);
  }

  isFormValid(): boolean
  {
    return (
      this.credentials.username.trim() !== '' &&
      this.credentials.email.trim() !== '' &&
      this.credentials.password.trim() !== ''
    );
  }

  clearFieldError(fieldName: string): void
  {
    if (this.fieldErrors()[fieldName])
    {
      this.fieldErrors.update((errors) => ({ ...errors, [fieldName]: false }));
    }
  }

  onSubmit(): void
  {
    if (!this.isFormValid())
    {
      return;
    }

    this.errorMessage.set(null);
    this.fieldErrors.set({});

    this.authService.register(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status === 0)
        {
          this.errorMessage.set('Server unreachable. Check your connection.');
          return;
        }

        const msg = typeof err.error === 'string' ? err.error : err.error?.message || '';
        this.errorMessage.set(msg || 'Registration failed. Check your data.');

        const lowerMsg = msg.toLowerCase();
        const newErrors: { [key: string]: boolean } = {};

        if (lowerMsg.includes('username'))
        {
          newErrors['username'] = true;
        }
        if (lowerMsg.includes('email'))
        {
          newErrors['email'] = true;
        }
        if (lowerMsg.includes('password'))
        {
          newErrors['password'] = true;
        }

        if (Object.keys(newErrors).length === 0)
        {
          newErrors['username'] = true;
          newErrors['email'] = true;
        }

        this.fieldErrors.set(newErrors);
      }
    });
  }
}