import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

export const connectDB = async () => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoose.set('strictQuery', true);
  if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
    // Some Windows/network setups refuse SRV lookups via the default resolver.
    // Override with public resolvers so Atlas SRV resolution succeeds more reliably.
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  }
  await mongoose.connect(env.MONGODB_URI);
  console.log('MongoDB connected');
};
