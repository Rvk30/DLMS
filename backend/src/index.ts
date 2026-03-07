import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import transactionRoutes from './routes/transaction.routes';
import fineRoutes from './routes/fine.routes';
import adminRoutes from './routes/admin.routes';

// Import error handler
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import email + scheduler
import { verifyMailConnection } from './config/mailer';
import { startNotificationScheduler } from './utils/notification.scheduler';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging (dev only) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'DLMS API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 & Global Error Handler ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
    console.log(`
╔════════════════════════════════════════╗
║     DLMS Backend API is running        ║
║     Mode  : ${process.env.NODE_ENV?.padEnd(26)}║
║     Port  : ${String(PORT).padEnd(26)}║
╚════════════════════════════════════════╝
  `);

    // Verify SMTP connection
    await verifyMailConnection();

    // Start scheduled email jobs (due-date reminders, overdue alerts)
    startNotificationScheduler();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
});

export default app;
