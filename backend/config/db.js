import mongoose from 'mongoose';
import { env } from './env.js';

// Cache connection across serverless invocations
let cached = global._mongoose || { conn: null, promise: null };
global._mongoose = cached;

export const connectDB = async () => {
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');

  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  console.log('✅ MongoDB connected');
  return cached.conn;
};