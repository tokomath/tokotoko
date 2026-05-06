import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const envUrl = process.env.DATABASE_URL || '';

const relativePath = envUrl.replace('file:', '');


const absolutePath = path.resolve(process.cwd(), 'prisma', relativePath);

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const adapter = new PrismaBetterSqlite3({ url: absolutePath });
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma