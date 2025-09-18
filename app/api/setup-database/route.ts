/**
 * BugX v1.4 Solution: API Database Setup Endpoint
 * This creates the database tables automatically
 */

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';

export async function POST() {
  try {
    console.log('🚀 BugX: Starting database setup...');

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );
    `);

    // Create activity_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address VARCHAR(45),
        metadata TEXT
      );
    `);

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
    `);

    // Insert test user (password: admin123)
    await db.execute(sql`
      INSERT INTO users (name, email, password_hash)
      VALUES ('Test User', 'test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Verify setup
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users;`);
    const testUser = await db.execute(sql`
      SELECT email, name FROM users WHERE email = 'test@test.com';
    `);

    console.log('✅ BugX: Database setup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      results: {
        userCount: userCount[0],
        testUser: testUser[0]
      }
    });

  } catch (error) {
    console.error('❌ BugX: Database setup failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Check server logs for more information'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database setup endpoint. Use POST to create tables.',
    instructions: 'Send a POST request to this endpoint to set up database tables automatically.'
  });
}