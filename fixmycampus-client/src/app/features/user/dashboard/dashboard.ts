// PATH: src/app/features/user/dashboard/dashboard.ts  (replace whole file)

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  createTicket(): void {
    this.router.navigate(['/tickets/create']);
  }

  openMyTickets(): void {
    this.router.navigate(['/tickets/my']);
  }

  openFeed(): void {
    this.router.navigate(['/tickets/feed']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
