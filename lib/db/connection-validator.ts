/**
 * BugX v1.4 Pattern: Database Connection Validator
 * Prevents server-side exceptions from database connection failures
 */

import { sql } from 'drizzle-orm';
import { db } from './drizzle';

let connectionStatus: 'unknown' | 'connected' | 'failed' = 'unknown';
let lastCheck = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

export async function validateDatabaseConnection(): Promise<boolean> {
  // BugX: Cache connection status to avoid repeated checks
  const now = Date.now();
  if (connectionStatus === 'connected' && (now - lastCheck) < CHECK_INTERVAL) {
    return true;
  }

  try {
    console.log('🔍 BugX: Testing database connection...');
    
    // Simple connection test with timeout
    const testPromise = db.execute(sql`SELECT 1 as test`);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    await Promise.race([testPromise, timeoutPromise]);
    
    connectionStatus = 'connected';
    lastCheck = now;
    console.log('✅ BugX: Database connection successful');
    return true;
    
  } catch (error) {
    connectionStatus = 'failed';
    lastCheck = now;
    console.error('❌ BugX: Database connection failed:', error);
    return false;
  }
}

export async function ensureConnectionOrFail(): Promise<void> {
  const isConnected = await validateDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection required but unavailable');
  }
}