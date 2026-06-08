import Role from '../models/Role.js';

const seedRolesData = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full system access',
    permissions: ['*'],
  },
  {
    name: 'INVENTORY_MANAGER',
    description: 'Manage vehicles, spare parts, and tools',
    permissions: ['tools:read', 'tools:write', 'parts:read', 'parts:write', 'vehicles:read', 'vehicles:write'],
  },
  {
    name: 'WORKSHOP_MANAGER',
    description: 'Manage tool assignments and maintenance records',
    permissions: ['tools:read', 'tools:assign', 'maintenance:read', 'maintenance:write', 'technicians:read', 'technicians:write'],
  },
];

export const seedRoles = async () => {
  for (const role of seedRolesData) {
    await Role.updateOne({ name: role.name }, { $setOnInsert: role }, { upsert: true });
  }
};
