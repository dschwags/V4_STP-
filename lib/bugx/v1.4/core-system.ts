/**
 * BugX v1.4 Streamlined AI Implementation Guide
 * Date: September 17, 2025
 * Author: David Schwager
 * Contact: BugX@BrewX.com
 * 
 * PURPOSE: Rapid AI-friendly debugging methodology (4-5 minutes)
 * TARGET: 85% value retention with maximum efficiency
 */

// ===================================================================
// PHASE 0: RAPID REALITY CHECK
// ===================================================================

/**
 * AI PROMPT TRIGGER: Use this exact phrase to activate BugX v1.4
 * 
 * "Apply BugX v1.4 methodology to debug [ISSUE_DESCRIPTION]"
 */

export interface BugXContext {
  errorType: 'business_logic' | 'integration' | 'pattern' | 'infrastructure';
  systematicValue: 'high' | 'medium' | 'low';
  timeTarget: '4-5 minutes';
  expectedValue: '85% BugX retention';
}

export const PHASE_0_CLASSIFICATION = `
CLASSIFICATION DECISION TREE:
├── Business Logic: Domain calculations, state management, rules
├── Integration: Component communication, data flow, APIs  
├── Pattern: Forms, validation, rendering, auth (known issues)
└── Infrastructure: Build, config, deployment, environment

SYSTEMATIC VALUE ASSESSMENT:
├── HIGH: Business logic, new patterns, critical systems → Full BugX
├── MEDIUM: Integration issues, moderate complexity → BugX v1.4
└── LOW: Known patterns, simple fixes → Quick fix + documentation
`;

// ===================================================================
// PHASE 1: ENHANCED PATTERN DETECTION
// ===================================================================

export interface PatternTemplate {
  name: string;
  trigger: string[];
  solution: string;
  implementation: string;
  prevention: string;
  timeEstimate: string;
  confidence: number; // 0-100 based on usage success
  lastUpdated: Date;
  usageCount: number;
  successRate: number;
}

export const COMMON_PATTERNS: Record<string, PatternTemplate> = {
  hydration_error: {
    name: "React Hydration Mismatch",
    trigger: ["server rendered text didn't match", "hydration failed", "useEffect", "Math.random"],
    solution: "Static initial values + client-side state check",
    implementation: `
      const [isClient, setIsClient] = useState(false);
      const [data, setData] = useState(STATIC_INITIAL_VALUE);
      useEffect(() => setIsClient(true), []);
      if (!isClient) return <Loading />;
    `,
    prevention: "Always use static initial values for SSR components",
    timeEstimate: "3-4 minutes",
    confidence: 95,
    lastUpdated: new Date('2025-09-17'),
    usageCount: 12,
    successRate: 94
  },
  
  scope_error: {
    name: "JavaScript Function Hoisting Error",
    trigger: ["Cannot access", "before initialization", "ReferenceError", "temporal dead zone"],
    solution: "Move function declarations above usage or use useCallback",
    implementation: `
      // Move functions above usage
      const calculateValue = useCallback((input) => {
        // calculation logic
      }, []);
      
      // Then use in useMemo/useEffect
      const result = useMemo(() => calculateValue(data), [data, calculateValue]);
    `,
    prevention: "Declare functions before usage in React hooks",
    timeEstimate: "2-3 minutes",
    confidence: 98,
    lastUpdated: new Date('2025-09-17'),
    usageCount: 8,
    successRate: 100
  },

  form_validation: {
    name: "Form Validation Failure", 
    trigger: ["validation error", "form submit", "required field", "invalid input"],
    solution: "Zod schema with comprehensive error handling",
    implementation: `
      const schema = z.object({
        [field]: z.string().min(1, "Field is required").email("Invalid email")
      });
      const result = schema.safeParse(formData);
      if (!result.success) {
        setErrors(result.error.flatten().fieldErrors);
        return;
      }
    `,
    prevention: "Define validation schema before form implementation",
    timeEstimate: "4-5 minutes",
    confidence: 88,
    lastUpdated: new Date('2025-09-17'),
    usageCount: 15,
    successRate: 87
  },
  
  null_reference: {
    name: "Null/Undefined Reference",
    trigger: ["cannot read property", "undefined is not", "null reference", "TypeError"],
    solution: "Null checks with early returns or optional chaining",
    implementation: `
      // Option 1: Early return
      if (!data || !data.property) {
        return <ErrorState />;
      }
      
      // Option 2: Optional chaining
      const value = data?.property?.nestedValue ?? DEFAULT_VALUE;
    `,
    prevention: "Add null checks at data entry points and critical access points",
    timeEstimate: "2-3 minutes",
    confidence: 92,
    lastUpdated: new Date('2025-09-17'),
    usageCount: 25,
    successRate: 91
  },

  api_integration: {
    name: "API Integration Failure",
    trigger: ["fetch failed", "network error", "API response", "status 500", "status 404"],
    solution: "Comprehensive error handling with fallback states",
    implementation: `
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API Error:', error);
        setError(error.message);
        return DEFAULT_DATA;
      }
    `,
    prevention: "Always handle both network and application errors with user feedback",
    timeEstimate: "3-4 minutes",
    confidence: 85,
    lastUpdated: new Date('2025-09-17'),
    usageCount: 20,
    successRate: 84
  }
};

// ===================================================================
// PATTERN MATCHING ENGINE
// ===================================================================

export class BugXPatternMatcher {
  
  static matchPattern(errorDescription: string): PatternTemplate | null {
    const lowerError = errorDescription.toLowerCase();
    
    for (const [key, pattern] of Object.entries(COMMON_PATTERNS)) {
      const hasMatch = pattern.trigger.some(trigger => 
        lowerError.includes(trigger.toLowerCase())
      );
      
      if (hasMatch) {
        // Update usage statistics
        pattern.usageCount++;
        pattern.lastUpdated = new Date();
        return pattern;
      }
    }
    
    return null;
  }
  
  static getBestPatterns(limit: number = 5): PatternTemplate[] {
    return Object.values(COMMON_PATTERNS)
      .sort((a, b) => (b.confidence * b.successRate) - (a.confidence * a.successRate))
      .slice(0, limit);
  }
  
  static updatePatternSuccess(patternName: string, success: boolean): void {
    const pattern = Object.values(COMMON_PATTERNS).find(p => p.name === patternName);
    if (pattern) {
      const newSuccessRate = success 
        ? (pattern.successRate * pattern.usageCount + 100) / (pattern.usageCount + 1)
        : (pattern.successRate * pattern.usageCount) / (pattern.usageCount + 1);
      
      pattern.successRate = Math.round(newSuccessRate);
      pattern.confidence = Math.min(100, pattern.confidence + (success ? 1 : -2));
    }
  }
}