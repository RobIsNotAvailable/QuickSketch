import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorService
{
    errorMessage = signal<string | null>(null);

    showError(message: string): void
    {
        this.errorMessage.set(message);
    }

    clearError(): void
    {
        this.errorMessage.set(null);
    }
}