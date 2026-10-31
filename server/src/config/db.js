import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    // Attempt connecting to the configured URI first with a 3s timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to external instance: ${config.mongoUri}`);
  } catch (err) {
    console.warn(`[MongoDB] Standard connection to ${config.mongoUri} was unreachable.`);
    console.log('[MongoDB] Starting embedded high-performance in-memory MongoDB instance...');
    try {
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Critical error initializing in-memory fallback:', memErr.message);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (error) => {
    console.error('[MongoDB] Runtime error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection lost');
  });
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
