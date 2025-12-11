import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlotsForDate } from '@/lib/availability';

// GET - Récupérer les créneaux disponibles pour une date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'La date est requise' },
        { status: 400 }
      );
    }

    const availableSlots = await getAvailableSlotsForDate(date);

    return NextResponse.json({ date, slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des créneaux disponibles' },
      { status: 500 }
    );
  }
}
