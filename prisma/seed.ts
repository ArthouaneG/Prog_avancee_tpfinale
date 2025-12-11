import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base de données
  await prisma.appointment.deleteMany();

  // Créer quelques rendez-vous de test
  const appointments = [
    {
      clientName: 'Jean Tremblay',
      email: 'jean.tremblay@example.com',
      carBrand: 'Toyota Camry',
      date: new Date('2025-12-09T08:00:00'),
      timeSlot: '08:00',
    },
    {
      clientName: 'Marie Dupuis',
      email: 'marie.dupuis@example.com',
      carBrand: 'Honda Civic',
      date: new Date('2025-12-09T09:00:00'),
      timeSlot: '09:00',
    },
    {
      clientName: 'Pierre Gagnon',
      email: 'pierre.gagnon@example.com',
      carBrand: 'Ford F-150',
      date: new Date('2025-12-09T10:00:00'),
      timeSlot: '10:00',
    },
    {
      clientName: 'Sophie Leblanc',
      email: 'sophie.leblanc@example.com',
      carBrand: 'Mazda CX-5',
      date: new Date('2025-12-10T08:00:00'),
      timeSlot: '08:00',
    },
    {
      clientName: 'Luc Martin',
      email: 'luc.martin@example.com',
      carBrand: 'Chevrolet Silverado',
      date: new Date('2025-12-10T11:00:00'),
      timeSlot: '11:00',
    },
  ];

  for (const appointment of appointments) {
    await prisma.appointment.create({
      data: appointment,
    });
  }

  console.log('✅ Base de données peuplée avec succès!');
  console.log(`📊 ${appointments.length} rendez-vous créés`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du peuplement de la base de données:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
