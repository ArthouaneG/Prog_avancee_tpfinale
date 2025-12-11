import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Création du compte employé par défaut...\n');

  // Compte administrateur
  const adminEmail = 'admin@pneuexpress.com';
  const adminPassword = 'admin123';

  // Vérifier si le compte existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('ℹ️  Le compte admin existe déjà');
    console.log(`📧 Email: ${existingAdmin.email}`);
    console.log(`👤 Nom: ${existingAdmin.name}`);
    console.log(`🔑 Rôle: ${existingAdmin.role}\n`);
  } else {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Créer le compte
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrateur',
        role: 'admin',
      },
    });

    console.log('✅ Compte admin créé avec succès!\n');
    console.log('📋 Informations de connexion:');
    console.log('─'.repeat(50));
    console.log(`📧 Email:        ${admin.email}`);
    console.log(`🔑 Mot de passe: ${adminPassword}`);
    console.log(`👤 Nom:          ${admin.name}`);
    console.log(`🛡️  Rôle:         ${admin.role}`);
    console.log('─'.repeat(50));
    console.log('\n💡 Utilisez ces identifiants pour vous connecter à /login\n');
  }

  // Créer un compte employé supplémentaire si nécessaire
  const employeeEmail = 'employe@pneuexpress.com';
  const employeePassword = 'employe123';

  const existingEmployee = await prisma.user.findUnique({
    where: { email: employeeEmail },
  });

  if (!existingEmployee) {
    const hashedPassword = await bcrypt.hash(employeePassword, 10);
    
    const employee = await prisma.user.create({
      data: {
        email: employeeEmail,
        password: hashedPassword,
        name: 'Employé Test',
        role: 'employee',
      },
    });

    console.log('✅ Compte employé créé avec succès!\n');
    console.log('📋 Informations de connexion:');
    console.log('─'.repeat(50));
    console.log(`📧 Email:        ${employee.email}`);
    console.log(`🔑 Mot de passe: ${employeePassword}`);
    console.log(`👤 Nom:          ${employee.name}`);
    console.log(`🛡️  Rôle:         ${employee.role}`);
    console.log('─'.repeat(50));
  }

  console.log('\n🎉 Configuration terminée!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
