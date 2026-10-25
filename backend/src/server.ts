import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import matterRoutes from './routes/matterRoutes';
import userRoutes from './routes/userRoutes';
import trustRoutes from './routes/trustRoutes';
import clientRoutes from './routes/clientRoutes';
import billingRoutes from './routes/billingRoutes';
import calendarRoutes from './routes/calendarRoutes';
import leadRoutes from './routes/leadRoutes';
import reportRoutes from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import settingsRoutes from './routes/settingsRoutes';
import documentRoutes from './routes/documentRoutes';
import messageRoutes from './routes/messageRoutes';
import taskRoutes from './routes/taskRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import invoiceRoutes from './routes/invoiceRoutes';

// Load environment variables safely for production or local development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
} else {
  dotenv.config(); // On Render, env vars are injected directly into process.env
}

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares configured for Render
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows loading Cloudinary assets/files securely
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  // Add your Vercel or production frontend URL here when deployed
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      // In production, you can choose to loosen this or lock it to your exact frontend domain
      return callback(null, true); 
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoints Mapping
app.use('/api/auth', authRoutes);
app.use('/api/matters', matterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trust-transactions', trustRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/billings', billingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check endpoint (Critical for Render's zero-downtime deploy checks)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'MCALI Legal Consult API is running securely on Render.' });
});

// Root route welcome check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Welcome to MCALI Legal Consult Backend API.' });
});

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// Start the Server (Binds to 0.0.0.0 automatically via Express on Render)
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Server] MCALI Legal backend running successfully on port ${PORT}`);
});