import { getUser } from '@/lib/db/queries';
import { getDemoUser, FALLBACK_MODE_ENABLED } from '@/lib/db/fallback-mode';
import { verifyToken } from '@/lib/auth/session';
import { cookies } from 'next/headers';

// BugX: Global flag to reduce logging noise
declare global {
  var _bugxAuthLogged: boolean | undefined;
}

export async function GET() {
  // BugX: Demo mode fallback for user API
  if (FALLBACK_MODE_ENABLED) {
    // Check if user has valid session cookie
    const sessionCookie = (await cookies()).get('session');
    if (sessionCookie) {
      try {
        const session = await verifyToken(sessionCookie.value);
        if (session) {
          // Only log on first successful auth, not every request
          if (!global._bugxAuthLogged) {
            console.log('✅ BugX: Demo mode authentication successful');
            global._bugxAuthLogged = true;
          }
          return Response.json(getDemoUser());
        }
      } catch (error) {
        console.log('❌ BugX API: Invalid session token');
        global._bugxAuthLogged = false;
      }
    }
    
    // Reset auth logged flag when no session
    if (global._bugxAuthLogged) {
      console.log('🚫 BugX: Session ended');
      global._bugxAuthLogged = false;
    }
    return Response.json(null);
  }
  
  // Normal database mode
  const user = await getUser();
  return Response.json(user);
}
