// PATH: src/app/features/admin/dashboard/dashboard.ts  (replace whole file)
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  technician = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    specialization: 0,
    isAvailable: true
  };

  message = '';
  errorMessage = '';
  isLoading = false;

  private readonly apiUrl =
    `${environment.apiUrl}/technicians`;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  createTechnician(): void {

    this.message = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.http.post<any>(
      this.apiUrl,
      this.technician
    ).subscribe({

      next: (response) => {

        this.isLoading = false;

        this.message =
          'Technician created successfully.';

        console.log(response);

        this.technician = {
          fullName: '',
          email: '',
          password: '',
          phoneNumber: '',
          specialization: 0,
          isAvailable: true
        };
      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Failed to create technician.';
      }
    });
  }

  goTickets(): void {
    this.router.navigate(['/admin/tickets']);
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
