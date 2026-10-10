// PATH: src/app/models/ticket.models.ts  (replace whole file)
import {
  Building,
  TicketCategory,
  TicketPriority,
  TicketStatus
} from './enums';

export interface CreateTicketRequest {
  title: string;
  description: string;
  building: Building;
  room: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export interface AssignTicketRequest {
  technicianId: number;
}

export interface UpdateStatusRequest {
  status: TicketStatus;
  comment?: string;
}

export interface TicketHistory {
  oldStatus: TicketStatus;
  newStatus: TicketStatus;
  changedAt: string;
  changedByName?: string;
  comment?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  building: Building;
  room: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;

  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;

  createdById: number;
  createdByName?: string;

  assignedTechnicianId?: number;
  assignedTechnicianName?: string;

  history: TicketHistory[];
}

export interface TechnicianItem {
  id: number;
  fullName: string;
  specialization: number;
  isAvailable: boolean;
}
