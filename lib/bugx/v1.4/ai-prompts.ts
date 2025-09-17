/**
 * BugX v1.4 AI Workflow Prompts System
 * Standardized AI prompts for consistent debugging methodology
 */

export interface AIPromptConfig {
  name: string;
  description: string;
  prompt: string;
  expectedOutput: string[];
  timeTarget: string;
  usageContext: string[];
}

export const AI_WORKFLOW_PROMPTS: Record<string, AIPromptConfig> = {
  
  BUGX_ACTIVATION: {
    name: "BugX v1.4 Activation",
    description: "Main prompt to activate BugX v1.4 debugging methodology",
    prompt: `
Apply BugX v1.4 systematic debugging to: [ISSUE_DESCRIPTION]

Target: 4-5 minutes, 85% methodology value

Process:
1. CLASSIFY: [business_logic|integration|pattern|infrastructure] 
2. PATTERN MATCH: Check common patterns library
3. CONTEXT: Component scope + data flow + criticality
4. IMPLEMENT: Root cause fix + quick validation
5. PREVENT: Apply prevention template
6. DOCUMENT: 30-second structured capture

Expected output:
- Working solution
- Prevention pattern applied
- Documentation template filled
- Pattern added to library (if new)

Context Information:
- Error Description: [ISSUE_DESCRIPTION]
- Affected Files: [FILE_LIST]
- Stack Trace: [STACK_TRACE_IF_AVAILABLE]
- Component Name: [PRIMARY_COMPONENT]
    `,
    expectedOutput: [
      "Error classification",
      "Pattern match results",
      "Context assessment",
      "Implementation plan",
      "Prevention measures",
      "Documentation entry"
    ],
    timeTarget: "4-5 minutes",
    usageContext: ["Any debugging scenario", "Primary BugX activation"]
  },

  PATTERN_MATCHING: {
    name: "Pattern Matching Analysis",
    description: "Focused prompt for pattern detection and template application",
    prompt: `
Based on error description: "[ERROR_DESCRIPTION]"

Pattern matching process:
1. Check trigger keywords against known patterns:
   - Hydration: ["server rendered text didn't match", "hydration failed", "Math.random"]
   - Scope: ["Cannot access", "before initialization", "ReferenceError"]
   - Validation: ["validation error", "form submit", "required field"]
   - Null Reference: ["cannot read property", "undefined is not", "null reference"]
   - API: ["fetch failed", "network error", "status 500", "status 404"]

2. If match found: Apply template solution + implementation
3. If variant: Adapt closest template + note differences  
4. If new: Create new pattern template for library

Provide:
- Pattern identification (name + confidence %)
- Template-based solution
- Implementation code
- Prevention measures
- Documentation entry

Pattern Library Update:
- Usage count increment
- Success rate tracking
- Confidence adjustment
    `,
    expectedOutput: [
      "Pattern match identification",
      "Confidence percentage",
      "Template solution",
      "Implementation code",
      "Prevention recommendations"
    ],
    timeTarget: "1-2 minutes",
    usageContext: ["Error pattern recognition", "Template application"]
  },

  CONTEXT_ANALYSIS: {
    name: "Context Assessment",
    description: "Rapid context analysis for debugging scope and impact",
    prompt: `
Analyze debugging context for: [COMPONENT/ISSUE]

Rapid assessment (60 seconds):

COMPONENT SCOPE:
- Primary component: [IDENTIFY_MAIN_COMPONENT]
- Related components (2 degrees): [LIST_CONNECTED_COMPONENTS]
- Critical dependencies: [FLAG_IMPORTANT_DEPS]

DATA FLOW IMPACT:
- Input source: [WHERE_DATA_COMES_FROM]
- Transformation point: [WHERE_PROCESSING_OCCURS] 
- Error location: [WHERE_FAILURE_HAPPENS]
- Downstream effects: [WHAT_BREAKS_NEXT]

COMPLEXITY ASSESSMENT:
- Simple: Single component, clear error, known pattern
- Moderate: Multiple components, integration points, partial unknowns
- Complex: System-wide impact, novel patterns, architectural concerns

CRITICALITY MATRIX:
- User Impact: [NONE/LOW/MEDIUM/HIGH]
- Production Risk: [SAFE/CAUTION/DANGER]
- Testing Needs: [UNIT/INTEGRATION/E2E]

RECOMMENDED APPROACH:
- Simple → Quick fix + documentation
- Moderate → BugX v1.4 (4-5 minutes)
- Complex → Full BugX (10-15 minutes)

Output format:
- Primary component: [NAME]
- Dependencies: [LIST]
- Data flow: [INPUT] -> [PROCESS] -> [ERROR] -> [EFFECTS]
- Complexity: [SIMPLE/MODERATE/COMPLEX]
- Risk level: [LOW/MEDIUM/HIGH]
- Recommended approach: [QUICK_FIX/BUGX_V14/FULL_BUGX]
- Testing needs: [UNIT/INTEGRATION/E2E]
    `,
    expectedOutput: [
      "Component relationship map",
      "Data flow analysis",
      "Complexity classification", 
      "Risk assessment",
      "Approach recommendation",
      "Testing requirements"
    ],
    timeTarget: "60 seconds",
    usageContext: ["Debugging scope assessment", "Approach selection"]
  },

  PREVENTION_APPLICATION: {
    name: "Prevention Measures",
    description: "Apply systematic prevention patterns for resolved issues",
    prompt: `
Apply prevention measures for: [RESOLVED_ISSUE]

Prevention categories analysis:

ARCHITECTURE PREVENTION:
- Error boundaries for crash isolation
- Defensive programming patterns
- Type guards and runtime validation
- Component design patterns

VALIDATION PREVENTION:
- Schema validation (Zod/Yup)
- Input sanitization patterns
- Error handling standardization
- Data integrity checks

TESTING PREVENTION:
- Unit tests for edge cases
- Integration tests for data flow
- E2E tests for critical paths
- Error scenario coverage

DOCUMENTATION PREVENTION:
- Pattern documentation for team
- Decision records (ADRs)
- Common pitfalls guide
- Code review checklists

Based on issue type [ISSUE_TYPE]:
1. Select appropriate prevention category
2. Implement specific prevention pattern
3. Create documentation template
4. Update team knowledge base

Provide:
- Prevention pattern selection and rationale
- Implementation approach with code examples
- Documentation template
- Template library update (if new pattern)
- Team sharing recommendations
    `,
    expectedOutput: [
      "Prevention category selection",
      "Implementation approach",
      "Code examples",
      "Documentation template",
      "Knowledge sharing plan"
    ],
    timeTarget: "1-2 minutes",
    usageContext: ["Post-fix prevention", "Pattern library updates"]
  },

  QUICK_VALIDATION: {
    name: "Quick Validation Protocol",
    description: "Rapid validation of applied fixes",
    prompt: `
Quick validation protocol for: [APPLIED_FIX]

VALIDATION CHECKLIST (2 minutes max):

ROOT CAUSE VERIFICATION:
✓ Original error no longer occurs
✓ Fix addresses cause, not symptom
✓ Solution follows established patterns
✓ Edge cases are considered

REGRESSION CHECK:
✓ No new errors introduced
✓ Related functionality still works
✓ Performance impact acceptable
✓ UI/UX remains consistent

FUNCTIONAL VALIDATION:
✓ Primary use case works
✓ Error handling improved
✓ User experience enhanced
✓ Integration points stable

TESTING REQUIREMENTS:
- Unit: [IF_LOGIC_CHANGED]
- Integration: [IF_MULTIPLE_COMPONENTS]
- E2E: [IF_CRITICAL_USER_FLOW]

Provide validation results:
- Checklist completion status
- Any issues discovered
- Recommended next steps
- Testing coverage assessment
    `,
    expectedOutput: [
      "Validation checklist results",
      "Issue identification",
      "Next step recommendations",
      "Testing assessment"
    ],
    timeTarget: "2 minutes",
    usageContext: ["Fix validation", "Quality assurance"]
  },

  DOCUMENTATION_CAPTURE: {
    name: "30-Second Documentation",
    description: "Rapid documentation capture for knowledge sharing",
    prompt: `
30-second documentation capture for: [DEBUGGING_SESSION]

STRUCTURED TEMPLATE:

## [ERROR_TYPE] - [COMPONENT_NAME]

**Issue**: [Brief description of what went wrong]
**Root Cause**: [Underlying cause that created the issue]
**Solution**: [Applied fix - be specific]  
**Prevention**: [Pattern applied to prevent recurrence]
**Pattern**: [Reusable template for similar issues]

**Metadata**:
- Template Category: [business_logic|integration|pattern|infrastructure]
- Reusability: [high|medium|low]
- Time to Fix: [ACTUAL_TIME]
- Confidence: [SUCCESS_CONFIDENCE_%]

**Code Example**:
\`\`\`typescript
// Before (problematic code)
[BEFORE_CODE]

// After (fixed code)  
[AFTER_CODE]
\`\`\`

**Prevention Implementation**:
\`\`\`typescript
[PREVENTION_CODE]
\`\`\`

**Team Notes**: [Any insights for future reference]

Generate concise documentation following this template.
    `,
    expectedOutput: [
      "Structured issue documentation",
      "Code before/after examples",
      "Prevention code samples",
      "Metadata for categorization",
      "Team knowledge notes"
    ],
    timeTarget: "30 seconds",
    usageContext: ["Knowledge capture", "Team sharing"]
  }
};

export class BugXAIPromptManager {
  
  static generatePrompt(
    promptType: keyof typeof AI_WORKFLOW_PROMPTS,
    variables: Record<string, string>
  ): string {
    const promptConfig = AI_WORKFLOW_PROMPTS[promptType];
    let prompt = promptConfig.prompt;
    
    // Replace variables in prompt
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase()}]`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return prompt;
  }
  
  static getPromptForErrorType(errorDescription: string): string {
    // Analyze error description to determine best prompt
    const lowerError = errorDescription.toLowerCase();
    
    // Check for pattern matching scenarios
    const patternKeywords = ['hydration', 'scope', 'validation', 'null', 'api'];
    const hasPatternKeyword = patternKeywords.some(keyword => 
      lowerError.includes(keyword)
    );
    
    if (hasPatternKeyword) {
      return this.generatePrompt('PATTERN_MATCHING', {
        ERROR_DESCRIPTION: errorDescription
      });
    }
    
    // Default to main BugX activation
    return this.generatePrompt('BUGX_ACTIVATION', {
      ISSUE_DESCRIPTION: errorDescription
    });
  }
  
  static validatePromptOutput(
    promptType: keyof typeof AI_WORKFLOW_PROMPTS,
    output: string
  ): { valid: boolean; missing: string[] } {
    const promptConfig = AI_WORKFLOW_PROMPTS[promptType];
    const expectedOutputs = promptConfig.expectedOutput;
    
    const missing = expectedOutputs.filter(expected => 
      !output.toLowerCase().includes(expected.toLowerCase())
    );
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
  
  static getWorkflowSequence(): Array<keyof typeof AI_WORKFLOW_PROMPTS> {
    return [
      'BUGX_ACTIVATION',
      'PATTERN_MATCHING',  
      'CONTEXT_ANALYSIS',
      'PREVENTION_APPLICATION',
      'QUICK_VALIDATION',
      'DOCUMENTATION_CAPTURE'
    ];
  }
}