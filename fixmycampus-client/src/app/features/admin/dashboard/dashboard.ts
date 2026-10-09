import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../../core/services/ticket';
import { Ticket } from '../../../models/ticket.models';
import { TicketStatus } from '../../../models/enums';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  tickets: Ticket[] = [];

  technician = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    specialization: 0,
    isAvailable: true,
  };

  message = '';
  errorMessage = '';
  ticketErrorMessage = '';

  isLoading = false;
  isLoadingTickets = false;

  private readonly apiUrl = 'http://localhost:5176/api/Technicians';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private ticketService: TicketService,
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  // Load all campus tickets from the backend
  loadTickets(): void {
    this.isLoadingTickets = true;
    this.ticketErrorMessage = '';

    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        console.log('Tickets response:', response);

        this.tickets = response;
        this.isLoadingTickets = false;
      },
      error: (error) => {
        console.error('Tickets request failed:', error);

        this.isLoadingTickets = false;
        this.ticketErrorMessage = error.error?.message || 'Failed to load tickets.';
      },
    });
  }

  // Dashboard statistics
  get totalTickets(): number {
    return this.tickets.length;
  }

  get newTickets(): number {
    return this.tickets.filter((ticket) => ticket.status === TicketStatus.New).length;
  }

  get inProgressTickets(): number {
    return this.tickets.filter((ticket) => ticket.status === TicketStatus.InProgress).length;
  }

  get resolvedTickets(): number {
    return this.tickets.filter((ticket) => ticket.status === TicketStatus.Resolved).length;
  }

  // Convert numeric ticket status into readable text
  getStatusName(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.New:
        return 'New';

      case TicketStatus.Assigned:
        return 'Assigned';

      case TicketStatus.InProgress:
        return 'In Progress';

      case TicketStatus.Resolved:
        return 'Resolved';

      default:
        return 'Unknown';
    }
  }

  // Register a new technician
  createTechnician(): void {
    this.message = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.http.post<any>(this.apiUrl, this.technician).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Technician created successfully.';

        this.technician = {
          fullName: '',
          email: '',
          password: '',
          phoneNumber: '',
          specialization: 0,
          isAvailable: true,
        };
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create technician.';
      },
    });
  }

  // Log out the current administrator
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
