import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Vercel: only /tmp is writable. Local dev: use backend/uploads
const uploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.resolve('backend/uploads');

// Safe in both environments — /tmp always exists on Vercel, local dir created if missing
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.warn('Could not create upload directory:', err.message);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, '-')}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});