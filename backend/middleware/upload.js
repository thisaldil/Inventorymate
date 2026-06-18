import multer from 'multer';

// ❌ diskStorage crashes on Vercel — no writable filesystem
// const storage = multer.diskStorage({ destination: 'uploads/' ... })

// ✅ memoryStorage works everywhere
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});