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

// BugX v1.4 Fix: Correct TypeScript configuration
const connectionConfig = DATABASE_URL.includes('supabase') || process.env.VERCEL
  ? { 
      // Production/Supabase configuration - BugX optimized
      ssl: 'require' as const,  // BugX: Fix TypeScript literal type
      max: 1,  // Vercel serverless function limit
      idle_timeout: 20,
      connect_timeout: 5,  // BugX: Faster timeout for serverless
      transform: {
        undefined: null  // BugX: Handle undefined values gracefully
      },
      onnotice: (notice: any) => {
        console.log('🔔 BugX: Database notice:', notice.message);
      }
    }
  : {
      // Local development configuration
      max: 10,
      idle_timeout: 30
    };

console.log('🔗 Database connection config:', {
  isSupabase: DATABASE_URL.includes('supabase'),
  isVercel: !!process.env.VERCEL,
  hasSSL: !!connectionConfig.ssl
});

export const client = postgres(DATABASE_URL, connectionConfig);
export const db = drizzle(client, { schema });
