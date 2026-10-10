// PATH: src/app/models/enums.ts  (replace whole file)
export enum UserRole {
  User = 1,
  Technician = 2,
  Admin = 3
}

export enum TicketStatus {
  New = 0,
  Assigned = 1,
  InProgress = 2,
  Resolved = 3
}

export enum TicketPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3
}

export enum Building {
  MainLibrary = 0,
  EngineeringBuilding = 1,
  ScienceBuilding = 2,
  ComputerScienceBuilding = 3,
  AdministrationBuilding = 4,
  StudentCenter = 5
}

// Must match FixmyCampus.Domain.Enums.TicketCategory on the backend
export enum TicketCategory {
  Electrical = 0,
  Plumbing = 1,
  Furniture = 2,
  Network = 3,
  Cleaning = 4,
  Other = 5
}

export interface Option {
  value: number;
  label: string;
}

export const STATUS_OPTIONS: Option[] = [
  { value: TicketStatus.New, label: 'New' },
  { value: TicketStatus.Assigned, label: 'Assigned' },
  { value: TicketStatus.InProgress, label: 'In Progress' },
  { value: TicketStatus.Resolved, label: 'Resolved' }
];

export const BUILDING_OPTIONS: Option[] = [
  { value: Building.MainLibrary, label: 'Main Library' },
  { value: Building.EngineeringBuilding, label: 'Engineering Building' },
  { value: Building.ScienceBuilding, label: 'Science Building' },
  { value: Building.ComputerScienceBuilding, label: 'Computer Science Building' },
  { value: Building.AdministrationBuilding, label: 'Administration Building' },
  { value: Building.StudentCenter, label: 'Student Center' }
];

export const CATEGORY_OPTIONS: Option[] = [
  { value: TicketCategory.Electrical, label: 'Electrical' },
  { value: TicketCategory.Plumbing, label: 'Plumbing / Water' },
  { value: TicketCategory.Furniture, label: 'Furniture' },
  { value: TicketCategory.Network, label: 'Network / Wi-Fi' },
  { value: TicketCategory.Cleaning, label: 'Cleaning' },
  { value: TicketCategory.Other, label: 'Other' }
];

export const PRIORITY_OPTIONS: Option[] = [
  { value: TicketPriority.Low, label: 'Low' },
  { value: TicketPriority.Medium, label: 'Medium' },
  { value: TicketPriority.High, label: 'High' },
  { value: TicketPriority.Urgent, label: 'Urgent' }
];

export function labelOf(options: Option[], value: number | null | undefined): string {
  return options.find(o => o.value === value)?.label ?? '-';
}
