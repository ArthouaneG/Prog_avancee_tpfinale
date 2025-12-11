# 🔧 PneuExpress - Application de Gestion de Rendez-vous

Application web moderne et professionnelle pour la gestion des rendez-vous de changement de pneus chez PneuExpress.

## ✨ Fonctionnalités

### Pour les Clients
- **Système d'authentification** : Inscription et connexion sécurisées
- **Calendrier interactif** : Navigation entre les semaines avec visualisation des disponibilités
- **Réservation en ligne** : Sélection facile de la date et de l'heure
- **Gestion des rendez-vous** : Visualisation, modification et suivi des rendez-vous personnels
- **Disponibilité en temps réel** : Maximum 3 rendez-vous par créneau horaire
- **Persistance des données** : Informations client sauvegardées pour faciliter les réservations futures
- **Notifications email automatiques** : Confirmations et rappels par email
- **Interface responsive** : Design moderne adapté à tous les appareils

### Pour les Employés (Admin)
- **Tableau de bord complet** : Vue d'ensemble de tous les rendez-vous
- **Gestion CRUD** : Créer, modifier et supprimer des rendez-vous
- **Filtrage avancé** : 
  - Tous les rendez-vous
  - Rendez-vous d'aujourd'hui
  - Rendez-vous de la semaine
  - Rendez-vous du mois
  - Plage de dates personnalisée
- **Statistiques en temps réel** : 
  - Total des rendez-vous
  - Rendez-vous du jour
  - Nombre de dates uniques
- **Regroupement par date** : Organisation claire et chronologique
- **Notifications email** : Confirmations automatiques aux clients

## ⚙️ Configuration du Garage

- **Horaires** : Lundi au vendredi, 8h00 à 16h00
- **Durée des rendez-vous** : 60 minutes (créneaux horaires)
- **Places disponibles** : 3 postes de travail simultanés
- **Jours fermés** : Weekend (samedi et dimanche)
- **Limite de réservation** : Jusqu'à 4 semaines à l'avance

## 🛠️ Technologies Utilisées

- **Framework** : Next.js 16 (React 19, App Router)
- **Langage** : TypeScript
- **Build Tool** : Turbopack
- **Base de données** : SQLite avec Prisma ORM 5.22.0
- **Authentification** : JWT avec jose, bcryptjs pour le hachage
- **Styling** : Tailwind CSS 4
- **Gestion des dates** : date-fns 4.1.0 avec locale française
- **Emails** : Nodemailer avec templates HTML
- **Validation** : Vérification des emails et disponibilités côté serveur

## 📦 Installation et Démarrage

### Prérequis
- Node.js 18+ et npm
- Git (optionnel)

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd pneuexpress
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

```env
# Configuration de la base de données
DATABASE_URL="file:./dev.db"

# Clé secrète pour JWT (générer une clé aléatoire sécurisée)
JWT_SECRET="votre-cle-secrete-tres-longue-et-aleatoire"

# Configuration SMTP pour l'envoi d'emails (optionnel mais recommandé)
# Pour Gmail : 
# 1. Activez la vérification en deux étapes
# 2. Générez un mot de passe d'application : https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurer la base de données
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Créer les comptes administrateurs (optionnel)
```bash
npm run create-admin
```

Comptes par défaut :
- **Admin** : admin@pneuexpress.com / admin123
- **Employé** : employe@pneuexpress.com / employe123

### 6. Démarrer le serveur de développement
```bash
npm run dev
```

### 7. Ouvrir l'application
- **Interface client** : http://localhost:3000
- **Interface admin** : http://localhost:3000/admin
- **Mes rendez-vous** : http://localhost:3000/mes-rendez-vous (après connexion)

## 📁 Structure du Projet

```
pneuexpress/
├── prisma/
│   ├── schema.prisma          # Schéma de la base de données (User + Appointment)
│   ├── dev.db                 # Base de données SQLite
│   └── migrations/            # Migrations de la base de données
├── src/
│   ├── app/
│   │   ├── page.tsx          # Page d'accueil (réservation)
│   │   ├── login/            # Page de connexion
│   │   ├── register/         # Page d'inscription
│   │   ├── mes-rendez-vous/  # Gestion des rendez-vous clients
│   │   ├── admin/            # Tableau de bord admin
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/         # API d'authentification
│   │   │   ├── appointments/ # API des rendez-vous
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── my/route.ts
│   │   │   └── availability/ # API de disponibilité
│   │   └── globals.css       # Styles globaux + animations
│   ├── lib/
│   │   ├── prisma.ts         # Configuration Prisma
│   │   ├── availability.ts   # Logique de disponibilité
│   │   ├── auth.ts           # Fonctions d'authentification JWT
│   │   └── email.ts          # Templates et envoi d'emails
│   ├── components/
│   │   └── LoadingSpinner.tsx # Composants UI réutilisables
│   ├── types/
│   │   └── index.ts          # Types TypeScript
│   └── middleware.ts         # Protection des routes admin
├── .env.example              # Template variables d'environnement
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentification

- **POST** `/api/auth/register` - Créer un compte client
- **POST** `/api/auth/login` - Se connecter (retourne JWT)
- **POST** `/api/auth/logout` - Se déconnecter
- **GET** `/api/auth/me` - Récupérer l'utilisateur connecté

### Rendez-vous

- **GET** `/api/appointments` - Liste tous les rendez-vous (admin)
- **POST** `/api/appointments` - Créer un rendez-vous (+ email de confirmation)
- **GET** `/api/appointments/my` - Mes rendez-vous (client connecté)
- **GET** `/api/appointments/[id]` - Récupérer un rendez-vous
- **PUT** `/api/appointments/[id]` - Modifier un rendez-vous (+ email de modification)
- **DELETE** `/api/appointments/[id]` - Supprimer un rendez-vous (+ email d'annulation)

### Disponibilité

- **GET** `/api/availability?date=YYYY-MM-DD` - Créneaux disponibles pour une date

## 💾 Modèles de Données

```prisma
model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  password     String        // Haché avec bcrypt (10 rounds)
  name         String
  role         String        @default("client") // "client", "employee", "admin"
  appointments Appointment[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Appointment {
  id         Int      @id @default(autoincrement())
  clientName String
  email      String
  carBrand   String
  date       DateTime
  timeSlot   String   // Format "HH:00" (ex: "14:00")
  userId     Int?     // Optionnel (lié si utilisateur connecté)
  user       User?    @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 🎨 Interfaces Utilisateur

### Page d'Accueil (Réservation)
- Navigation entre périodes de 2 semaines
- Calendrier interactif avec affichage des disponibilités
- Sélection de date et créneaux horaires
- Formulaire de réservation (nom, email, marque de voiture)
- Persistance des informations client (localStorage)
- Vérification d'authentification obligatoire pour réserver
- Messages de succès/erreur avec animations

### Page Mes Rendez-vous (Client)
- Liste des rendez-vous personnels triés par date
- Modification inline avec sélecteur de date (30 jours)
- Grille de créneaux horaires disponibles
- Filtrage automatique des weekends
- Sauvegarde/annulation des modifications
- Design responsive

### Page Admin/Employé
- Vue complète de tous les rendez-vous
- Filtres avancés :
  - Tous les rendez-vous
  - Aujourd'hui seulement
  - Cette semaine
  - Ce mois
  - Plage de dates personnalisée
- Formulaire CRUD complet
- Statistiques en temps réel (total, aujourd'hui, dates uniques)
- Regroupement chronologique par date
- Boutons d'action (modifier/supprimer)

## 📧 Système d'Emails

### Templates HTML Professionnels

**Email de confirmation** (nouveau rendez-vous) :
- Header avec logo et couleurs de marque
- Détails complets du rendez-vous
- Informations pratiques (arriver 5min avant, durée 45min)
- Lien vers la gestion des rendez-vous
- Footer avec informations de contact

**Email de modification** :
- Template similaire avec indication de modification
- Nouvelles informations du rendez-vous

**Email d'annulation** :
- Design distinct (bordure rouge)
- Détails du rendez-vous annulé
- Lien pour prendre un nouveau rendez-vous

### Configuration SMTP

L'application utilise **Nodemailer** avec support de plusieurs fournisseurs :
- Gmail (recommandé pour le développement)
- Outlook/Office365
- SendGrid, Mailgun (production)
- SMTP personnalisé

## 🔒 Sécurité et Validations

### Authentification
- Mots de passe hachés avec **bcryptjs** (10 rounds)
- Tokens JWT signés avec **jose** (24h d'expiration)
- Cookies HTTP-only pour les sessions
- Middleware de protection des routes admin
- Vérification des rôles (client/employee/admin)

### Validations
- Format email (regex côté client et serveur)
- Vérification de disponibilité en temps réel
- Limite stricte de 3 rendez-vous par créneau
- Validation des dates (jours ouvrables uniquement)
- Protection contre les doubles réservations
- Validation des créneaux horaires (8h-16h)

### Données
- Sanitization des entrées utilisateur
- Requêtes Prisma paramétrées (protection SQL injection)
- CORS et headers de sécurité Next.js

## 🎯 Fonctionnalités Clés Implémentées

✅ **Système d'authentification complet** avec rôles (client/employee/admin)  
✅ **Gestion des rendez-vous** pour les clients (visualisation, modification)  
✅ **Notifications email automatiques** (confirmation, modification, annulation)  
✅ **Filtrage avancé** dans l'admin (aujourd'hui, semaine, mois, personnalisé)  
✅ **Navigation calendrier** avec périodes de 2 semaines et limite de 4 semaines  
✅ **Persistance des données client** (localStorage pour réservations multiples)  
✅ **Validation en temps réel** des disponibilités  
✅ **Interface responsive** optimisée mobile/desktop  
✅ **Animations fluides** et transitions CSS personnalisées  
✅ **Protection des weekends** (filtrage automatique)  
✅ **Middleware de sécurité** pour routes protégées

## 🚀 Scripts Disponibles

```bash
npm run dev          # Démarrage en mode développement (Turbopack)
npm run build        # Build de production
npm run start        # Démarrage en production
npm run lint         # Vérification ESLint
npm run create-admin # Création des comptes admin/employé
```

## 🔧 Configuration Avancée

### Variables d'environnement requises

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `DATABASE_URL` | Chemin base de données SQLite | ✅ | `file:./dev.db` |
| `JWT_SECRET` | Clé secrète JWT (32+ caractères) | ✅ | `string-aleatoire-securise` |
| `SMTP_HOST` | Serveur SMTP | ⚠️ | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | ⚠️ | `587` |
| `SMTP_USER` | Utilisateur SMTP | ⚠️ | `votre-email@gmail.com` |
| `SMTP_PASS` | Mot de passe SMTP | ⚠️ | `mot-de-passe-app` |
| `NEXT_PUBLIC_APP_URL` | URL de l'application | 🔵 | `http://localhost:3000` |

⚠️ = Optionnel mais recommandé (emails désactivés si absent)  
🔵 = Optionnel (valeur par défaut disponible)

### Configuration Gmail pour SMTP

1. Activer la vérification en 2 étapes : [Google Account](https://myaccount.google.com/security)
2. Générer un mot de passe d'application : [App Passwords](https://myaccount.google.com/apppasswords)
3. Utiliser ce mot de passe dans `SMTP_PASS`

## 🐛 Dépannage

### Erreur "prisma.user does not exist"
```bash
npx prisma generate
rm -rf .next
npm run dev
```

### Problème de connexion base de données
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Emails non envoyés
- Vérifier les variables `SMTP_*` dans `.env`
- Consulter les logs du terminal (warnings affichés)
- Tester avec Gmail et un mot de passe d'application

### Erreurs TypeScript
```bash
npm install
npx prisma generate
```

## 📝 Notes de Développement

- **Turbopack** utilisé pour des builds ultra-rapides
- **React 19** avec Server Components par défaut
- **App Router** de Next.js 16 (pas de Pages Router)
- **Prisma** en mode développement avec SQLite
- **date-fns** avec locale française pour formatage dates
- **localStorage** pour données non-sensibles uniquement
- **JWT** dans cookies HTTP-only pour sécurité maximale

## 🤝 Contribution

Ce projet a été développé dans le cadre du cours de Programmation Avancée (Session 5).

## 📄 Licence

Projet éducatif - Cégep

- ✅ **Authentification admin** : Login/mot de passe pour l'accès admin
- ✅ **Envoi d'emails** : Confirmation automatique par courriel
- ✅ **Notifications** : Rappels de rendez-vous
- ✅ **Historique** : Archivage des rendez-vous passés
- ✅ **Rapports** : Statistiques avancées
- ✅ **Multi-garages** : Support de plusieurs emplacements

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer en mode développement

# Production
npm run build        # Compiler pour la production
npm start            # Démarrer en mode production

# Base de données
npx prisma studio    # Interface graphique pour la BD
npx prisma generate  # Générer le client Prisma
npx prisma migrate   # Créer/appliquer des migrations

# Linting
npm run lint         # Vérifier le code
```

## 🐛 Dépannage

### La base de données ne se crée pas
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Erreurs de client Prisma
```bash
npx prisma generate
```

### Port 3000 déjà utilisé
Modifier le port dans `package.json` :
```json
"dev": "next dev -p 3001"
```

## 📄 Licence

Projet académique - Session 5 Automne 2025

## 👨‍💻 Auteur

Développé dans le cadre du cours de Programmation Avancée
CEGEP - Session 5 Automne 2025

---

**Note** : Cette application utilise SQLite pour la simplicité du développement. Pour la production, il est recommandé de migrer vers PostgreSQL ou MySQL.

