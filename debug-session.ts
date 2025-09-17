/**
 * BugX v1.4 Debug Session - Server-Side Exception Analysis
 * Error Context: Application error: a server-side exception has occurred
 */

import { PatternRecognitionEngine } from './lib/bugx/v1.4/pattern-recognition';
import { BugXv14 } from './lib/bugx/v1.4/index';

// Initialize BugX Pattern Recognition
PatternRecognitionEngine.initialize();

// Current Error Analysis
const errorContext = {
  errorMessage: "Application error: a server-side exception has occurred while loading v4-stp-git-main-daves-projects-8e54058b.vercel.app",
  stackTrace: `
    Uncaught Error: An error 255-40634877ae3e8e9d.js:1 occurred in the Server Components render
    Failed to load resource: server responded with status 500
    POST https://v4-stp-git-main-daves-projects-8e54058b.vercel.app/ 500 (Internal Server Error)
    Uncaught Error: server-side exception
  `,
  codeContext: `
    // Database connection in lib/db/drizzle.ts
    const DATABASE_URL = process.env.POSTGRES_URL;
    if (!DATABASE_URL) throw new Error('POSTGRES_URL environment variable is not set');
    
    // Auth session in lib/auth/session.ts  
    if (!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET environment variable is required');
    
    // Database queries in lib/db/queries.ts
    export async function getUser() {
      await ensureDatabaseInitialized();
      // Database query execution
    }
  `,
  fileName: "sign-in page (server-side rendering)"
};

console.log('🔍 BugX Pattern Recognition Analysis:');

// Run Pattern Analysis
const matches = PatternRecognitionEngine.analyzeError(
  errorContext.errorMessage,
  errorContext.stackTrace,
  errorContext.codeContext, 
  errorContext.fileName
);

console.log('\n📋 Pattern Matches Found:');
matches.forEach((match, index) => {
  console.log(`\n${index + 1}. ${match.pattern.name} (${match.confidence}% confidence)`);
  console.log(`   Category: ${match.pattern.category}`);
  console.log(`   Matched Keywords: ${match.matchedElements.keywords.join(', ')}`);
  console.log(`   Context Clues: ${match.matchedElements.contextClues.join(', ')}`);
});

// Check specific error patterns
const serverErrorPattern = BugXv14.findPattern("server-side exception");
const databaseErrorPattern = BugXv14.findPattern("database connection");
const envErrorPattern = BugXv14.findPattern("environment variable");

console.log('\n🎯 BugX Specific Pattern Analysis:');
if (serverErrorPattern) {
  console.log('✅ Server Error Pattern Found:', serverErrorPattern.name);
}
if (databaseErrorPattern) {
  console.log('✅ Database Error Pattern Found:', databaseErrorPattern.name);  
}
if (envErrorPattern) {
  console.log('✅ Environment Pattern Found:', envErrorPattern.name);
}

export { matches, errorContext };