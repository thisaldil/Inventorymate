import User from '../models/User.js';
import Role from '../models/Role.js';

export const seedDefaultAdmin = async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  const name = process.env.DEFAULT_ADMIN_NAME || 'Super Admin';
  if (!email || !password) return;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return;

  const role = await Role.findOne({ name: 'SUPER_ADMIN' });
  if (!role) return;

  await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role._id,
    active: true,
  });
};
