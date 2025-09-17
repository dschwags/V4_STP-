import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Support both local development and Supabase production
// Supabase provides POSTGRES_URL through Vercel integration
const DATABASE_URL = process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

console.log('Database URL configured:', DATABASE_URL.includes('supabase') ? 'Supabase' : 'Local');

// Configure postgres client with appropriate options
const connectionConfig = DATABASE_URL.includes('supabase') 
  ? { 
      // Supabase production configuration
      connection: { 
        ssl: { rejectUnauthorized: false } 
      },
      max: 1  // Vercel serverless function limit
    }
  : {}; // Local development configuration

export const client = postgres(DATABASE_URL, connectionConfig);
export const db = drizzle(client, { schema });
