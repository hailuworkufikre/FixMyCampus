// PATH: src/app/features/user/tickets/ticket-list/ticket-list.ts  (NEW file)
// One component, three screens (chosen by route data "mode"):
//   feed  -> /tickets/feed   campus feed (everyone, filter by building/status)
//   my    -> /tickets/my     only the tickets I reported
//   admin -> /admin/tickets  admin dashboard (open tickets + counts per building)
import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { TicketService } from '../../../../core/services/ticket.service';
import { Ticket } from '../../../../models/ticket.models';
import {
  BUILDING_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  TicketStatus,
  UserRole,
  labelOf
} from '../../../../models/enums';

type Mode = 'feed' | 'my' | 'admin';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './ticket-list.html'
})
export class TicketList implements OnInit {

  readonly buildings = BUILDING_OPTIONS;
  readonly statuses = STATUS_OPTIONS;
  readonly OPEN = -1;   // admin-only filter value: everything except Resolved

  mode: Mode = 'feed';

  tickets = signal<Ticket[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  buildingFilter: number | null = null;
  statusFilter: number | null = null;

  // Admin extra: number of open tickets per building
  buildingCounts = computed(() =>
    BUILDING_OPTIONS
      .map((b: { label: string; value: number }) => ({
        label: b.label,
        count: this.tickets().filter(
          t => t.building === b.value && t.status !== TicketStatus.Resolved).length
      }))
      .filter((x: { count: number; }) => x.count > 0)
  );

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data['mode'] as Mode) ?? 'feed';

    if (this.mode === 'admin') {
      this.statusFilter = this.OPEN;   // default: open tickets only
    }

    this.load();
  }

  get title(): string {
    switch (this.mode) {
      case 'my': return 'My Tickets';
      case 'admin': return 'Admin Dashboard - Tickets';
      default: return 'Campus Feed';
    }
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const apiStatus =
      this.statusFilter === this.OPEN ? null : this.statusFilter;

    const request$ = this.mode === 'my'
      ? this.ticketService.getMy()
      : this.ticketService.getAll(this.buildingFilter, apiStatus);

    request$.subscribe({
      next: (tickets: Ticket[]) => {
        let result = tickets;

        if (this.mode === 'my') {
          if (this.buildingFilter !== null) {
            result = result.filter((t: Ticket) => t.building === this.buildingFilter);
          }
          if (this.statusFilter !== null) {
            result = result.filter((t: Ticket) => t.status === this.statusFilter);
          }
        }

        if (this.statusFilter === this.OPEN) {
          result = result.filter((t: Ticket) => t.status !== TicketStatus.Resolved);
        }

        this.tickets.set(result);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Could not load tickets. Please try again.');
      }
    });
  }

  clearFilters(): void {
    this.buildingFilter = null;
    this.statusFilter = this.mode === 'admin' ? this.OPEN : null;
    this.load();
  }

  buildingName(v: number): string { return labelOf(BUILDING_OPTIONS, v); }
  categoryName(v: number): string { return labelOf(CATEGORY_OPTIONS, v); }
  priorityName(v: number): string { return labelOf(PRIORITY_OPTIONS, v); }
  statusName(v: number): string { return labelOf(STATUS_OPTIONS, v); }

  isAdmin(): boolean {
    return this.authService.getUser()?.role === UserRole.Admin;
  }

  goHome(): void {
    this.router.navigate([this.isAdmin() ? '/admin/tickets' : '/dashboard']);
  }

  createTicket(): void {
    this.router.navigate(['/tickets/create']);
  }

  goTechnicians(): void {
    this.router.navigate(['/admin']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
