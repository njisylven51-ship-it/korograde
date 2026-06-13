import express from 'express';
// Use Node native type resolve for standard CORS inside Node/Express
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import studentRoutes from './routes/studentRoutes';
import { errorHandler } from './middleware/error';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins in this development environment or build proxy
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'KoroGrade Backend' });
});

// Error handling Middleware
app.use(errorHandler);

export default app;
