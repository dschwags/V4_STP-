'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  activityLogs,
  type NewUser,
  type NewActivityLog,
  ActivityType,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { validateDemoCredentials, getDemoUser, FALLBACK_MODE_ENABLED } from '@/lib/db/fallback-mode';

async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string,
  metadata?: string
) {
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || '',
    metadata: metadata || null
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  
  console.log('🔍 BugX Debug: Sign-in attempt:', { email, passwordLength: password.length });

  // BugX Plan C: Demo mode fallback with session sync fix
  if (FALLBACK_MODE_ENABLED) {
    console.log('🎭 BugX: Demo mode active, checking credentials');
    if (await validateDemoCredentials(email, password)) {
      const demoUser = getDemoUser();
      // BugX: Create proper User object for session
      await setSession({
        id: parseInt(demoUser.id),
        email: demoUser.email,
        name: demoUser.name,
        passwordHash: 'demo_hash', // Demo placeholder
        createdAt: new Date(demoUser.created_at)
      });
      console.log('✅ BugX: Demo session created, forcing cache invalidation');
      
      // BugX: Force cache invalidation by redirecting with timestamp
      redirect(`/?_auth=${Date.now()}`);
    }
    return {
      error: 'Invalid email or password. (Demo mode: use test@test.com / admin123)',
      email,
      password
    };
  }

  let foundUser;
  try {
    foundUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    console.log('🔍 BugX Debug: Users found:', foundUser.length);
  } catch (error) {
    console.error('🚨 BugX: Database error, falling back to demo mode:', error);
    if (await validateDemoCredentials(email, password)) {
      const demoUser = getDemoUser();
      // BugX: Create proper User object for session  
      await setSession({
        id: parseInt(demoUser.id),
        email: demoUser.email,
        name: demoUser.name,
        passwordHash: 'demo_hash', // Demo placeholder
        createdAt: new Date(demoUser.created_at)
      });
      console.log('✅ BugX: Database fallback session created, forcing cache invalidation');
      
      // BugX: Force cache invalidation by redirecting with timestamp
      redirect(`/?_auth=${Date.now()}`);
    }
    return {
      error: 'Database unavailable. Demo mode: use test@test.com / admin123',
      email,
      password
    };
  }

  if (foundUser.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const user = foundUser[0];

  const isPasswordValid = await comparePasswords(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    setSession(user),
    logActivity(user.id, ActivityType.SIGN_IN)
  ]);

  redirect('/');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    name: null
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  await Promise.all([
    logActivity(createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  redirect('/');
});

export async function signOut() {
  console.log('💪 BugX: Server-side logout initiated');
  
  try {
    // BugX: Handle both database and demo modes
    if (!FALLBACK_MODE_ENABLED) {
      const user = (await getUser()) as User;
      if (user) {
        await logActivity(user.id, ActivityType.SIGN_OUT);
      }
    } else {
      console.log('🎭 BugX: Demo mode logout - skipping database activity log');
    }
  } catch (error) {
    console.log('⚠️ BugX: Could not log sign-out activity:', error);
  }
  
  // BugX: Force cookie deletion with multiple strategies
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.set('session', '', { expires: new Date(0), maxAge: 0 });
  
  console.log('✅ BugX: Session cookie cleared');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Please try again.'
      };
    }

    await Promise.all([
      db
        .update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.DELETE_ACCOUNT)
    ]);

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().min(3).max(255)
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== user.id) {
      return {
        name,
        email,
        error: 'Email is already in use.'
      };
    }

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return {
      success: 'Account updated successfully.'
    };
  }
);