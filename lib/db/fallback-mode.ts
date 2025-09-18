/**
 * BugX Plan C: Fallback Demo Mode
 * Provides authentication simulation when database is unavailable
 */

export const DEMO_USER = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
  role: 'admin' as const,
  created_at: new Date().toISOString()
};

export async function validateDemoCredentials(email: string, password: string): Promise<boolean> {
  console.log('🔄 BugX Plan C: Using demo mode authentication');
  
  // Demo credentials
  const isValidEmail = email === 'test@test.com';
  const isValidPassword = password === 'admin123';
  
  if (isValidEmail && isValidPassword) {
    console.log('✅ BugX Demo: Valid credentials');
    return true;
  }
  
  console.log('❌ BugX Demo: Invalid credentials');
  return false;
}

export function getDemoUser() {
  return DEMO_USER;
}

export const FALLBACK_MODE_ENABLED = process.env.ENABLE_DEMO_MODE === 'true';