import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedRoles } from './utils/seedRoles.js';
import { seedDefaultAdmin } from './utils/seedAdmin.js';

const start = async () => {
  await connectDB();
  await seedRoles();
  await seedDefaultAdmin();
  app.listen(env.PORT, () => {
    console.log(`ULSS backend running on port ${env.PORT}`);
  });
};

start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
