// PATH: src/app/features/user/tickets/ticket-detail/ticket-detail.ts  (NEW file)
import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { TicketService } from '../../../../core/services/ticket.service';
import { TechnicianItem, Ticket } from '../../../../models/ticket.models';
import {
  BUILDING_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  TicketStatus,
  UserRole,
  labelOf
} from '../../../../models/enums';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './ticket-detail.html'
})
export class TicketDetail implements OnInit {

  ticket = signal<Ticket | null>(null);
  technicians = signal<TechnicianItem[]>([]);

  loading = signal(true);
  busy = signal(false);
  errorMessage = signal('');     // loading errors
  actionError = signal('');      // errors from assign / status change (e.g. 400)
  actionSuccess = signal('');

  selectedTechnicianId: number | null = null;
  comment = '';

  private ticketId = 0;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadTicket();

    if (this.isAdmin()) {
      this.ticketService.getTechnicians().subscribe({
        next: (list: TechnicianItem[]) => this.technicians.set(list.filter((t: TechnicianItem) => t.isAvailable)),
        error: () => this.technicians.set([])
      });
    }
  }

  loadTicket(): void {
    this.loading.set(true);

    this.ticketService.getById(this.ticketId).subscribe({
      next: (ticket: Ticket) => {
        this.ticket.set(ticket);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.status === 404
            ? 'Ticket not found.'
            : error.error?.message || 'Could not load the ticket.');
      }
    });
  }

  // ---------- permissions (UI only - the API enforces them for real) ----------
  isAdmin(): boolean {
    return this.authService.getUser()?.role === UserRole.Admin;
  }

  canMoveStatus(): boolean {
    const role = this.authService.getUser()?.role;
    return role === UserRole.Admin || role === UserRole.Technician;
  }

  canAssign(): boolean {
    return this.isAdmin() && this.ticket()?.status === TicketStatus.New;
  }

  // The only status the UI offers is the next step; the server re-checks it.
  nextStatus(): TicketStatus | null {
    const status = this.ticket()?.status;

    if (status === TicketStatus.Assigned) return TicketStatus.InProgress;
    if (status === TicketStatus.InProgress) return TicketStatus.Resolved;
    return null;
  }

  nextStatusLabel(): string {
    const next = this.nextStatus();
    return next === null ? '' : this.statusName(next);
  }

  // ---------- actions ----------
  assign(): void {
    if (this.selectedTechnicianId === null) {
      this.actionError.set('Please select a technician first.');
      return;
    }
    this.run(this.ticketService.assign(this.ticketId, this.selectedTechnicianId),
             'Technician assigned.');
  }

  advance(): void {
    const next = this.nextStatus();
    if (next === null) return;

    this.run(
      this.ticketService.updateStatus(this.ticketId, next, this.comment.trim() || undefined),
      `Status changed to ${this.statusName(next)}.`);
    this.comment = '';
  }

  private run(request$: ReturnType<TicketService['assign']>, successText: string): void {
    this.busy.set(true);
    this.actionError.set('');
    this.actionSuccess.set('');

    request$.subscribe({
      next: (ticket: Ticket) => {
        this.ticket.set(ticket);
        this.busy.set(false);
        this.actionSuccess.set(successText);
      },
      error: (error: any) => {
        this.busy.set(false);
        // 400 from the server (illegal skip / backward move) is shown here
        this.actionError.set(
          error.error?.message || 'The action failed. Please try again.');
      }
    });
  }

  // ---------- labels ----------
  buildingName(v: number): string { return labelOf(BUILDING_OPTIONS, v); }
  categoryName(v: number): string { return labelOf(CATEGORY_OPTIONS, v); }
  priorityName(v: number): string { return labelOf(PRIORITY_OPTIONS, v); }
  statusName(v: number): string { return labelOf(STATUS_OPTIONS, v); }

  goBack(): void {
    this.router.navigate([this.isAdmin() ? '/admin/tickets' : '/tickets/feed']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
