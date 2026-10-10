// PATH: src/app/features/user/tickets/create-ticket/create-ticket.ts  (replace whole file)
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TicketService } from '../../../../core/services/ticket.service';
import {
  BUILDING_OPTIONS,
  Building,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  TicketCategory,
  TicketPriority
} from '../../../../models/enums';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-ticket.html',
  styleUrl: './create-ticket.scss'
})
export class CreateTicket {

  readonly buildings = BUILDING_OPTIONS;
  readonly categories = CATEGORY_OPTIONS;
  readonly priorities = PRIORITY_OPTIONS;

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  private fb = inject(FormBuilder);

  // Reactive form with client-side validation
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    building: [Building.MainLibrary as number, [Validators.required]],
    room: ['', [Validators.required, Validators.maxLength(50)]],
    category: [TicketCategory.Electrical as number, [Validators.required]],
    priority: [TicketPriority.Medium as number, [Validators.required]]
  });

  constructor(
    private ticketService: TicketService,
    private router: Router
  ) {}

  // shortcut used by the template to show errors only after the user touched a field
  showError(name: 'title' | 'description' | 'room'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  createTicket(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const value = this.form.getRawValue();

    this.ticketService.create({
      title: value.title.trim(),
      description: value.description.trim(),
      building: value.building,
      room: value.room.trim(),
      category: value.category,
      priority: value.priority
    }).subscribe({
      next: (ticket) => {
        this.isLoading.set(false);
        this.successMessage.set('Ticket created successfully!');
        this.form.reset({
          title: '',
          description: '',
          building: Building.MainLibrary,
          room: '',
          category: TicketCategory.Electrical,
          priority: TicketPriority.Medium
        });
        // open the new ticket so the reporter can see its state
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to create ticket. Please check the form and try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
