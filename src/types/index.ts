export interface Appointment {
  id: number;
  clientName: string;
  email: string;
  carBrand: string;
  date: string;
  timeSlot: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityResponse {
  date: string;
  slots: string[];
}

export interface AppointmentFormData {
  clientName: string;
  email: string;
  carBrand: string;
  date: string;
  timeSlot: string;
}
