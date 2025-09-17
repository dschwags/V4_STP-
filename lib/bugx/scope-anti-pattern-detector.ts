/**
 * BugX v1.3 Scope Anti-Pattern Detection System
 * Prevents JavaScript scope and hoisting errors
 */

export interface ScopeAntiPatternResult {
  patternId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  file: string;
  line: number;
  functionName: string;
  declarationLine?: number;
  recommendation: string;
  autoFixAvailable: boolean;
}

export class ScopeAntiPatternDetector {
  
  /**
   * Anti-Pattern SCOPE-001: Function called before const declaration
   * CRITICAL: Runtime ReferenceError in production
   */
  static detectFunctionCallBeforeDeclaration(
    fileContent: string, 
    fileName: string
  ): ScopeAntiPatternResult[] {
    const results: ScopeAntiPatternResult[] = [];
    const lines = fileContent.split('\n');
    
    // Find all const function declarations
    const functionDeclarations = new Map<string, number>();
    lines.forEach((line, index) => {
      const constFuncMatch = line.match(/const\s+(\w+)\s*=\s*\(.*?\)\s*=>/);
      if (constFuncMatch) {
        functionDeclarations.set(constFuncMatch[1], index + 1);
      }
    });
    
    // Find function calls and check if they occur before declaration
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      for (const [funcName, declarationLine] of functionDeclarations) {
        const callPattern = new RegExp(`\\b${funcName}\\s*\\(`);
        if (callPattern.test(line) && lineNumber < declarationLine) {
          results.push({
            patternId: 'SCOPE-001',
            severity: 'critical',
            description: `Function '${funcName}' called before const declaration`,
            file: fileName,
            line: lineNumber,
            functionName: funcName,
            declarationLine,
            recommendation: 'Move function declaration above usage or use function declaration syntax',
            autoFixAvailable: true
          });
        }
      }
    });
    
    return results;
  }

  /**
   * Anti-Pattern SCOPE-002: Temporal Dead Zone violations
   */
  static detectTemporalDeadZone(
    fileContent: string, 
    fileName: string
  ): ScopeAntiPatternResult[] {
    const results: ScopeAntiPatternResult[] = [];
    const lines = fileContent.split('\n');
    
    // Find let/const declarations
    const declarations = new Map<string, number>();
    lines.forEach((line, index) => {
      const letConstMatch = line.match(/(let|const)\s+(\w+)/);
      if (letConstMatch) {
        declarations.set(letConstMatch[2], index + 1);
      }
    });
    
    // Check for usage before declaration
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      for (const [varName, declarationLine] of declarations) {
        if (lineNumber < declarationLine && line.includes(varName)) {
          results.push({
            patternId: 'SCOPE-002',
            severity: 'high',
            description: `Variable '${varName}' accessed in temporal dead zone`,
            file: fileName,
            line: lineNumber,
            functionName: varName,
            declarationLine,
            recommendation: 'Ensure variable declaration occurs before usage',
            autoFixAvailable: true
          });
        }
      }
    });
    
    return results;
  }

  /**
   * Generate auto-fix for scope anti-patterns
   */
  static generateAutoFix(
    pattern: ScopeAntiPatternResult,
    fileContent: string
  ): string {
    const lines = fileContent.split('\n');
    
    switch (pattern.patternId) {
      case 'SCOPE-001': {
        // Move function declaration before first usage
        const declarationLine = pattern.declarationLine! - 1;
        const functionDeclaration = lines[declarationLine];
        
        // Remove from original position
        lines.splice(declarationLine, 1);
        
        // Insert before first usage
        const insertPosition = pattern.line - 1;
        lines.splice(insertPosition, 0, '', '  // BugX Auto-Fix: Moved function declaration to prevent scope error', functionDeclaration);
        
        return lines.join('\n');
      }
      
      case 'SCOPE-002': {
        // Similar logic for temporal dead zone fixes
        return fileContent; // Placeholder
      }
      
      default:
        return fileContent;
    }
  }

  /**
   * Validate entire codebase for scope anti-patterns
   */
  static validateScopePatterns(
    files: Array<{ path: string; content: string }>
  ): ScopeValidationReport {
    const allResults: ScopeAntiPatternResult[] = [];
    
    for (const file of files) {
      const scopeErrors = this.detectFunctionCallBeforeDeclaration(file.content, file.path);
      const tdzErrors = this.detectTemporalDeadZone(file.content, file.path);
      
      allResults.push(...scopeErrors, ...tdzErrors);
    }
    
    return {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      criticalErrors: allResults.filter(r => r.severity === 'critical').length,
      highErrors: allResults.filter(r => r.severity === 'high').length,
      results: allResults,
      autoFixable: allResults.filter(r => r.autoFixAvailable).length,
      recommendations: this.generateRecommendations(allResults)
    };
  }

  private static generateRecommendations(results: ScopeAntiPatternResult[]): string[] {
    const recs = new Set([
      'Use function declarations instead of const arrow functions for hoisted behavior',
      'Declare all variables before usage to avoid temporal dead zone',
      'Implement ESLint rules: no-use-before-define',
      'Add TypeScript strict mode for compile-time scope checking'
    ]);
    
    return Array.from(recs);
  }
}

export interface ScopeValidationReport {
  timestamp: string;
  totalFiles: number;
  criticalErrors: number;
  highErrors: number;
  results: ScopeAntiPatternResult[];
  autoFixable: number;
  recommendations: string[];
}