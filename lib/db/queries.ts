import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { ensureDatabaseInitialized } from './init';
import { validateDatabaseConnection } from './connection-validator';

export async function getUser() {
  try {
    // BugX Pattern: Validate connection before initialization
    const isConnected = await validateDatabaseConnection();
    if (!isConnected) {
      console.log('🔄 BugX: Database unavailable, returning null user');
      return null; // Graceful fallback
    }
    
    // Ensure database is initialized before any queries
    await ensureDatabaseInitialized();
  } catch (error) {
    console.error('BugX: Database initialization failed in getUser:', error);
    return null; // Always return null on error
  }

  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Database query failed in getUser:', error);
    return null;
  }
}

export async function getActivityLogs() {
  try {
    // BugX Pattern: Validate connection first
    const isConnected = await validateDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection unavailable for activity logs');
    }
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        timestamp: activityLogs.timestamp,
        ipAddress: activityLogs.ipAddress,
        metadata: activityLogs.metadata,
        userName: users.name
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.userId, user.id))
      .orderBy(desc(activityLogs.timestamp))
      .limit(10);
  } catch (error) {
    console.error('Database query failed in getActivityLogs:', error);
    throw error;
  }
}