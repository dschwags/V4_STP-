import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { ensureDatabaseInitialized } from './init';

export async function getUser() {
  try {
    // Ensure database is initialized before any queries
    await ensureDatabaseInitialized();
  } catch (error) {
    console.error('Database initialization failed in getUser:', error);
    return null;
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