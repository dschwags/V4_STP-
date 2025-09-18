import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// BugX Plan B: Multiple connection strategies
const DATABASE_URL = process.env.POSTGRES_URL;
const BACKUP_URL = process.env.DATABASE_URL; // Vercel backup

if (!DATABASE_URL && !BACKUP_URL) {
  throw new Error('No database URL configured (POSTGRES_URL or DATABASE_URL)');
}

// BugX: Try primary URL, fallback to backup
const connectionUrl = DATABASE_URL || BACKUP_URL || '';
const isSupabase = connectionUrl.includes('supabase');
const isPooler = connectionUrl.includes('pooler') || connectionUrl.includes('6543');

console.log('🔍 BugX Plan B: Database connection strategy:', {
  primary: !!DATABASE_URL,
  backup: !!BACKUP_URL,
  isSupabase,
  isPooler,
  url: connectionUrl.replace(/:[^:@]*@/, ':***@') // Hide password
});

// BugX Plan B: Adaptive configuration based on connection type
const connectionConfig = isSupabase
  ? isPooler
    ? {
        // Supabase Pooler configuration (Plan A)
        ssl: 'require' as const,
        max: 1,
        idle_timeout: 60,
        connect_timeout: 15,
        statement_timeout: 30000,
        query_timeout: 25000,
        prepare: false,
        max_lifetime: 3600,
        transform: { undefined: null },
        onnotice: (notice: any) => console.log('🔔 BugX Pooler:', notice.message)
      }
    : {
        // Supabase Direct connection (Plan B)
        ssl: 'require' as const,
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
        statement_timeout: 15000,
        query_timeout: 12000,
        prepare: true,  // BugX: Enable prepared statements for direct
        transform: { undefined: null },
        onnotice: (notice: any) => console.log('🔔 BugX Direct:', notice.message)
      }
  : {
      // Local development configuration
      max: 10,
      idle_timeout: 30
    };

console.log('🔗 BugX: Final connection config:', {
  strategy: isPooler ? 'pooler' : isSupabase ? 'direct' : 'local',
  isSupabase,
  isVercel: !!process.env.VERCEL,
  hasSSL: !!connectionConfig.ssl,
  maxConnections: connectionConfig.max
});

// BugX: Add connection retry wrapper
let clientInstance: any = null;
let retryCount = 0;
const MAX_RETRIES = 3;

function createClient() {
  try {
    console.log('🚀 BugX: Creating database client with', isPooler ? 'pooler' : 'direct', 'connection');
    return postgres(connectionUrl, connectionConfig);
  } catch (error) {
    console.error('🚨 BugX: Failed to create database client:', error);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔄 BugX: Retrying database connection (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(() => createClient(), 1000 * retryCount);
    }
    throw error;
  }
}

export const client = createClient();
export const db = drizzle(client, { schema });
