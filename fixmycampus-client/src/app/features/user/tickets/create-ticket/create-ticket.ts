
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-ticket.html',
  styleUrl: './create-ticket.scss'
})
export class CreateTicket {

  ticket = {
    title: '',
    description: '',
    building: 0,
    room: '',
    category: 0,
    priority: 1
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private readonly apiUrl =
    'http://localhost:5176/api/Tickets';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  createTicket(): void {

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.http.post(
      this.apiUrl,
      this.ticket
    ).subscribe({

      next: () => {

        this.isLoading = false;

        this.successMessage =
          'Ticket created successfully!';

        this.ticket = {
          title: '',
          description: '',
          building: 0,
          room: '',
          category: 0,
          priority: 1
        };

      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Failed to create ticket.';
      }

    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
