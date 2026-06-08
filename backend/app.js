import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { authRoutes } from './routes/authRoutes.js';
import { toolRoutes } from './routes/toolRoutes.js';
import { sparePartRoutes } from './routes/sparePartRoutes.js';
import { vehicleRoutes } from './routes/vehicleRoutes.js';
import { technicianRoutes } from './routes/technicianRoutes.js';
import { maintenanceRoutes } from './routes/maintenanceRoutes.js';
import { dashboardRoutes } from './routes/dashboardRoutes.js';
import { usersRoutes } from './routes/usersRoutes.js';
import { errorHandler } from './middleware/error.js';
import { notFound } from './middleware/notFound.js';
import path from 'path';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ulss-backend', timestamp: new Date().toISOString() });
});

app.use('/uploads', express.static(path.resolve('backend/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/users', usersRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
