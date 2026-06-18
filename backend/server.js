import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedRoles } from './utils/seedRoles.js';
import { seedDefaultAdmin } from './utils/seedAdmin.js';

const start = async () => {
  await connectDB();
  await seedRoles();
  await seedDefaultAdmin();

  const server = app.listen(env.PORT, () => {
    console.log(`ULSS backend running on port ${env.PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.PORT} is already in use. Stop the other server or set PORT to a free port.`);
      process.exit(1);
    }

    throw error;
  });
};

start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
