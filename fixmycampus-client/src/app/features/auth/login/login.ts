import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../models/auth.models';
import { UserRole } from '../../../models/enums';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginData)
      .subscribe({
        next: (response) => {

          this.isLoading = false;

          if (response.role === UserRole.Admin) {

            this.router.navigate(['/admin']);

          } else if (response.role === UserRole.Technician) {

            this.router.navigate(['/technician']);

          } else {

            this.router.navigate(['/dashboard']);

          }
        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Login failed. Please check your email and password.';
        }
      });
  }
}