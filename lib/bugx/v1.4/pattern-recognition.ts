/**
 * BugX v1.4 Pattern Recognition System
 * Advanced pattern matching and anti-pattern detection
 */

export interface PatternSignature {
  id: string;
  name: string;
  category: 'error_pattern' | 'anti_pattern' | 'solution_pattern';
  confidence: number; // 0-100
  keywords: string[];
  codePatterns: RegExp[];
  contextClues: string[];
  stackTracePatterns?: RegExp[];
  filePatterns?: string[];
  exclusions?: {
    keywords: string[];
    patterns: RegExp[];
  };
}

export interface PatternMatch {
  signature: PatternSignature;
  confidence: number;
  matchedElements: {
    keywords: string[];
    codePatterns: string[];
    contextClues: string[];
    stackTraces?: string[];
  };
  recommendation: string;
  templateSuggestion?: string;
}

export interface AntiPattern {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'architecture' | 'performance' | 'security' | 'maintainability';
  detection: {
    codePatterns: RegExp[];
    filePatterns: RegExp[];
    contextIndicators: string[];
  };
  impact: string;
  solution: string;
  preventionTemplate: string;
  commonTriggers: string[];
}

/**
 * 31 Core Anti-Pattern Detection Rules
 * Based on real debugging experiences and common pitfalls
 */
export const ANTI_PATTERN_LIBRARY: AntiPattern[] = [
  // React/Next.js Patterns (1-8)
  {
    id: 'react-hydration-mismatch',
    name: 'Hydration Mismatch Pattern',
    description: 'Server and client render different content',
    severity: 'high',
    category: 'architecture',
    detection: {
      codePatterns: [
        /Math\.random\(\)/g,
        /new Date\(\)/g,
        /window\./g,
        /document\./g,
        /localStorage/g,
        /sessionStorage/g
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['hydration', 'server', 'client', 'mismatch', 'SSR']
    },
    impact: 'Application fails to hydrate properly, causing user experience issues',
    solution: 'Use useEffect for client-side only operations, implement proper SSR patterns',
    preventionTemplate: 'client-side-state-pattern',
    commonTriggers: ['Math.random in render', 'Direct DOM access', 'Browser APIs in SSR']
  },
  
  {
    id: 'react-stale-closure',
    name: 'Stale Closure in useEffect',
    description: 'useEffect captures outdated state values',
    severity: 'medium',
    category: 'maintainability',
    detection: {
      codePatterns: [
        /useEffect\([^,]*,\s*\[\]/g,
        /useState.*useEffect/s
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['stale', 'closure', 'useEffect', 'dependency']
    },
    impact: 'Functions use outdated state causing incorrect behavior',
    solution: 'Add proper dependencies to useEffect array or use useCallback',
    preventionTemplate: 'dependency-management-pattern',
    commonTriggers: ['Empty dependency array', 'Missing state in deps', 'Complex closure chains']
  },

  {
    id: 'react-key-prop-missing',
    name: 'Missing React Keys',
    description: 'List items rendered without proper key prop',
    severity: 'medium',
    category: 'performance',
    detection: {
      codePatterns: [
        /\.map\([^}]*<[^>]*(?!.*key=)/g,
        /{.*\.map.*<.*}/s
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['map', 'key', 'list', 'render', 'warning']
    },
    impact: 'React reconciliation issues and potential performance problems',
    solution: 'Add unique key prop to each mapped element',
    preventionTemplate: 'list-rendering-pattern',
    commonTriggers: ['Array.map without keys', 'Dynamic list rendering', 'Nested map calls']
  },

  {
    id: 'nextjs-dynamic-import-ssr',
    name: 'Dynamic Import SSR Issue',
    description: 'Client-only components not properly handled in SSR',
    severity: 'high',
    category: 'architecture',
    detection: {
      codePatterns: [
        /import.*dynamic.*from.*next\/dynamic/g,
        /window(?!.*ssr.*false)/g
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['dynamic', 'SSR', 'client', 'window', 'ReferenceError']
    },
    impact: 'Runtime errors when accessing browser APIs during SSR',
    solution: 'Use dynamic imports with ssr: false for client-only components',
    preventionTemplate: 'dynamic-import-pattern',
    commonTriggers: ['Browser API usage', 'Third-party client libraries', 'Window object access']
  },

  // JavaScript Core Patterns (5-12)
  {
    id: 'js-temporal-dead-zone',
    name: 'Temporal Dead Zone Access',
    description: 'Accessing let/const variables before declaration',
    severity: 'high',
    category: 'maintainability',
    detection: {
      codePatterns: [
        /const\s+\w+.*=.*\w+\(/g,
        /let\s+\w+.*=.*\w+\(/g,
        /ReferenceError.*before initialization/
      ],
      filePatterns: [/\.(ts|js|tsx|jsx)$/],
      contextIndicators: ['ReferenceError', 'initialization', 'hoisting', 'TDZ']
    },
    impact: 'Runtime ReferenceError when code execution reaches the problematic line',
    solution: 'Reorder declarations or use function declarations for hoisting',
    preventionTemplate: 'declaration-order-pattern',
    commonTriggers: ['const/let before usage', 'Complex initialization', 'Circular dependencies']
  },

  {
    id: 'js-async-race-condition',
    name: 'Async Race Condition',
    description: 'Competing async operations causing unpredictable results',
    severity: 'critical',
    category: 'maintainability',
    detection: {
      codePatterns: [
        /Promise\.all.*Promise\.all/g,
        /await.*await.*(?!.*Promise\.all)/g,
        /setTimeout.*setTimeout/g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['race', 'async', 'timing', 'concurrent', 'Promise']
    },
    impact: 'Data inconsistency and unpredictable application behavior',
    solution: 'Use Promise.all, proper sequencing, or mutex patterns',
    preventionTemplate: 'async-coordination-pattern',
    commonTriggers: ['Multiple API calls', 'Parallel state updates', 'Timer conflicts']
  },

  {
    id: 'js-memory-leak-closure',
    name: 'Memory Leak via Closure',
    description: 'Closures retaining unnecessary references',
    severity: 'medium',
    category: 'performance',
    detection: {
      codePatterns: [
        /setInterval(?!.*clearInterval)/g,
        /setTimeout.*function.*{[\s\S]*}(?!.*clear)/g,
        /addEventListener(?!.*removeEventListener)/g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['memory', 'leak', 'closure', 'interval', 'listener']
    },
    impact: 'Gradually increasing memory usage leading to performance degradation',
    solution: 'Properly clean up intervals, timeouts, and event listeners',
    preventionTemplate: 'cleanup-pattern',
    commonTriggers: ['Uncleaned intervals', 'Event listener accumulation', 'Large closure scope']
  },

  {
    id: 'js-null-undefined-confusion',
    name: 'Null vs Undefined Confusion',
    description: 'Inconsistent null/undefined handling causing type errors',
    severity: 'medium',
    category: 'maintainability',
    detection: {
      codePatterns: [
        /== null/g,
        /!= null/g,
        /=== undefined/g,
        /typeof.*undefined/g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['null', 'undefined', 'TypeError', 'nullish']
    },
    impact: 'Runtime type errors and inconsistent value handling',
    solution: 'Use nullish coalescing (??) and optional chaining (?.) consistently',
    preventionTemplate: 'null-safety-pattern',
    commonTriggers: ['API response handling', 'Optional properties', 'Default value assignment']
  },

  // API Integration Patterns (9-16)
  {
    id: 'api-error-swallowing',
    name: 'Silent API Error Handling',
    description: 'API errors caught but not properly handled or logged',
    severity: 'high',
    category: 'maintainability',
    detection: {
      codePatterns: [
        /catch.*{.*}/g,
        /\.catch\(\(\)\s*=>\s*{?\s*}?\)/g,
        /try.*{[\s\S]*fetch[\s\S]*}.*catch.*{.*}(?!.*console|.*throw|.*error)/gs
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['catch', 'error', 'silent', 'swallow', 'API']
    },
    impact: 'Hidden failures make debugging impossible and create poor user experience',
    solution: 'Implement proper error logging and user feedback mechanisms',
    preventionTemplate: 'error-handling-pattern',
    commonTriggers: ['Empty catch blocks', 'Ignored promise rejections', 'Missing error logs']
  },

  {
    id: 'api-cors-misconfiguration',
    name: 'CORS Configuration Issue',
    description: 'Cross-origin requests blocked due to improper CORS setup',
    severity: 'high',
    category: 'security',
    detection: {
      codePatterns: [
        /fetch\(['"`]https?:\/\/(?!localhost)/g,
        /XMLHttpRequest/g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['CORS', 'blocked', 'origin', 'preflight', 'cross-origin']
    },
    impact: 'API requests fail with CORS errors, breaking application functionality',
    solution: 'Configure proper CORS headers on server or use proxy configuration',
    preventionTemplate: 'cors-handling-pattern',
    commonTriggers: ['External API calls', 'Different subdomain requests', 'Production deployment']
  },

  {
    id: 'api-rate-limit-no-handling',
    name: 'Missing Rate Limit Handling',
    description: 'API calls without rate limiting or retry mechanisms',
    severity: 'medium',
    category: 'performance',
    detection: {
      codePatterns: [
        /fetch(?!.*retry)/g,
        /Promise\.all.*fetch.*fetch/g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['rate', 'limit', '429', 'throttle', 'quota']
    },
    impact: 'API quota exceeded, service degradation, and poor user experience',
    solution: 'Implement exponential backoff, request queuing, and retry logic',
    preventionTemplate: 'rate-limit-pattern',
    commonTriggers: ['Bulk API calls', 'No retry logic', 'High-frequency requests']
  },

  {
    id: 'api-authentication-leak',
    name: 'Authentication Token Exposure',
    description: 'API keys or tokens exposed in client-side code',
    severity: 'critical',
    category: 'security',
    detection: {
      codePatterns: [
        /api[_-]?key.*['"`][a-zA-Z0-9]{20,}/g,
        /bearer.*['"`][a-zA-Z0-9]{20,}/gi,
        /token.*['"`][a-zA-Z0-9]{20,}/gi
      ],
      filePatterns: [/\.(ts|js|tsx|jsx)$/],
      contextIndicators: ['token', 'key', 'auth', 'bearer', 'secret']
    },
    impact: 'Security breach, unauthorized API access, potential data compromise',
    solution: 'Move secrets to environment variables and use server-side proxy',
    preventionTemplate: 'auth-security-pattern',
    commonTriggers: ['Hardcoded API keys', 'Client-side authentication', 'Public repository']
  },

  // Database/State Patterns (13-20)
  {
    id: 'db-n-plus-one-query',
    name: 'N+1 Query Problem',
    description: 'Multiple database queries when one optimized query would suffice',
    severity: 'high',
    category: 'performance',
    detection: {
      codePatterns: [
        /\.map.*await/g,
        /for.*await.*query/g,
        /forEach.*query/g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['N+1', 'query', 'loop', 'performance', 'database']
    },
    impact: 'Severe performance degradation and database overload',
    solution: 'Use batch queries, joins, or include statements to fetch related data',
    preventionTemplate: 'query-optimization-pattern',
    commonTriggers: ['Looped queries', 'Missing joins', 'Eager loading needed']
  },

  {
    id: 'state-mutation-direct',
    name: 'Direct State Mutation',
    description: 'Mutating state objects directly instead of using proper update methods',
    severity: 'medium',
    category: 'maintainability',
    detection: {
      codePatterns: [
        /state\.\w+\s*=/g,
        /props\.\w+\s*=/g,
        /\w+\.push\((?!.*\[\.\.\.)/g
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['mutation', 'setState', 'immutable', 'direct']
    },
    impact: 'React updates not triggered, state inconsistencies, debugging difficulties',
    solution: 'Use setState, immutable update patterns, or state management libraries',
    preventionTemplate: 'immutable-update-pattern',
    commonTriggers: ['Array.push on state', 'Object property assignment', 'Nested object updates']
  },

  {
    id: 'state-over-fetching',
    name: 'State Over-fetching',
    description: 'Fetching more data than needed or redundant API calls',
    severity: 'medium',
    category: 'performance',
    detection: {
      codePatterns: [
        /useEffect.*fetch.*\[\]/g,
        /fetch.*(?!.*cache|.*memo)/g
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['fetch', 'over-fetch', 'cache', 'redundant', 'performance']
    },
    impact: 'Unnecessary network requests, slower performance, increased costs',
    solution: 'Implement caching, memoization, or data normalization strategies',
    preventionTemplate: 'data-caching-pattern',
    commonTriggers: ['Multiple useEffect fetches', 'No caching strategy', 'Redundant API calls']
  },

  // Security Patterns (17-24)
  {
    id: 'security-xss-vulnerability',
    name: 'XSS Vulnerability Pattern',
    description: 'Unsafe HTML rendering or input handling',
    severity: 'critical',
    category: 'security',
    detection: {
      codePatterns: [
        /dangerouslySetInnerHTML/g,
        /innerHTML.*=/g,
        /eval\(/g,
        /new Function\(/g
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['XSS', 'innerHTML', 'script', 'eval', 'unsafe']
    },
    impact: 'Code injection attacks, data theft, user account compromise',
    solution: 'Sanitize inputs, use safe rendering methods, implement CSP headers',
    preventionTemplate: 'xss-prevention-pattern',
    commonTriggers: ['User content rendering', 'Dynamic HTML generation', 'Unsanitized inputs']
  },

  {
    id: 'security-sql-injection-risk',
    name: 'SQL Injection Risk',
    description: 'Dynamic SQL queries with user input concatenation',
    severity: 'critical',
    category: 'security',
    detection: {
      codePatterns: [
        /`SELECT.*\$\{/g,
        /"SELECT.*"\s*\+/g,
        /query.*\+.*req\./g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['SQL', 'injection', 'query', 'concatenation', 'parameter']
    },
    impact: 'Database compromise, data theft, unauthorized access',
    solution: 'Use parameterized queries, prepared statements, or ORM methods',
    preventionTemplate: 'sql-safety-pattern',
    commonTriggers: ['String concatenation in SQL', 'User input in queries', 'Dynamic WHERE clauses']
  },

  // Performance Patterns (21-28)
  {
    id: 'perf-unoptimized-images',
    name: 'Unoptimized Image Loading',
    description: 'Large images loaded without optimization or lazy loading',
    severity: 'medium',
    category: 'performance',
    detection: {
      codePatterns: [
        /<img(?!.*loading=["']lazy["'])/g,
        /<img(?!.*width|.*height)/g,
        /\.(jpg|jpeg|png|gif)(?!.*webp)/gi
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['image', 'loading', 'lazy', 'optimization', 'performance']
    },
    impact: 'Slow page loads, poor Core Web Vitals scores, increased bandwidth costs',
    solution: 'Use Next.js Image component, implement lazy loading, optimize formats',
    preventionTemplate: 'image-optimization-pattern',
    commonTriggers: ['Large image files', 'No lazy loading', 'Missing size attributes']
  },

  {
    id: 'perf-unnecessary-rerenders',
    name: 'Unnecessary Component Re-renders',
    description: 'Components re-rendering due to unstable dependencies',
    severity: 'medium',
    category: 'performance',
    detection: {
      codePatterns: [
        /useCallback.*\[\]/g,
        /useMemo.*\[\]/g,
        /\{\}.*as.*props/g,
        /\[\].*as.*deps/g
      ],
      filePatterns: [/\.(tsx?|jsx?)$/],
      contextIndicators: ['rerender', 'memo', 'callback', 'optimization', 'deps']
    },
    impact: 'Poor performance, laggy UI interactions, increased CPU usage',
    solution: 'Use React.memo, useCallback, useMemo with proper dependencies',
    preventionTemplate: 'render-optimization-pattern',
    commonTriggers: ['Object creation in render', 'Function creation in props', 'Missing memoization']
  },

  // Build/Deploy Patterns (25-31)
  {
    id: 'build-missing-env-vars',
    name: 'Missing Environment Variables',
    description: 'Required environment variables not configured for deployment',
    severity: 'high',
    category: 'architecture',
    detection: {
      codePatterns: [
        /process\.env\.(?!NODE_ENV)\w+(?!.*\|\|)/g,
        /process\.env\.\w+.*undefined/g
      ],
      filePatterns: [/\.(ts|js)$/],
      contextIndicators: ['env', 'environment', 'undefined', 'config', 'missing']
    },
    impact: 'Application crashes or malfunctions in production environment',
    solution: 'Configure environment variables in deployment platform and add fallbacks',
    preventionTemplate: 'env-config-pattern',
    commonTriggers: ['Production deployment', 'Missing .env file', 'Unconfigured variables']
  },

  {
    id: 'build-dependency-version-conflict',
    name: 'Dependency Version Conflicts',
    description: 'Incompatible package versions causing build or runtime issues',
    severity: 'high',
    category: 'maintainability',
    detection: {
      codePatterns: [
        /npm.*ERESOLVE/g,
        /peer.*dependency/gi,
        /version.*conflict/gi
      ],
      filePatterns: [/package\.json$|yarn\.lock$|package-lock\.json$/],
      contextIndicators: ['version', 'conflict', 'peer', 'dependency', 'resolve']
    },
    impact: 'Build failures, runtime errors, unpredictable behavior',
    solution: 'Audit dependencies, update to compatible versions, use lockfiles',
    preventionTemplate: 'dependency-management-pattern',
    commonTriggers: ['Package updates', 'Peer dependency mismatches', 'Lock file conflicts']
  }
];

export class PatternRecognitionEngine {
  private static patterns: PatternSignature[] = [];
  
  static initialize(): void {
    // Initialize with error patterns derived from anti-patterns
    this.patterns = ANTI_PATTERN_LIBRARY.map(antiPattern => ({
      id: `error-${antiPattern.id}`,
      name: antiPattern.name,
      category: 'error_pattern' as const,
      confidence: 85,
      keywords: antiPattern.commonTriggers,
      codePatterns: antiPattern.detection.codePatterns,
      contextClues: antiPattern.detection.contextIndicators,
      filePatterns: antiPattern.detection.filePatterns.map(pattern => pattern.source)
    }));
  }
  
  static addCustomPattern(signature: PatternSignature): void {
    this.patterns.push(signature);
  }
  
  static analyzeError(
    errorMessage: string,
    stackTrace: string,
    codeContext: string,
    fileName: string
  ): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    for (const pattern of this.patterns) {
      const match = this.matchPattern(pattern, {
        errorMessage,
        stackTrace,
        codeContext,
        fileName
      });
      
      if (match.confidence > 50) {
        matches.push(match);
      }
    }
    
    // Sort by confidence, highest first
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
  
  private static matchPattern(
    pattern: PatternSignature,
    context: {
      errorMessage: string;
      stackTrace: string;
      codeContext: string;
      fileName: string;
    }
  ): PatternMatch {
    const matchedElements = {
      keywords: [] as string[],
      codePatterns: [] as string[],
      contextClues: [] as string[],
      stackTraces: [] as string[]
    };
    
    let totalScore = 0;
    let maxScore = 0;
    
    // Check keywords in error message
    const errorText = context.errorMessage.toLowerCase();
    for (const keyword of pattern.keywords) {
      maxScore += 20;
      if (errorText.includes(keyword.toLowerCase())) {
        matchedElements.keywords.push(keyword);
        totalScore += 20;
      }
    }
    
    // Check code patterns
    for (const codePattern of pattern.codePatterns) {
      maxScore += 25;
      if (codePattern.test(context.codeContext)) {
        matchedElements.codePatterns.push(codePattern.source);
        totalScore += 25;
      }
    }
    
    // Check context clues
    for (const clue of pattern.contextClues) {
      maxScore += 15;
      if (errorText.includes(clue.toLowerCase()) || 
          context.stackTrace.toLowerCase().includes(clue.toLowerCase())) {
        matchedElements.contextClues.push(clue);
        totalScore += 15;
      }
    }
    
    // Check file patterns
    if (pattern.filePatterns) {
      for (const filePattern of pattern.filePatterns) {
        maxScore += 10;
        if (context.fileName.includes(filePattern)) {
          totalScore += 10;
        }
      }
    }
    
    // Check stack trace patterns
    if (pattern.stackTracePatterns) {
      for (const stackPattern of pattern.stackTracePatterns) {
        maxScore += 20;
        if (stackPattern.test(context.stackTrace)) {
          matchedElements.stackTraces!.push(stackPattern.source);
          totalScore += 20;
        }
      }
    }
    
    // Apply exclusions
    if (pattern.exclusions) {
      for (const exclusionKeyword of pattern.exclusions.keywords) {
        if (errorText.includes(exclusionKeyword.toLowerCase())) {
          totalScore *= 0.5; // Reduce confidence by 50%
        }
      }
      
      for (const exclusionPattern of pattern.exclusions.patterns) {
        if (exclusionPattern.test(context.codeContext)) {
          totalScore *= 0.3; // Reduce confidence by 70%
        }
      }
    }
    
    const confidence = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    return {
      signature: pattern,
      confidence,
      matchedElements,
      recommendation: this.generateRecommendation(pattern, confidence),
      templateSuggestion: this.suggestTemplate(pattern, confidence)
    };
  }
  
  private static generateRecommendation(pattern: PatternSignature, confidence: number): string {
    const antiPattern = ANTI_PATTERN_LIBRARY.find(ap => ap.id === pattern.id.replace('error-', ''));
    
    if (!antiPattern) {
      return `Pattern matched with ${confidence}% confidence. Review the matched elements for debugging clues.`;
    }
    
    if (confidence > 80) {
      return `High confidence match (${confidence}%): ${antiPattern.solution}`;
    } else if (confidence > 60) {
      return `Moderate confidence match (${confidence}%): Consider ${antiPattern.solution}`;
    } else {
      return `Low confidence match (${confidence}%): ${antiPattern.description} may be related. ${antiPattern.solution}`;
    }
  }
  
  private static suggestTemplate(pattern: PatternSignature, confidence: number): string | undefined {
    if (confidence < 60) return undefined;
    
    const antiPattern = ANTI_PATTERN_LIBRARY.find(ap => ap.id === pattern.id.replace('error-', ''));
    return antiPattern?.preventionTemplate;
  }
  
  static detectAntiPatterns(codeContent: string, fileName: string): AntiPattern[] {
    const detectedPatterns: AntiPattern[] = [];
    
    for (const antiPattern of ANTI_PATTERN_LIBRARY) {
      let hasMatch = false;
      
      // Check file patterns
      for (const filePattern of antiPattern.detection.filePatterns) {
        if (filePattern.test(fileName)) {
          // Check code patterns
          for (const codePattern of antiPattern.detection.codePatterns) {
            if (codePattern.test(codeContent)) {
              hasMatch = true;
              break;
            }
          }
          if (hasMatch) break;
        }
      }
      
      if (hasMatch) {
        detectedPatterns.push(antiPattern);
      }
    }
    
    return detectedPatterns.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
  
  static generateAntiPatternReport(patterns: AntiPattern[]): string {
    if (patterns.length === 0) {
      return "✅ No anti-patterns detected in the analyzed code.";
    }
    
    const criticalCount = patterns.filter(p => p.severity === 'critical').length;
    const highCount = patterns.filter(p => p.severity === 'high').length;
    const mediumCount = patterns.filter(p => p.severity === 'medium').length;
    const lowCount = patterns.filter(p => p.severity === 'low').length;
    
    let report = `🚨 Anti-Pattern Detection Report\n\n`;
    report += `Summary: ${patterns.length} anti-patterns detected\n`;
    report += `- Critical: ${criticalCount}\n`;
    report += `- High: ${highCount}\n`;
    report += `- Medium: ${mediumCount}\n`;
    report += `- Low: ${lowCount}\n\n`;
    
    for (const pattern of patterns) {
      const emoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      }[pattern.severity];
      
      report += `${emoji} **${pattern.name}** (${pattern.severity})\n`;
      report += `Category: ${pattern.category}\n`;
      report += `Impact: ${pattern.impact}\n`;
      report += `Solution: ${pattern.solution}\n`;
      report += `Prevention Template: ${pattern.preventionTemplate}\n\n`;
    }
    
    return report;
  }
}

// Initialize the pattern recognition engine
PatternRecognitionEngine.initialize();