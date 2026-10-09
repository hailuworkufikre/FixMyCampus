import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/user/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
  path: 'admin',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/admin/dashboard/dashboard')
      .then(m => m.Dashboard)
},

{
  path: 'technician',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/technician/dashboard/dashboard')
      .then(m => m.Dashboard)
},

{
  path: 'tickets/create',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/user/tickets/create-ticket/create-ticket')
      .then(m => m.CreateTicket)
},

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];