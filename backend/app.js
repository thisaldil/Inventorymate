import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
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

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Required for Vercel — trust the first proxy
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
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
    // ✅ Tells rate-limit to trust the proxy-forwarded IP
    validate: { xForwardedForHeader: false },
  }),
);


// ✅ Root health check so "/" returns something useful
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'inventorymate-api', version: '1.0.0' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'inventorymate-api', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

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

if (process.env.NODE_ENV !== 'production') {
  const PORT = env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;