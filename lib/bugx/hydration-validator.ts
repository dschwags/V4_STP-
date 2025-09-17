/**
 * BugX v1.3 Hydration Validation Framework
 * Prevents future hydration errors through systematic validation
 */

export interface HydrationValidationRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix: string;
}

export class HydrationValidator {
  
  private static readonly VALIDATION_RULES: HydrationValidationRule[] = [
    {
      id: 'no-random-in-state',
      name: 'No Math.random() in useState initialization',
      pattern: /useState\([^)]*Math\.random\(\)/g,
      severity: 'error',
      message: 'Math.random() in useState causes hydration mismatch',
      fix: 'Use static initial value + client-side state check'
    },
    {
      id: 'no-random-in-render',
      name: 'No Math.random() in component render',
      pattern: /return\s*\([^}]*Math\.random\(\)/g,
      severity: 'error',
      message: 'Math.random() in render logic causes hydration mismatch',
      fix: 'Move random generation to useEffect or use suppressHydrationWarning'
    },
    {
      id: 'no-browser-api-render',
      name: 'No browser APIs in render without client check',
      pattern: /(window\.|document\.|localStorage\.|sessionStorage\.)/g,
      severity: 'warning',
      message: 'Browser API usage may cause SSR errors',
      fix: 'Wrap in typeof window !== "undefined" check or use in useEffect'
    },
    {
      id: 'no-date-now-render',
      name: 'No Date.now() in render logic',
      pattern: /Date\.now\(\)/g,
      severity: 'warning',
      message: 'Date.now() creates different values on server vs client',
      fix: 'Use suppressHydrationWarning or move to useEffect'
    }
  ];

  /**
   * Validate file content against hydration rules
   */
  static validateFile(filePath: string, content: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const rule of this.VALIDATION_RULES) {
      const matches = Array.from(content.matchAll(rule.pattern));
      
      for (const match of matches) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        results.push({
          rule: rule.id,
          severity: rule.severity,
          message: rule.message,
          fix: rule.fix,
          file: filePath,
          line: lineNumber,
          code: match[0]
        });
      }
    }
    
    return results;
  }

  /**
   * Generate validation report for entire codebase
   */
  static async validateCodebase(files: Array<{ path: string; content: string }>): Promise<ValidationReport> {
    const allResults: ValidationResult[] = [];
    
    for (const file of files) {
      const fileResults = this.validateFile(file.path, file.content);
      allResults.push(...fileResults);
    }
    
    const errors = allResults.filter(r => r.severity === 'error');
    const warnings = allResults.filter(r => r.severity === 'warning');
    
    return {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      totalIssues: allResults.length,
      errors: errors.length,
      warnings: warnings.length,
      results: allResults,
      summary: this.generateSummary(allResults),
      recommendations: this.generateRecommendations(allResults)
    };
  }

  private static generateSummary(results: ValidationResult[]): string {
    if (results.length === 0) {
      return 'No hydration validation issues found. Codebase follows BugX v1.3 patterns.';
    }
    
    const errorCount = results.filter(r => r.severity === 'error').length;
    const warningCount = results.filter(r => r.severity === 'warning').length;
    
    return `Found ${errorCount} critical hydration errors and ${warningCount} warnings that could cause SSR issues.`;
  }

  private static generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations = new Set<string>();
    
    for (const result of results) {
      recommendations.add(result.fix);
    }
    
    recommendations.add('Implement pre-commit hooks for hydration validation');
    recommendations.add('Add behavioral parity tests to CI/CD pipeline');
    recommendations.add('Create hydration-safe component development guidelines');
    
    return Array.from(recommendations);
  }

  /**
   * Auto-fix common hydration patterns
   */
  static generateAutoFix(result: ValidationResult): string {
    switch (result.rule) {
      case 'no-random-in-state':
        return `
// BugX Auto-Fix: Client-side state pattern
const [isClient, setIsClient] = useState(false);
const [randomValue, setRandomValue] = useState(0); // Static initial value

useEffect(() => {
  setIsClient(true);
}, []);

useEffect(() => {
  if (isClient) {
    setRandomValue(Math.random()); // Move random generation to client-side
  }
}, [isClient]);`;
        
      case 'no-browser-api-render':
        return `
// BugX Auto-Fix: Browser API safety pattern  
const [clientData, setClientData] = useState(null);

useEffect(() => {
  if (typeof window !== 'undefined') {
    setClientData(window.someAPI); // Safe browser API usage
  }
}, []);`;
        
      default:
        return '// Manual fix required - see BugX recommendations';
    }
  }
}

export interface ValidationResult {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix: string;
  file: string;
  line: number;
  code: string;
}

export interface ValidationReport {
  timestamp: string;
  totalFiles: number;
  totalIssues: number;
  errors: number;
  warnings: number;
  results: ValidationResult[];
  summary: string;
  recommendations: string[];
}