import { PrismaClient } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
//  Singleton Prisma Client
//  In development, Next.js hot-reload creates multiple instances.
//  We store one instance on `global` to avoid exhausting the
//  connection pool.
// ─────────────────────────────────────────────────────────────

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
    global.__prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}
