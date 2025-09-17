/**
 * BugX v1.4 Context Analysis Engine
 * Rapid 60-second context assessment for systematic debugging
 */

export interface ContextAssessment {
  componentScope: {
    primary: string;
    related: string[];
    dependencies: string[];
  };
  dataFlow: {
    inputSource: string;
    transformationPoint: string;
    errorLocation: string;
    downstreamEffects: string[];
  };
  systemCriticality: {
    userImpact: 'none' | 'low' | 'medium' | 'high';
    productionRisk: 'safe' | 'caution' | 'danger';
    testingNeeds: ('unit' | 'integration' | 'e2e')[];
  };
  complexity: 'simple' | 'moderate' | 'complex';
  recommendedApproach: 'quick_fix' | 'bugx_v14' | 'full_bugx';
}

export const CONTEXT_ANALYSIS_PROMPT = `
RAPID CONTEXT ASSESSMENT:

COMPONENT SCOPE:
- Primary affected component: [IDENTIFY]
- Related components (2 degrees): [LIST]
- Critical dependencies: [FLAG]

DATA FLOW IMPACT: 
- Input source: [WHERE DATA COMES FROM]
- Transformation point: [WHERE PROCESSING OCCURS]
- Error location: [WHERE FAILURE HAPPENS]
- Downstream effects: [WHAT BREAKS NEXT]

SYSTEM CRITICALITY:
- User impact: [NONE/LOW/MEDIUM/HIGH]
- Production risk: [SAFE/CAUTION/DANGER]
- Testing needs: [UNIT/INTEGRATION/E2E]
`;

export const COMPLEXITY_FACTORS = {
  simple: {
    description: "Single component, clear error message, known pattern",
    characteristics: [
      "Error isolated to one component",
      "Clear error message with line number",
      "Matches known pattern template",
      "No cross-component dependencies affected"
    ],
    timeEstimate: "2-3 minutes",
    approach: "quick_fix" as const
  },
  moderate: {
    description: "Multiple components, integration points, some unknowns", 
    characteristics: [
      "Error spans 2-3 components",
      "Integration points involved",
      "Partial pattern match or variant",
      "Some downstream effects"
    ],
    timeEstimate: "4-5 minutes",
    approach: "bugx_v14" as const
  },
  complex: {
    description: "System-wide impact, novel patterns, architectural concerns",
    characteristics: [
      "System-wide or architectural impact",
      "Novel error patterns or unknown causes",
      "Multiple integration layers affected",
      "Significant downstream effects"
    ],
    timeEstimate: "10-15 minutes",
    approach: "full_bugx" as const
  }
};

export class BugXContextAnalyzer {
  
  static assessComplexity(
    errorDescription: string,
    affectedFiles: string[],
    stackTrace?: string[]
  ): ContextAssessment['complexity'] {
    let complexityScore = 0;
    
    // File count impact
    if (affectedFiles.length > 3) complexityScore += 2;
    else if (affectedFiles.length > 1) complexityScore += 1;
    
    // Stack trace depth
    if (stackTrace && stackTrace.length > 10) complexityScore += 2;
    else if (stackTrace && stackTrace.length > 5) complexityScore += 1;
    
    // Error description complexity
    const complexityIndicators = [
      'architecture', 'system', 'multiple', 'integration',
      'unknown', 'unexpected', 'intermittent', 'race condition'
    ];
    
    const matches = complexityIndicators.filter(indicator => 
      errorDescription.toLowerCase().includes(indicator)
    ).length;
    
    complexityScore += matches;
    
    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'moderate';
    return 'simple';
  }
  
  static assessUserImpact(
    componentName: string,
    errorType: string
  ): ContextAssessment['systemCriticality']['userImpact'] {
    const criticalComponents = [
      'auth', 'login', 'payment', 'checkout', 'submit'
    ];
    
    const highImpactErrors = [
      'crash', 'error boundary', 'white screen', 'data loss'
    ];
    
    const isCriticalComponent = criticalComponents.some(comp =>
      componentName.toLowerCase().includes(comp)
    );
    
    const isHighImpactError = highImpactErrors.some(error =>
      errorType.toLowerCase().includes(error)
    );
    
    if (isCriticalComponent || isHighImpactError) return 'high';
    if (errorType.includes('validation') || errorType.includes('form')) return 'medium';
    if (errorType.includes('cosmetic') || errorType.includes('display')) return 'low';
    return 'medium'; // Default to medium for unknown cases
  }
  
  static generateContextAssessment(
    errorDescription: string,
    componentName: string,
    affectedFiles: string[] = [],
    stackTrace: string[] = []
  ): ContextAssessment {
    const complexity = this.assessComplexity(errorDescription, affectedFiles, stackTrace);
    const userImpact = this.assessUserImpact(componentName, errorDescription);
    
    // Extract related components from file paths
    const relatedComponents = affectedFiles
      .map(file => file.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, ''))
      .filter(Boolean)
      .slice(0, 5); // Limit to 5 most relevant
    
    // Determine dependencies from imports or known patterns
    const dependencies = this.extractDependencies(affectedFiles);
    
    // Assess production risk
    const productionRisk = this.assessProductionRisk(userImpact, complexity);
    
    // Determine testing needs
    const testingNeeds = this.determineTestingNeeds(complexity, userImpact);
    
    // Recommend approach based on complexity and impact
    const recommendedApproach = this.recommendApproach(complexity, userImpact);
    
    return {
      componentScope: {
        primary: componentName,
        related: relatedComponents as string[],
        dependencies
      },
      dataFlow: {
        inputSource: this.inferInputSource(errorDescription, componentName),
        transformationPoint: this.inferTransformationPoint(errorDescription),
        errorLocation: componentName,
        downstreamEffects: this.inferDownstreamEffects(relatedComponents as string[])
      },
      systemCriticality: {
        userImpact,
        productionRisk,
        testingNeeds
      },
      complexity,
      recommendedApproach
    };
  }
  
  private static extractDependencies(affectedFiles: string[]): string[] {
    // Simple heuristic - extract from common patterns
    const commonDeps = ['react', 'next', 'api', 'database', 'auth'];
    return commonDeps.filter(dep => 
      affectedFiles.some(file => file.toLowerCase().includes(dep))
    );
  }
  
  private static assessProductionRisk(
    userImpact: ContextAssessment['systemCriticality']['userImpact'],
    complexity: ContextAssessment['complexity']
  ): ContextAssessment['systemCriticality']['productionRisk'] {
    if (userImpact === 'high' || complexity === 'complex') return 'danger';
    if (userImpact === 'medium' || complexity === 'moderate') return 'caution';
    return 'safe';
  }
  
  private static determineTestingNeeds(
    complexity: ContextAssessment['complexity'],
    userImpact: ContextAssessment['systemCriticality']['userImpact']
  ): ('unit' | 'integration' | 'e2e')[] {
    const needs: ('unit' | 'integration' | 'e2e')[] = ['unit'];
    
    if (complexity === 'moderate' || userImpact === 'medium') {
      needs.push('integration');
    }
    
    if (complexity === 'complex' || userImpact === 'high') {
      needs.push('integration', 'e2e');
    }
    
    return [...new Set(needs)]; // Remove duplicates
  }
  
  private static recommendApproach(
    complexity: ContextAssessment['complexity'],
    userImpact: ContextAssessment['systemCriticality']['userImpact']
  ): ContextAssessment['recommendedApproach'] {
    if (complexity === 'complex' || userImpact === 'high') return 'full_bugx';
    if (complexity === 'moderate') return 'bugx_v14';
    return 'quick_fix';
  }
  
  private static inferInputSource(errorDescription: string, componentName: string): string {
    if (errorDescription.includes('api') || errorDescription.includes('fetch')) return 'API call';
    if (errorDescription.includes('form') || errorDescription.includes('input')) return 'User input';
    if (errorDescription.includes('prop') || errorDescription.includes('parent')) return 'Parent component';
    if (errorDescription.includes('state') || errorDescription.includes('hook')) return 'Component state';
    return 'Unknown source';
  }
  
  private static inferTransformationPoint(errorDescription: string): string {
    if (errorDescription.includes('calculation') || errorDescription.includes('compute')) return 'Data calculation';
    if (errorDescription.includes('validation') || errorDescription.includes('schema')) return 'Data validation';
    if (errorDescription.includes('render') || errorDescription.includes('display')) return 'Render logic';
    if (errorDescription.includes('effect') || errorDescription.includes('callback')) return 'Side effect';
    return 'Component logic';
  }
  
  private static inferDownstreamEffects(relatedComponents: string[]): string[] {
    return relatedComponents.map(comp => `${comp} may be affected`);
  }
}