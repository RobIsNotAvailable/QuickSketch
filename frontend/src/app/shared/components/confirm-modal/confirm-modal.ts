import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component
({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss'
})
export class ConfirmModal
{
  @Input() title: string = 'Are you sure?';
  @Input() message: string = '';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void
  {
    this.confirm.emit();
  }

  onCancel(): void
  {
    this.cancel.emit();
  }
}