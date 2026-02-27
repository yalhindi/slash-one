import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 1. On récupère l'URL de la base de données depuis l'environnement
const connectionString = process.env.DATABASE_URL

// 2. On crée un pool de connexion PostgreSQL natif
const pool = new Pool({ connectionString })

// 3. On lie ce pool à l'adaptateur Prisma
const adapter = new PrismaPg(pool)

// 4. On injecte l'adaptateur dans le client Prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma