import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSlotAvailable } from '@/lib/availability';
import { parseISO } from 'date-fns';
import { sendAppointmentConfirmationEmail, sendCancellationEmail } from '@/lib/email';

// GET - Récupérer un rendez-vous spécifique
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un rendez-vous
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { clientName, email, carBrand, date, timeSlot } = body;

    // Vérifier si le rendez-vous existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Si la date ou l'heure change, vérifier la disponibilité
    if (date && timeSlot) {
      const appointmentDate = parseISO(date);
      
      // Vérifier la disponibilité uniquement si c'est un nouveau créneau
      const dateChanged = appointmentDate.toISOString() !== existingAppointment.date.toISOString();
      const timeChanged = timeSlot !== existingAppointment.timeSlot;
      
      if (dateChanged || timeChanged) {
        const available = await isSlotAvailable(appointmentDate, timeSlot);
        if (!available) {
          return NextResponse.json(
            { error: 'Ce créneau n\'est plus disponible. Veuillez choisir un autre créneau.' },
            { status: 409 }
          );
        }
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    if (clientName !== undefined) updateData.clientName = clientName;
    if (email !== undefined) updateData.email = email;
    if (carBrand !== undefined) updateData.carBrand = carBrand;
    if (date !== undefined) updateData.date = parseISO(date);
    if (timeSlot !== undefined) updateData.timeSlot = timeSlot;

    // Mettre à jour le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Envoyer l'email de modification (si date ou heure a changé)
    if (date || timeSlot) {
      sendAppointmentConfirmationEmail(updatedAppointment, true).catch(err => {
        console.error('Failed to send modification email:', err);
      });
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un rendez-vous
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Récupérer le rendez-vous avant de le supprimer pour l'email
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }
    
    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    // Envoyer l'email d'annulation
    sendCancellationEmail(appointment).catch(err => {
      console.error('Failed to send cancellation email:', err);
    });

    return NextResponse.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rendez-vous' },
      { status: 500 }
    );
  }
}
