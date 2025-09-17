/**
 * BugX v1.4 Integration System
 * Complete workflow orchestration and team integration
 */

import { BugXCoreSystem, PatternTemplate } from './core-system';
import { ContextAnalysisEngine } from './context-analysis';
import { ImplementationEngine } from './implementation-engine';
import { AIWorkflowPrompts } from './ai-prompts';
import { BugXMetricsCollector, BugXSession } from './metrics-system';
import { PatternRecognitionEngine, PatternMatch, AntiPattern } from './pattern-recognition';

export interface BugXWorkflowConfig {
  timeTarget: number; // Target resolution time in minutes (default: 4-5)
  aiAssisted: boolean; // Whether to use AI prompts (default: true)
  metricsEnabled: boolean; // Whether to collect metrics (default: true)
  preventionRequired: boolean; // Whether prevention is mandatory (default: true)
  documentationRequired: boolean; // Whether documentation is mandatory (default: true)
  patternRecognitionEnabled: boolean; // Whether to use pattern recognition (default: true)
  teamIntegration: {
    notifyOnCritical: boolean; // Notify team on critical issues
    sharePatterns: boolean; // Auto-share discovered patterns
    requireReviews: boolean; // Require peer reviews for solutions
  };
}

export interface BugXWorkflowResult {
  sessionId: string;
  success: boolean;
  timeSpent: number; // minutes
  approach: 'quick_fix' | 'bugx_v14' | 'full_bugx';
  patternMatches: PatternMatch[];
  antiPatterns: AntiPattern[];
  appliedTemplate?: PatternTemplate;
  preventionMeasures: string[];
  documentationCreated: boolean;
  metrics: {
    efficiency: number; // vs quick fix approach
    qualityScore: number; // 0-100 based on prevention and documentation
    teamImpact: number; // knowledge sharing value
  };
  recommendations: string[];
  nextSteps: string[];
}

export interface TeamKnowledgeEntry {
  id: string;
  title: string;
  errorSignature: string;
  solution: string;
  prevention: string;
  sharedBy: string;
  sharedAt: Date;
  usageCount: number;
  effectiveness: number; // 0-100
  teamFeedback: {
    helpful: number;
    notHelpful: number;
    comments: string[];
  };
}

export const DEFAULT_CONFIG: BugXWorkflowConfig = {
  timeTarget: 4.5,
  aiAssisted: true,
  metricsEnabled: true,
  preventionRequired: true,
  documentationRequired: true,
  patternRecognitionEnabled: true,
  teamIntegration: {
    notifyOnCritical: true,
    sharePatterns: true,
    requireReviews: false
  }
};

export class BugXIntegrationSystem {
  private static config: BugXWorkflowConfig = DEFAULT_CONFIG;
  private static teamKnowledge: TeamKnowledgeEntry[] = [];
  
  static configure(newConfig: Partial<BugXWorkflowConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  static async runCompleteWorkflow(
    developer: string,
    errorDetails: {
      message: string;
      stackTrace: string;
      codeContext: string;
      fileName: string;
      component: string;
    },
    options: Partial<BugXWorkflowConfig> = {}
  ): Promise<BugXWorkflowResult> {
    
    const workflowConfig = { ...this.config, ...options };
    const startTime = Date.now();
    
    // Phase 1: Initialize session
    const sessionId = this.config.metricsEnabled 
      ? BugXMetricsCollector.startSession(developer, errorDetails.message, errorDetails.component)
      : `session-${Date.now()}`;
    
    console.log(`🚀 BugX v1.4 Workflow Started`);
    console.log(`Session ID: ${sessionId}`);
    console.log(`Developer: ${developer}`);
    console.log(`Target Time: ${workflowConfig.timeTarget} minutes`);
    
    try {
      // Phase 2: Pattern Recognition (if enabled)
      let patternMatches: PatternMatch[] = [];
      let antiPatterns: AntiPattern[] = [];
      
      if (workflowConfig.patternRecognitionEnabled) {
        console.log(`\n📊 Phase 2: Pattern Recognition`);
        
        patternMatches = PatternRecognitionEngine.analyzeError(
          errorDetails.message,
          errorDetails.stackTrace,
          errorDetails.codeContext,
          errorDetails.fileName
        );
        
        antiPatterns = PatternRecognitionEngine.detectAntiPatterns(
          errorDetails.codeContext,
          errorDetails.fileName
        );
        
        console.log(`Found ${patternMatches.length} pattern matches`);
        console.log(`Detected ${antiPatterns.length} anti-patterns`);
        
        if (patternMatches.length > 0) {
          const bestMatch = patternMatches[0];
          console.log(`Best match: ${bestMatch.signature.name} (${bestMatch.confidence}% confidence)`);
        }
      }
      
      // Phase 3: Context Analysis
      console.log(`\n🔍 Phase 3: Context Analysis`);
      
      const contextAnalysis = ContextAnalysisEngine.analyzeContext({
        errorMessage: errorDetails.message,
        stackTrace: errorDetails.stackTrace,
        codeContext: errorDetails.codeContext,
        fileName: errorDetails.fileName,
        patternMatches: patternMatches.map(m => ({
          name: m.signature.name,
          confidence: m.confidence
        })),
        antiPatterns: antiPatterns.map(ap => ({
          name: ap.name,
          severity: ap.severity
        }))
      });
      
      console.log(`Complexity: ${contextAnalysis.complexity}`);
      console.log(`Estimated time: ${contextAnalysis.estimatedTime} minutes`);
      console.log(`Recommended approach: ${contextAnalysis.recommendedApproach}`);
      
      // Phase 4: Template Matching
      console.log(`\n🎯 Phase 4: Template Matching`);
      
      let appliedTemplate: PatternTemplate | undefined;
      const errorType = this.inferErrorType(errorDetails.message, patternMatches);
      
      try {
        appliedTemplate = BugXCoreSystem.getTemplate(errorType);
        console.log(`Applied template: ${appliedTemplate.name}`);
        
        // Update template usage statistics
        BugXCoreSystem.recordTemplateUsage(errorType, true);
      } catch (error) {
        console.log(`No specific template found for ${errorType}, using generic approach`);
      }
      
      // Phase 5: AI-Assisted Implementation (if enabled)
      let implementationSteps: string[] = [];
      let preventionMeasures: string[] = [];
      
      if (workflowConfig.aiAssisted) {
        console.log(`\n🤖 Phase 5: AI-Assisted Implementation`);
        
        // Generate AI prompts based on analysis
        const prompts = AIWorkflowPrompts.generateWorkflowPrompts({
          errorType,
          contextAnalysis,
          patternMatches,
          appliedTemplate,
          teamKnowledge: this.getRelevantTeamKnowledge(errorType)
        });
        
        console.log(`Generated ${Object.keys(prompts).length} AI prompts`);
        
        // Use implementation engine
        const implementation = ImplementationEngine.generateImplementation({
          errorAnalysis: contextAnalysis,
          selectedTemplate: appliedTemplate,
          codeContext: errorDetails.codeContext,
          patternMatches,
          preventionRequired: workflowConfig.preventionRequired
        });
        
        implementationSteps = implementation.steps;
        preventionMeasures = implementation.preventionMeasures;
        
        console.log(`Generated ${implementationSteps.length} implementation steps`);
        console.log(`Applied ${preventionMeasures.length} prevention measures`);
      }
      
      // Phase 6: Quality Validation
      console.log(`\n✅ Phase 6: Quality Validation`);
      
      const qualityScore = this.calculateQualityScore({
        appliedTemplate: !!appliedTemplate,
        preventionMeasures: preventionMeasures.length,
        patternMatchConfidence: patternMatches[0]?.confidence || 0,
        contextComplexity: contextAnalysis.complexity
      });
      
      console.log(`Quality Score: ${qualityScore}/100`);
      
      // Phase 7: Documentation Generation
      let documentationCreated = false;
      
      if (workflowConfig.documentationRequired) {
        console.log(`\n📝 Phase 7: Documentation Generation`);
        
        const documentation = this.generateDocumentation({
          errorDetails,
          contextAnalysis,
          appliedTemplate,
          implementationSteps,
          preventionMeasures,
          patternMatches,
          antiPatterns
        });
        
        // Add to metrics system
        if (this.config.metricsEnabled) {
          BugXMetricsCollector.addDocumentation(documentation);
        }
        
        // Share with team if configured
        if (workflowConfig.teamIntegration.sharePatterns) {
          this.shareWithTeam({
            title: `${errorType} Resolution`,
            errorSignature: this.generateErrorSignature(errorDetails),
            solution: implementationSteps.join('; '),
            prevention: preventionMeasures.join('; '),
            sharedBy: developer
          });
        }
        
        documentationCreated = true;
        console.log(`Documentation created and shared`);
      }
      
      // Phase 8: Team Notification
      if (workflowConfig.teamIntegration.notifyOnCritical) {
        const hasCriticalAntiPatterns = antiPatterns.some(ap => ap.severity === 'critical');
        if (hasCriticalAntiPatterns) {
          console.log(`\n🚨 Critical anti-patterns detected - notifying team`);
          this.notifyTeamOfCriticalIssues(developer, antiPatterns, sessionId);
        }
      }
      
      // Phase 9: Complete Session
      const endTime = Date.now();
      const timeSpent = (endTime - startTime) / (1000 * 60); // Convert to minutes
      
      const approach = timeSpent <= workflowConfig.timeTarget ? 'bugx_v14' : 'full_bugx';
      
      if (this.config.metricsEnabled) {
        BugXMetricsCollector.completeSession(sessionId, {
          patternUsed: appliedTemplate?.name,
          approach,
          success: true,
          preventionApplied: preventionMeasures.length > 0,
          documentationCreated,
          satisfactionRating: qualityScore / 10, // Convert to 1-10 scale
          notes: `Pattern matches: ${patternMatches.length}, Anti-patterns: ${antiPatterns.length}`
        });
      }
      
      // Phase 10: Generate Recommendations
      const recommendations = this.generateRecommendations({
        timeSpent,
        targetTime: workflowConfig.timeTarget,
        qualityScore,
        patternMatches,
        antiPatterns,
        appliedTemplate
      });
      
      const nextSteps = this.generateNextSteps({
        preventionMeasures,
        antiPatterns,
        contextAnalysis
      });
      
      console.log(`\n🎉 BugX v1.4 Workflow Completed Successfully`);
      console.log(`Time Spent: ${Math.round(timeSpent * 100) / 100} minutes`);
      console.log(`Quality Score: ${qualityScore}/100`);
      console.log(`Approach: ${approach}`);
      
      return {
        sessionId,
        success: true,
        timeSpent: Math.round(timeSpent * 100) / 100,
        approach,
        patternMatches,
        antiPatterns,
        appliedTemplate,
        preventionMeasures,
        documentationCreated,
        metrics: {
          efficiency: this.calculateEfficiency(timeSpent, workflowConfig.timeTarget),
          qualityScore,
          teamImpact: this.calculateTeamImpact(documentationCreated, preventionMeasures.length)
        },
        recommendations,
        nextSteps
      };
      
    } catch (error) {
      console.error(`❌ BugX v1.4 Workflow Failed:`, error);
      
      if (this.config.metricsEnabled) {
        BugXMetricsCollector.completeSession(sessionId, {
          approach: 'bugx_v14',
          success: false,
          preventionApplied: false,
          documentationCreated: false,
          notes: `Workflow error: ${error}`
        });
      }
      
      const timeSpent = (Date.now() - startTime) / (1000 * 60);
      
      return {
        sessionId,
        success: false,
        timeSpent: Math.round(timeSpent * 100) / 100,
        approach: 'bugx_v14',
        patternMatches: [],
        antiPatterns: [],
        preventionMeasures: [],
        documentationCreated: false,
        metrics: {
          efficiency: 0,
          qualityScore: 0,
          teamImpact: 0
        },
        recommendations: ['Retry with manual debugging approach', 'Check system configuration'],
        nextSteps: ['Review error logs', 'Validate input parameters']
      };
    }
  }
  
  private static inferErrorType(errorMessage: string, patternMatches: PatternMatch[]): string {
    // Use pattern matches if available
    if (patternMatches.length > 0 && patternMatches[0].confidence > 70) {
      const patternName = patternMatches[0].signature.name.toLowerCase();
      if (patternName.includes('hydration')) return 'hydration_error';
      if (patternName.includes('scope') || patternName.includes('temporal')) return 'scope_error';
      if (patternName.includes('null') || patternName.includes('undefined')) return 'null_reference';
      if (patternName.includes('api') || patternName.includes('cors')) return 'api_integration';
    }
    
    // Fallback to error message analysis
    const message = errorMessage.toLowerCase();
    if (message.includes('hydration')) return 'hydration_error';
    if (message.includes('cannot access') || message.includes('before initialization')) return 'scope_error';
    if (message.includes('null') || message.includes('undefined')) return 'null_reference';
    if (message.includes('cors') || message.includes('fetch')) return 'api_integration';
    if (message.includes('validation') || message.includes('invalid')) return 'validation_error';
    
    return 'generic_error';
  }
  
  private static calculateQualityScore(factors: {
    appliedTemplate: boolean;
    preventionMeasures: number;
    patternMatchConfidence: number;
    contextComplexity: string;
  }): number {
    let score = 50; // Base score
    
    if (factors.appliedTemplate) score += 20;
    score += Math.min(20, factors.preventionMeasures * 5);
    score += Math.min(15, factors.patternMatchConfidence * 0.15);
    
    if (factors.contextComplexity === 'simple') score += 10;
    else if (factors.contextComplexity === 'moderate') score += 5;
    
    return Math.min(100, Math.round(score));
  }
  
  private static generateDocumentation(params: {
    errorDetails: any;
    contextAnalysis: any;
    appliedTemplate?: PatternTemplate;
    implementationSteps: string[];
    preventionMeasures: string[];
    patternMatches: PatternMatch[];
    antiPatterns: AntiPattern[];
  }) {
    const { errorDetails, contextAnalysis, appliedTemplate, implementationSteps, preventionMeasures, patternMatches, antiPatterns } = params;
    
    return {
      title: `${errorDetails.component} - ${contextAnalysis.errorCategory}`,
      errorType: contextAnalysis.errorCategory,
      component: errorDetails.component,
      issue: errorDetails.message,
      rootCause: patternMatches[0]?.recommendation || 'Standard debugging analysis performed',
      solution: implementationSteps.join('\n'),
      prevention: preventionMeasures.join('\n'),
      patternTemplate: appliedTemplate?.name || 'generic-debugging-approach',
      category: this.inferDocumentationCategory(errorDetails.message),
      reusability: patternMatches.length > 0 ? 'high' : 'medium',
      timeToFix: contextAnalysis.estimatedTime,
      confidence: patternMatches[0]?.confidence || 75,
      codeExamples: {
        before: errorDetails.codeContext.substring(0, 500),
        after: 'Applied fixes based on pattern template',
        prevention: preventionMeasures.join('\n')
      },
      teamNotes: `Anti-patterns detected: ${antiPatterns.length}, Pattern matches: ${patternMatches.length}`
    };
  }
  
  private static inferDocumentationCategory(errorMessage: string): 'business_logic' | 'integration' | 'pattern' | 'infrastructure' {
    const message = errorMessage.toLowerCase();
    if (message.includes('api') || message.includes('fetch') || message.includes('cors')) return 'integration';
    if (message.includes('hydration') || message.includes('render')) return 'pattern';
    if (message.includes('env') || message.includes('config') || message.includes('build')) return 'infrastructure';
    return 'business_logic';
  }
  
  private static shareWithTeam(entry: {
    title: string;
    errorSignature: string;
    solution: string;
    prevention: string;
    sharedBy: string;
  }): void {
    const teamEntry: TeamKnowledgeEntry = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...entry,
      sharedAt: new Date(),
      usageCount: 0,
      effectiveness: 85, // Start with high effectiveness
      teamFeedback: {
        helpful: 0,
        notHelpful: 0,
        comments: []
      }
    };
    
    this.teamKnowledge.push(teamEntry);
  }
  
  private static generateErrorSignature(errorDetails: any): string {
    return `${errorDetails.message}:${errorDetails.fileName}:${errorDetails.component}`;
  }
  
  private static getRelevantTeamKnowledge(errorType: string): TeamKnowledgeEntry[] {
    return this.teamKnowledge
      .filter(entry => entry.errorSignature.includes(errorType) || entry.title.toLowerCase().includes(errorType.toLowerCase()))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3); // Top 3 most effective entries
  }
  
  private static notifyTeamOfCriticalIssues(developer: string, antiPatterns: AntiPattern[], sessionId: string): void {
    const criticalPatterns = antiPatterns.filter(ap => ap.severity === 'critical');
    
    console.log(`🚨 TEAM NOTIFICATION: Critical anti-patterns detected by ${developer}`);
    console.log(`Session: ${sessionId}`);
    
    criticalPatterns.forEach(pattern => {
      console.log(`- ${pattern.name}: ${pattern.impact}`);
      console.log(`  Solution: ${pattern.solution}`);
    });
  }
  
  private static calculateEfficiency(actualTime: number, targetTime: number): number {
    if (actualTime <= targetTime) {
      return 100;
    } else {
      return Math.max(0, Math.round((targetTime / actualTime) * 100));
    }
  }
  
  private static calculateTeamImpact(documentationCreated: boolean, preventionCount: number): number {
    let impact = 0;
    if (documentationCreated) impact += 50;
    impact += Math.min(50, preventionCount * 10);
    return Math.min(100, impact);
  }
  
  private static generateRecommendations(params: {
    timeSpent: number;
    targetTime: number;
    qualityScore: number;
    patternMatches: PatternMatch[];
    antiPatterns: AntiPattern[];
    appliedTemplate?: PatternTemplate;
  }): string[] {
    const recommendations: string[] = [];
    
    if (params.timeSpent > params.targetTime) {
      recommendations.push(`Consider optimizing pattern recognition - exceeded target time by ${Math.round((params.timeSpent - params.targetTime) * 100) / 100} minutes`);
    }
    
    if (params.qualityScore < 80) {
      recommendations.push('Improve prevention measures and documentation quality');
    }
    
    if (params.patternMatches.length === 0) {
      recommendations.push('Add custom pattern for this error type to improve future recognition');
    }
    
    if (params.antiPatterns.length > 0) {
      const criticalCount = params.antiPatterns.filter(ap => ap.severity === 'critical').length;
      if (criticalCount > 0) {
        recommendations.push(`Address ${criticalCount} critical anti-patterns immediately`);
      }
    }
    
    if (!params.appliedTemplate) {
      recommendations.push('Create specific template for this error pattern to improve efficiency');
    }
    
    return recommendations.length > 0 ? recommendations : ['Excellent work! Continue with current practices.'];
  }
  
  private static generateNextSteps(params: {
    preventionMeasures: string[];
    antiPatterns: AntiPattern[];
    contextAnalysis: any;
  }): string[] {
    const nextSteps: string[] = [];
    
    if (params.preventionMeasures.length > 0) {
      nextSteps.push('Implement all prevention measures to avoid recurrence');
    }
    
    if (params.antiPatterns.length > 0) {
      nextSteps.push('Schedule code review to address detected anti-patterns');
    }
    
    if (params.contextAnalysis.complexity === 'complex') {
      nextSteps.push('Consider refactoring for better maintainability');
    }
    
    nextSteps.push('Test thoroughly to ensure fix works across all scenarios');
    nextSteps.push('Monitor for similar issues in related components');
    
    return nextSteps;
  }
  
  static getTeamKnowledge(): TeamKnowledgeEntry[] {
    return [...this.teamKnowledge].sort((a, b) => b.effectiveness - a.effectiveness);
  }
  
  static recordTeamKnowledgeFeedback(entryId: string, helpful: boolean, comment?: string): void {
    const entry = this.teamKnowledge.find(e => e.id === entryId);
    if (!entry) return;
    
    if (helpful) {
      entry.teamFeedback.helpful++;
      entry.effectiveness = Math.min(100, entry.effectiveness + 2);
    } else {
      entry.teamFeedback.notHelpful++;
      entry.effectiveness = Math.max(0, entry.effectiveness - 5);
    }
    
    if (comment) {
      entry.teamFeedback.comments.push(comment);
    }
  }
  
  static generateTeamReport(): string {
    const metrics = BugXMetricsCollector.calculateMetrics();
    const topPatterns = this.teamKnowledge
      .slice(0, 5)
      .map(entry => `- ${entry.title} (${entry.effectiveness}% effective, used ${entry.usageCount} times)`)
      .join('\n');
    
    return `
# BugX v1.4 Team Integration Report

## System Performance
${BugXMetricsCollector.generateReport()}

## Team Knowledge Base
- **Total Shared Patterns**: ${this.teamKnowledge.length}
- **Average Effectiveness**: ${Math.round(this.teamKnowledge.reduce((sum, e) => sum + e.effectiveness, 0) / this.teamKnowledge.length)}%

### Top Performing Patterns
${topPatterns}

## Integration Health
- **AI-Assisted Sessions**: ${metrics.timeEfficiency.templateUsageRate}%
- **Team Collaboration Score**: ${metrics.teamAdoption.satisfactionScore}/10
- **Knowledge Sharing Growth**: ${metrics.libraryGrowth.newPatternsPerMonth} new patterns/month
    `.trim();
  }
}