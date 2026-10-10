// PATH: src/app/core/guards/role-guard.ts  (NEW file)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../models/enums';

// Usage in routes:  canActivate: [authGuard, roleGuard([UserRole.Admin])]
// (The API still checks the role on every request - this only hides pages.)
export const roleGuard = (allowed: UserRole[]): CanActivateFn => () => {
  const router = inject(Router);

  const raw = localStorage.getItem('user');
  const role: UserRole | null = raw ? JSON.parse(raw).role : null;

  if (role !== null && allowed.includes(role)) {
    return true;
  }

  return router.createUrlTree([role === null ? '/login' : '/dashboard']);
};
