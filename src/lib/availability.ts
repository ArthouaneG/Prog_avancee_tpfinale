import { prisma } from './prisma';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

// Configuration du garage
export const GARAGE_CONFIG = {
  openingTime: 8, // 8h00
  closingTime: 16, // 16h00
  appointmentDuration: 60, // minutes
  maxConcurrentAppointments: 3, // 3 places de travail
  workDays: [1, 2, 3, 4, 5], // Lundi à Vendredi
};

// Génère tous les créneaux horaires disponibles pour une journée
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = GARAGE_CONFIG.openingTime; hour < GARAGE_CONFIG.closingTime; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

// Vérifie si une date est un jour ouvrable
export function isWorkDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return GARAGE_CONFIG.workDays.includes(dayOfWeek);
}

// Obtient le nombre de rendez-vous pour un créneau spécifique
export async function getAppointmentCountForSlot(date: Date, timeSlot: string): Promise<number> {
  const startOfDayDate = startOfDay(date);
  const endOfDayDate = endOfDay(date);

  const count = await prisma.appointment.count({
    where: {
      date: {
        gte: startOfDayDate,
        lte: endOfDayDate,
      },
      timeSlot: timeSlot,
    },
  });

  return count;
}

// Vérifie si un créneau est disponible
export async function isSlotAvailable(date: Date, timeSlot: string): Promise<boolean> {
  if (!isWorkDay(date)) {
    return false;
  }

  const count = await getAppointmentCountForSlot(date, timeSlot);
  return count < GARAGE_CONFIG.maxConcurrentAppointments;
}

// Obtient tous les créneaux disponibles pour une date
export async function getAvailableSlotsForDate(dateString: string) {
  const date = parseISO(dateString);
  
  if (!isWorkDay(date)) {
    return [];
  }

  const allSlots = generateTimeSlots();
  const availableSlots = [];

  for (const slot of allSlots) {
    const isAvailable = await isSlotAvailable(date, slot);
    if (isAvailable) {
      availableSlots.push(slot);
    }
  }

  return availableSlots;
}
