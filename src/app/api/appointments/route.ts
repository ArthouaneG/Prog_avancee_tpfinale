import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSlotAvailable } from '@/lib/availability';
import { parseISO } from 'date-fns';
import { sendAppointmentConfirmationEmail } from '@/lib/email';

// GET - Récupérer tous les rendez-vous
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau rendez-vous
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, email, carBrand, date, timeSlot } = body;

    // Validation des champs
    if (!clientName || !email || !carBrand || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    const appointmentDate = parseISO(date);

    // Vérifier la disponibilité
    const available = await isSlotAvailable(appointmentDate, timeSlot);
    if (!available) {
      return NextResponse.json(
        { error: 'Ce créneau n\'est plus disponible' },
        { status: 409 }
      );
    }

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        email,
        carBrand,
        date: appointmentDate,
        timeSlot,
      },
    });

    // Envoyer l'email de confirmation (de manière asynchrone, sans bloquer la réponse)
    sendAppointmentConfirmationEmail(appointment, false).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rendez-vous' },
      { status: 500 }
    );
  }
}
