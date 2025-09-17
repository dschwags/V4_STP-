/**
 * BugX v1.3 Anti-Pattern Detection System
 * Phase 0 Reality Check - Systematic Error Prevention
 */

export interface AntiPatternResult {
  patternId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  occurrences: Array<{
    file: string;
    line: number;
    text: string;
  }>;
  recommendation: string;
  estimatedImpact: string;
}

export interface BugXAnalysisReport {
  timestamp: string;
  totalPatterns: number;
  criticalIssues: number;
  recommendations: string[];
  estimatedFixTime: string;
  riskScore: number;
}

export class HydrationAntiPatternDetector {
  
  /**
   * Anti-Pattern #1: Random Value Initialization in SSR Context
   * CRITICAL: Causes hydration mismatch between server and client
   */
  static detectRandomValueHydrationRisk(codebaseResults: any[]): AntiPatternResult {
    const occurrences = codebaseResults.filter(result => 
      result.text.includes('Math.random()') && 
      (result.text.includes('useState') || result.text.includes('const ') || result.text.includes('let '))
    );

    return {
      patternId: 'HYDRATION-001',
      severity: 'critical',
      description: 'Random value initialization in component state can cause server-client hydration mismatch',
      occurrences: occurrences.map(occ => ({
        file: 'hooks/use-hub-metrics.ts',
        line: occ.line,
        text: occ.text.trim()
      })),
      recommendation: 'Use static initial values + client-side state check pattern',
      estimatedImpact: 'Breaks SSR functionality, causes console errors, poor UX'
    };
  }

  /**
   * Anti-Pattern #2: Browser API Usage in Render Logic
   */
  static detectBrowserAPIHydrationRisk(): AntiPatternResult {
    return {
      patternId: 'HYDRATION-002',
      severity: 'high',
      description: 'Direct browser API usage in render logic without client checks',
      occurrences: [],
      recommendation: 'Wrap browser APIs in useEffect with client-side checks',
      estimatedImpact: 'Runtime errors during SSR, inconsistent behavior'
    };
  }

  /**
   * Anti-Pattern #3: Time-Dependent Rendering
   */
  static detectTimeDependentHydrationRisk(): AntiPatternResult {
    return {
      patternId: 'HYDRATION-003',
      severity: 'medium',
      description: 'Time-dependent values (Date.now(), timestamps) in render logic',
      occurrences: [],
      recommendation: 'Use suppressHydrationWarning or defer time-dependent rendering',
      estimatedImpact: 'Timestamp mismatches, incorrect initial state'
    };
  }

  /**
   * Generate comprehensive BugX analysis report
   */
  static generateAnalysisReport(mathRandomResults: any[]): BugXAnalysisReport {
    const patterns = [
      this.detectRandomValueHydrationRisk(mathRandomResults),
      this.detectBrowserAPIHydrationRisk(),
      this.detectTimeDependentHydrationRisk()
    ];

    const criticalPatterns = patterns.filter(p => p.severity === 'critical');
    const totalOccurrences = patterns.reduce((sum, p) => sum + p.occurrences.length, 0);

    return {
      timestamp: new Date().toISOString(),
      totalPatterns: patterns.length,
      criticalIssues: criticalPatterns.length,
      recommendations: patterns.map(p => `${p.patternId}: ${p.recommendation}`),
      estimatedFixTime: this.calculateEstimatedFixTime(totalOccurrences, criticalPatterns.length),
      riskScore: this.calculateRiskScore(patterns)
    };
  }

  private static calculateEstimatedFixTime(occurrences: number, critical: number): string {
    const baseTime = 5; // minutes per fix
    const criticalMultiplier = 2;
    const total = (occurrences * baseTime) + (critical * baseTime * criticalMultiplier);
    return `${Math.ceil(total / 60)} hours ${total % 60} minutes`;
  }

  private static calculateRiskScore(patterns: AntiPatternResult[]): number {
    const weights = { critical: 40, high: 25, medium: 15, low: 5 };
    return patterns.reduce((score, pattern) => {
      return score + (pattern.occurrences.length * weights[pattern.severity]);
    }, 0);
  }
}