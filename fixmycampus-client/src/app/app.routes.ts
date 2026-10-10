// PATH: src/app/app.routes.ts  (replace whole file)
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { UserRole } from './models/enums';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/user/dashboard/dashboard').then(m => m.Dashboard)
  },

  // ---------- Admin ----------
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([UserRole.Admin])],
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard').then(m => m.Dashboard)
  },
  
  // ---------- Tickets ----------
  {
    path: 'tickets/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/user/tickets/create-ticket/create-ticket')
        .then(m => m.CreateTicket)
  },
  {
    path: 'tickets/feed',
    canActivate: [authGuard],
    data: { mode: 'feed' },
    loadComponent: () =>
      import('./features/user/tickets/ticket-list/ticket-list').then(m => m.TicketList)
  },
  {
    path: 'tickets/my',
    canActivate: [authGuard],
    data: { mode: 'my' },
    loadComponent: () =>
      import('./features/user/tickets/ticket-list/ticket-list').then(m => m.TicketList)
  },
  {
    // keep this AFTER create / feed / my
    path: 'tickets/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/user/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetail)
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
