# Configuration pour base de données en ligne (PostgreSQL)
# 
# Pour utiliser une base de données en production sur Vercel :
# 
# 1. Créer une base de données PostgreSQL gratuite sur :
#    - Neon (https://neon.tech) - Recommandé
#    - Supabase (https://supabase.com)
#    - Vercel Postgres
#
# 2. Modifier prisma/schema.prisma :
#    datasource db {
#      provider = "postgresql"
#      url      = env("DATABASE_URL")
#    }
#
# 3. Sur Vercel, ajouter la variable d'environnement :
#    DATABASE_URL=postgresql://user:password@host/database
#
# 4. Exécuter les migrations :
#    npx prisma migrate deploy
#
# Note: SQLite ne fonctionne pas sur Vercel car il n'y a pas de système 
# de fichiers persistant dans un environnement serverless.
