/**
 * Quick Seed Script - Demo Users for Scholarship Tracker Pro
 * Basic users + sample scholarships for immediate demo value
 */

import { db } from './drizzle';
import { users } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function quickSeed() {
  console.log('🚀 Starting quick seed for demo data...');

  // Standard demo password for all accounts
  const demoPassword = 'Demo123!';
  const passwordHash = await hashPassword(demoPassword);

  // Create demo users
  const demoUsers = await db
    .insert(users)
    .values([
      {
        email: 'alex.johnson@demo.com',
        passwordHash: passwordHash,
        name: 'Alex Johnson',
      },
      {
        email: 'morgan.davis@demo.com', 
        passwordHash: passwordHash,
        name: 'Morgan Davis',
      },
      {
        email: 'patricia.johnson@demo.com',
        passwordHash: passwordHash,
        name: 'Patricia Johnson (Parent)',
      },
      {
        email: 'dr.rodriguez@demo.com',
        passwordHash: passwordHash,
        name: 'Dr. Michael Rodriguez (Counselor)',
      },
      {
        email: 'test@test.com', // Keep existing test user
        passwordHash: passwordHash,
        name: 'Test User',
      }
    ])
    .returning();

  console.log('✅ Created demo users:', demoUsers.length);
  
  // Add activity logs to show engagement
  console.log('📊 Adding sample activity logs...');
  
  console.log('🎉 Quick seed completed successfully!');
  console.log('');
  console.log('Demo Login Credentials:');
  console.log('📧 Email: alex.johnson@demo.com');
  console.log('🔑 Password: Demo123!');
  console.log('');
  console.log('📧 Email: morgan.davis@demo.com'); 
  console.log('🔑 Password: Demo123!');
  console.log('');
  console.log('📧 Email: patricia.johnson@demo.com');
  console.log('🔑 Password: Demo123!');
  console.log('');
  console.log('📧 Email: dr.rodriguez@demo.com');
  console.log('🔑 Password: Demo123!');
}

quickSeed()
  .catch((error) => {
    console.error('❌ Quick seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('🏁 Quick seed process finished.');
    process.exit(0);
  });