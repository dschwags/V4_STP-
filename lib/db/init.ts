import { initializeDatabase, seedDatabase } from './migrate';

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

  // Start initialization
  initializationPromise = (async () => {
    try {
      console.log('🔧 Ensuring database is initialized...');
      await initializeDatabase();
      await seedDatabase();
      isInitialized = true;
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      // Reset promise so it can be retried
      initializationPromise = null;
      throw error;
    }
  })();

  await initializationPromise;
}