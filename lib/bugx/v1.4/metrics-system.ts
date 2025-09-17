/**
 * BugX v1.4 Metrics and Documentation System
 * Performance tracking and knowledge management
 */

export interface BugXMetrics {
  timeEfficiency: {
    averageDebugTime: number; // Target: 4-5 minutes
    templateUsageRate: number; // Target: >70%
    patternMatchAccuracy: number; // Target: >80%
    quickFixComparison: number; // Ratio vs traditional debugging
  };
  
  qualityImpact: {
    bugRecurrenceRate: number; // Target: <10%
    preventionEffectiveness: number; // Target: >75% 
    teamKnowledgeSharing: number; // Target: measurable growth
    codeQualityImprovement: number; // Based on review metrics
  };
  
  libraryGrowth: {
    newPatternsPerMonth: number;
    patternMaturityDistribution: Record<string, number>;
    unusedPatternCleanup: number;
    templateSuccessRates: Record<string, number>;
  };
  
  teamAdoption: {
    activeUsers: number;
    usageFrequency: number; // Uses per week per developer
    methodologyAdherence: number; // % following full process
    satisfactionScore: number; // Developer feedback score
  };
}

export interface BugXSession {
  id: string;
  timestamp: Date;
  developer: string;
  errorType: string;
  componentName: string;
  patternUsed?: string;
  timeToResolution: number; // milliseconds
  approach: 'quick_fix' | 'bugx_v14' | 'full_bugx';
  success: boolean;
  preventionApplied: boolean;
  documentationCreated: boolean;
  recurrenceWithin30Days: boolean;
  satisfactionRating?: number; // 1-10
  notes?: string;
}

export interface DocumentationEntry {
  id: string;
  title: string;
  errorType: string;
  component: string;
  issue: string;
  rootCause: string;
  solution: string;
  prevention: string;
  patternTemplate: string;
  category: 'business_logic' | 'integration' | 'pattern' | 'infrastructure';
  reusability: 'high' | 'medium' | 'low';
  timeToFix: number;
  confidence: number;
  codeExamples: {
    before: string;
    after: string;
    prevention: string;
  };
  teamNotes: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  effectiveness: number; // 0-100 based on success rate when applied
}

export const DOCUMENTATION_TEMPLATE = `
## [ERROR_TYPE] - [COMPONENT_NAME]

**Issue**: [Brief description of what went wrong]

**Root Cause**: [Underlying cause that created the issue]

**Solution**: [Applied fix - be specific]  

**Prevention**: [Pattern applied to prevent recurrence]

**Pattern**: [Reusable template for similar issues]

Template Category: [business_logic|integration|pattern|infrastructure]

Reusability: [high|medium|low]
`;

export class BugXMetricsCollector {
  private static sessions: BugXSession[] = [];
  private static documentation: DocumentationEntry[] = [];
  
  static startSession(
    developer: string,
    errorType: string,
    componentName: string
  ): string {
    const sessionId = `bugx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: BugXSession = {
      id: sessionId,
      timestamp: new Date(),
      developer,
      errorType,
      componentName,
      timeToResolution: 0,
      approach: 'bugx_v14', // Default
      success: false,
      preventionApplied: false,
      documentationCreated: false,
      recurrenceWithin30Days: false
    };
    
    this.sessions.push(session);
    return sessionId;
  }
  
  static completeSession(
    sessionId: string,
    result: {
      patternUsed?: string;
      approach: BugXSession['approach'];
      success: boolean;
      preventionApplied: boolean;
      documentationCreated: boolean;
      satisfactionRating?: number;
      notes?: string;
    }
  ): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    session.timeToResolution = Date.now() - session.timestamp.getTime();
    session.patternUsed = result.patternUsed;
    session.approach = result.approach;
    session.success = result.success;
    session.preventionApplied = result.preventionApplied;
    session.documentationCreated = result.documentationCreated;
    session.satisfactionRating = result.satisfactionRating;
    session.notes = result.notes;
  }
  
  static addDocumentation(entry: Omit<DocumentationEntry, 'id' | 'createdAt' | 'usageCount' | 'effectiveness'>): string {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const documentation: DocumentationEntry = {
      ...entry,
      id: docId,
      createdAt: new Date(),
      usageCount: 0,
      effectiveness: 100 // Start with high confidence
    };
    
    this.documentation.push(documentation);
    return docId;
  }
  
  static recordDocumentationUsage(docId: string, successful: boolean): void {
    const doc = this.documentation.find(d => d.id === docId);
    if (!doc) return;
    
    doc.usageCount++;
    doc.lastUsed = new Date();
    
    // Update effectiveness based on usage success
    const currentEffectiveness = doc.effectiveness;
    const newEffectiveness = successful 
      ? Math.min(100, currentEffectiveness + 1)
      : Math.max(0, currentEffectiveness - 5);
    
    doc.effectiveness = newEffectiveness;
  }
  
  static calculateMetrics(): BugXMetrics {
    const recentSessions = this.sessions.filter(s => 
      s.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    
    const successfulSessions = recentSessions.filter(s => s.success);
    const patternUsedSessions = recentSessions.filter(s => s.patternUsed);
    
    // Time efficiency calculations
    const averageDebugTime = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.timeToResolution, 0) / recentSessions.length
      : 0;
    
    const templateUsageRate = recentSessions.length > 0
      ? (patternUsedSessions.length / recentSessions.length) * 100
      : 0;
    
    const patternMatchAccuracy = patternUsedSessions.length > 0
      ? (patternUsedSessions.filter(s => s.success).length / patternUsedSessions.length) * 100
      : 0;
    
    // Quality impact calculations
    const bugRecurrenceRate = this.calculateRecurrenceRate();
    const preventionEffectiveness = recentSessions.length > 0
      ? (recentSessions.filter(s => s.preventionApplied).length / recentSessions.length) * 100
      : 0;
    
    // Library growth calculations
    const recentDocs = this.documentation.filter(d => 
      d.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const patternDistribution = this.calculatePatternDistribution();
    const templateSuccessRates = this.calculateTemplateSuccessRates();
    
    // Team adoption calculations
    const uniqueDevelopers = new Set(recentSessions.map(s => s.developer)).size;
    const usageFrequency = uniqueDevelopers > 0 
      ? recentSessions.length / uniqueDevelopers / 4 // Per week
      : 0;
    
    const satisfactionScore = this.calculateSatisfactionScore();
    
    return {
      timeEfficiency: {
        averageDebugTime: Math.round(averageDebugTime / 60000), // Convert to minutes
        templateUsageRate: Math.round(templateUsageRate),
        patternMatchAccuracy: Math.round(patternMatchAccuracy),
        quickFixComparison: this.calculateQuickFixComparison()
      },
      
      qualityImpact: {
        bugRecurrenceRate: Math.round(bugRecurrenceRate),
        preventionEffectiveness: Math.round(preventionEffectiveness),
        teamKnowledgeSharing: this.documentation.length,
        codeQualityImprovement: this.calculateQualityImprovement()
      },
      
      libraryGrowth: {
        newPatternsPerMonth: recentDocs.length,
        patternMaturityDistribution: patternDistribution,
        unusedPatternCleanup: this.calculateUnusedPatterns(),
        templateSuccessRates
      },
      
      teamAdoption: {
        activeUsers: uniqueDevelopers,
        usageFrequency: Math.round(usageFrequency * 10) / 10,
        methodologyAdherence: this.calculateMethodologyAdherence(),
        satisfactionScore: Math.round(satisfactionScore * 10) / 10
      }
    };
  }
  
  private static calculateRecurrenceRate(): number {
    // Check for similar errors within 30 days
    const errorTypes = new Map<string, BugXSession[]>();
    
    this.sessions.forEach(session => {
      const key = `${session.errorType}-${session.componentName}`;
      if (!errorTypes.has(key)) {
        errorTypes.set(key, []);
      }
      errorTypes.get(key)!.push(session);
    });
    
    let recurrences = 0;
    let totalResolutions = 0;
    
    errorTypes.forEach(sessions => {
      const sortedSessions = sessions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      for (let i = 1; i < sortedSessions.length; i++) {
        const timeDiff = sortedSessions[i].timestamp.getTime() - sortedSessions[i-1].timestamp.getTime();
        if (timeDiff <= 30 * 24 * 60 * 60 * 1000) { // 30 days
          recurrences++;
        }
        totalResolutions++;
      }
    });
    
    return totalResolutions > 0 ? (recurrences / totalResolutions) * 100 : 0;
  }
  
  private static calculatePatternDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.documentation.forEach(doc => {
      distribution[doc.category] = (distribution[doc.category] || 0) + 1;
    });
    
    return distribution;
  }
  
  private static calculateTemplateSuccessRates(): Record<string, number> {
    const rates: Record<string, number> = {};
    
    this.documentation.forEach(doc => {
      rates[doc.title] = doc.effectiveness;
    });
    
    return rates;
  }
  
  private static calculateQuickFixComparison(): number {
    // Estimate: BugX v1.4 takes 4-5 minutes vs 2-3 minutes for quick fixes
    // But prevents 75% of recurrences, saving ~15 minutes per prevented recurrence
    const avgBugXTime = 4.5;
    const avgQuickFixTime = 2.5;
    const recurrencePrevention = 0.75;
    const avgRecurrenceFixTime = 15;
    
    const totalBugXCost = avgBugXTime;
    const totalQuickFixCost = avgQuickFixTime + (1 - recurrencePrevention) * avgRecurrenceFixTime;
    
    return Math.round((totalQuickFixCost / totalBugXCost) * 100) / 100;
  }
  
  private static calculateQualityImprovement(): number {
    // Based on prevention measures applied and recurrence rates
    const recentSessions = this.sessions.filter(s => 
      s.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const preventionRate = recentSessions.length > 0
      ? (recentSessions.filter(s => s.preventionApplied).length / recentSessions.length) * 100
      : 0;
    
    return Math.round(preventionRate);
  }
  
  private static calculateUnusedPatterns(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return this.documentation.filter(doc => 
      !doc.lastUsed || doc.lastUsed < thirtyDaysAgo
    ).length;
  }
  
  private static calculateMethodologyAdherence(): number {
    const recentSessions = this.sessions.filter(s => 
      s.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const fullProcessSessions = recentSessions.filter(s => 
      s.approach === 'bugx_v14' && s.preventionApplied && s.documentationCreated
    );
    
    return recentSessions.length > 0
      ? (fullProcessSessions.length / recentSessions.length) * 100
      : 0;
  }
  
  private static calculateSatisfactionScore(): number {
    const ratingsessions = this.sessions.filter(s => s.satisfactionRating !== undefined);
    
    if (ratingsessions.length === 0) return 0;
    
    const totalScore = ratingsessions.reduce((sum, s) => sum + (s.satisfactionRating || 0), 0);
    return totalScore / ratingsessions.length;
  }
  
  static generateReport(): string {
    const metrics = this.calculateMetrics();
    
    return `
# BugX v1.4 Performance Report

## Time Efficiency Metrics
- **Average Debug Time**: ${metrics.timeEfficiency.averageDebugTime} minutes (Target: 4-5 min)
- **Template Usage Rate**: ${metrics.timeEfficiency.templateUsageRate}% (Target: >70%)
- **Pattern Match Accuracy**: ${metrics.timeEfficiency.patternMatchAccuracy}% (Target: >80%)
- **Efficiency vs Quick Fix**: ${metrics.timeEfficiency.quickFixComparison}x better long-term value

## Quality Impact
- **Bug Recurrence Rate**: ${metrics.qualityImpact.bugRecurrenceRate}% (Target: <10%)
- **Prevention Effectiveness**: ${metrics.qualityImpact.preventionEffectiveness}% (Target: >75%)
- **Knowledge Base Size**: ${metrics.qualityImpact.teamKnowledgeSharing} documented patterns
- **Code Quality Improvement**: ${metrics.qualityImpact.codeQualityImprovement}%

## Library Growth
- **New Patterns This Month**: ${metrics.libraryGrowth.newPatternsPerMonth}
- **Pattern Distribution**: ${JSON.stringify(metrics.libraryGrowth.patternMaturityDistribution)}
- **Unused Patterns**: ${metrics.libraryGrowth.unusedPatternCleanup} (cleanup candidates)

## Team Adoption
- **Active Users**: ${metrics.teamAdoption.activeUsers} developers
- **Usage Frequency**: ${metrics.teamAdoption.usageFrequency} times/week per developer
- **Methodology Adherence**: ${metrics.teamAdoption.methodologyAdherence}%
- **Satisfaction Score**: ${metrics.teamAdoption.satisfactionScore}/10

## Recommendations
${this.generateRecommendations(metrics)}
    `.trim();
  }
  
  private static generateRecommendations(metrics: BugXMetrics): string {
    const recommendations: string[] = [];
    
    if (metrics.timeEfficiency.averageDebugTime > 5) {
      recommendations.push("- Focus on pattern template optimization to reduce debug time");
    }
    
    if (metrics.timeEfficiency.templateUsageRate < 70) {
      recommendations.push("- Improve pattern recognition training for team");
    }
    
    if (metrics.qualityImpact.bugRecurrenceRate > 10) {
      recommendations.push("- Strengthen prevention measure application");
    }
    
    if (metrics.teamAdoption.methodologyAdherence < 80) {
      recommendations.push("- Provide additional BugX v1.4 methodology training");
    }
    
    if (metrics.libraryGrowth.unusedPatternCleanup > 5) {
      recommendations.push("- Review and clean up unused patterns from library");
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : "- System performing well, continue current practices";
  }
}