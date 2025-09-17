/**
 * BugX v1.3 Scope Validation Rules
 * Prevents future JavaScript scope errors in React hooks
 */

export const SCOPE_VALIDATION_RULES = {
  
  /**
   * Rule: Function declarations must precede usage in React hooks
   * Prevents: ReferenceError - Cannot access before initialization
   */
  FUNCTION_DECLARATION_ORDER: {
    id: 'SCOPE-001',
    name: 'Function Declaration Order',
    description: 'All helper functions must be declared before usage in React hooks',
    severity: 'critical' as const,
    pattern: /const\s+(\w+)\s*=\s*.*?\(\s*.*?\s*\)\s*(?::|=>)/g,
    validate: (content: string): boolean => {
      const lines = content.split('\n');
      const functionDeclarations = new Map<string, number>();
      const functionCalls = new Map<string, number[]>();
      
      // Find all function declarations
      lines.forEach((line, index) => {
        const match = line.match(/const\s+(\w+)\s*=.*(?:useCallback|=>)/);
        if (match) {
          functionDeclarations.set(match[1], index);
        }
      });
      
      // Find all function calls  
      lines.forEach((line, index) => {
        for (const funcName of functionDeclarations.keys()) {
          if (line.includes(`${funcName}(`)) {
            if (!functionCalls.has(funcName)) {
              functionCalls.set(funcName, []);
            }
            functionCalls.get(funcName)!.push(index);
          }
        }
      });
      
      // Validate order
      for (const [funcName, declarationLine] of functionDeclarations) {
        const calls = functionCalls.get(funcName) || [];
        for (const callLine of calls) {
          if (callLine < declarationLine) {
            return false; // Call before declaration
          }
        }
      }
      
      return true;
    },
    fix: 'Move function declarations above their usage or use function declaration syntax'
  },

  /**
   * Rule: useCallback for stable references in dependencies
   * Prevents: Infinite re-renders and dependency issues
   */
  STABLE_FUNCTION_REFERENCES: {
    id: 'SCOPE-002', 
    name: 'Stable Function References',
    description: 'Helper functions in useMemo dependencies should use useCallback',
    severity: 'high' as const,
    validate: (content: string): boolean => {
      // Check if functions used in useMemo deps are wrapped in useCallback
      const useMemoMatch = content.match(/useMemo\([^}]+}, \[(.*?)\]/s);
      if (!useMemoMatch) return true;
      
      const dependencies = useMemoMatch[1];
      const hasFunctionDeps = /\w+(?:Score|Level|Calculate)/.test(dependencies);
      
      if (hasFunctionDeps) {
        // Check if those functions are declared with useCallback
        return /useCallback\(/.test(content);
      }
      
      return true;
    },
    fix: 'Wrap helper functions in useCallback with appropriate dependencies'
  },

  /**
   * Rule: Complete dependency arrays
   * Prevents: Stale closure issues and missing dependencies
   */
  COMPLETE_DEPENDENCY_ARRAYS: {
    id: 'SCOPE-003',
    name: 'Complete Dependency Arrays',
    description: 'All values used inside hooks must be included in dependency array',
    severity: 'medium' as const,
    validate: (content: string): boolean => {
      // This would require more complex AST parsing in a real implementation
      // For now, just check for common patterns
      return !content.includes('// eslint-disable-next-line react-hooks/exhaustive-deps');
    },
    fix: 'Include all referenced variables in dependency arrays'
  }
};

/**
 * Validation report for scope rules
 */
export interface ScopeValidationResult {
  ruleId: string;
  passed: boolean;
  message: string;
  fix: string;
  line?: number;
}

/**
 * Validate file against all scope rules
 */
export function validateScopeRules(content: string, filename: string): ScopeValidationResult[] {
  const results: ScopeValidationResult[] = [];
  
  for (const rule of Object.values(SCOPE_VALIDATION_RULES)) {
    const passed = rule.validate(content);
    
    results.push({
      ruleId: rule.id,
      passed,
      message: passed 
        ? `✅ ${rule.name}: PASSED`
        : `❌ ${rule.name}: ${rule.description}`,
      fix: rule.fix
    });
  }
  
  return results;
}

/**
 * Generate ESLint configuration for scope rules
 */
export function generateESLintConfig(): object {
  return {
    rules: {
      'no-use-before-define': ['error', { 
        functions: true, 
        classes: true, 
        variables: true 
      }],
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error'
    },
    extends: [
      '@typescript-eslint/recommended',
      'plugin:react-hooks/recommended'
    ]
  };
}