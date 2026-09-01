import { Component, inject } from '@angular/core';
import { ErrorService } from '../../../core/services/error.service';

@Component({
    selector: 'app-error-modal',
    standalone: true,
    templateUrl: 'error-modal.html',
    styleUrl: '../modal.scss'
})
export class ErrorModalComponent
{
    errorService = inject(ErrorService);

    close(): void
    {
        this.errorService.clearError();
    } 
}