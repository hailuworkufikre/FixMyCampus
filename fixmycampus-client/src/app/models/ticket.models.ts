import {
  Building,
  TicketPriority,
  TicketStatus
} from './enums';

export interface CreateTicketRequest {
  title: string;
  description: string;
  building: Building;
  room: string;
  category: number;
  priority: TicketPriority;
}

export interface AssignTicketRequest {
  technicianId: number;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  building: Building;
  room: string;
  category: number;
  priority: TicketPriority;
  status: TicketStatus;

  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;

  createdById: number;
  createdByName?: string;

  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
}