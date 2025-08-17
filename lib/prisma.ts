import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Compute a connection URL that is safe for PgBouncer/serverless by disabling prepared statements
const rawDatabaseUrl = process.env.DATABASE_URL || ''
const databaseUrl = rawDatabaseUrl
  ? (rawDatabaseUrl.includes('?')
      ? `${rawDatabaseUrl}&pgbouncer=true&connection_limit=1`
      : `${rawDatabaseUrl}?pgbouncer=true&connection_limit=1`)
  : rawDatabaseUrl

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  // Serverless tuning
  ...(process.env.NODE_ENV === 'production' && {
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
  }),
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Do not forcibly disconnect on every invocation; serverless functions are short-lived

