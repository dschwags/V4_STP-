import { initializeDatabase, seedDatabase } from './migrate';
import { validateDatabaseConnection } from './connection-validator';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function ensureDatabaseInitialized() {
  // Return immediately if already initialized
  if (isInitialized) {
    return;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  // Start initialization with BugX validation
  initializationPromise = (async () => {
    try {
      console.log('🔧 BugX: Ensuring database is initialized...');
      
      // BugX Pattern: Validate connection before initialization
      const isConnected = await validateDatabaseConnection();
      if (!isConnected) {
        throw new Error('BugX: Cannot initialize - database connection unavailable');
      }
      
      await initializeDatabase();
      await seedDatabase();
      isInitialized = true;
      console.log('✅ BugX: Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      // Reset promise so it can be retried
      initializationPromise = null;
      throw error;
    }
  })();

  await initializationPromise;
}