import { sql } from 'drizzle-orm';
import { db } from './drizzle';

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database tables...');

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
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Check if test user already exists
    const existingUser = await db.execute(sql`
      SELECT id FROM users WHERE email = 'test@test.com' LIMIT 1;
    `);

    if (existingUser.length === 0) {
      // Create test user (password is 'admin123')
      // Hash generated with bcrypt: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
      await db.execute(sql`
        INSERT INTO users (name, email, password_hash)
        VALUES ('Test User', 'test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
      `);
      console.log('✅ Test user created: test@test.com / admin123');
    } else {
      console.log('ℹ️ Test user already exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}