// PATH: src/app/core/services/ticket.service.ts  (NEW file)
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Building, TicketStatus } from '../../models/enums';
import {
  CreateTicketRequest,
  Ticket,
  TechnicianItem
} from '../../models/ticket.models';

@Injectable({ providedIn: 'root' })
export class TicketService {

  private readonly ticketsUrl = `${environment.apiUrl}/tickets`;
  private readonly techniciansUrl = `${environment.apiUrl}/technicians`;

  constructor(private http: HttpClient) {}

  create(request: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.ticketsUrl, request);
  }

  // Campus feed (optional filters)
  getAll(building?: Building | null, status?: TicketStatus | null): Observable<Ticket[]> {
    let params = new HttpParams();

    if (building !== null && building !== undefined) {
      params = params.set('building', building);
    }
    if (status !== null && status !== undefined) {
      params = params.set('status', status);
    }

    return this.http.get<Ticket[]>(this.ticketsUrl, { params });
  }

  getMy(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.ticketsUrl}/my`);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.ticketsUrl}/${id}`);
  }

  // Admin: New -> Assigned
  assign(id: number, technicianId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.ticketsUrl}/${id}/assign`, { technicianId });
  }

  // Admin / Technician: forward only (server validates)
  updateStatus(id: number, status: TicketStatus, comment?: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.ticketsUrl}/${id}/status`, { status, comment });
  }

  // Admin: technicians for the assign dropdown
  getTechnicians(): Observable<TechnicianItem[]> {
    return this.http.get<TechnicianItem[]>(this.techniciansUrl);
  }
}
