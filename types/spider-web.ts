/**
 * Core types for Scholarship Tracker Pro v2 Spider Web Architecture
 * Defines the structure for the central hub and four primary spokes
 */

// Core Spider Web Architecture Types
export interface SpiderWebHub {
  id: string;
  title: string;
  description: string;
  spokes: SpiderWebSpoke[];
  centralMetrics: HubMetrics;
}

export interface SpiderWebSpoke {
  id: SpokeId;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  features: SpokeFeature[];
  isEnabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

export type SpokeId = 'scholarship-management' | 'financial-tracking' | 'analytics-insights' | 'profile-settings';

export interface SpokeFeature {
  id: string;
  title: string;
  description: string;
  path: string;
  isImplemented: boolean;
}

export interface HubMetrics {
  totalScholarships: number;
  activeApplications: number;
  totalAwardAmount: number;
  completionRate: number;
  lastUpdated: Date;
}

// Business Logic Core Types
export interface ScholarshipScoringEngine {
  calculateScore: (profile: StudentProfile) => ScholarshipScore;
  validateWeights: () => boolean;
}

export interface ScoringWeights {
  gpa: number; // 25%
  education: number; // 20% 
  demographics: number; // 15%
  financial: number; // 15%
  activities: number; // 15%
  essays: number; // 10%
}

export interface StudentProfile {
  id: string;
  gpa: number;
  educationLevel: string;
  major: string;
  demographics: Demographics;
  financialNeed: FinancialProfile;
  activities: Activity[];
  essays: Essay[];
}

export interface Demographics {
  ethnicity?: string;
  gender?: string;
  firstGeneration: boolean;
  disability: boolean;
  veteran: boolean;
}

export interface FinancialProfile {
  familyIncome: number;
  dependents: number;
  assets: number;
  expectedFamilyContribution: number;
  financialNeed: number;
}

export interface Activity {
  id: string;
  type: 'academic' | 'volunteer' | 'work' | 'leadership' | 'sports' | 'arts';
  title: string;
  description: string;
  duration: string;
  hoursPerWeek: number;
  achievements: string[];
}

export interface Essay {
  id: string;
  prompt: string;
  content: string;
  wordCount: number;
  qualityScore?: number;
}

export interface ScholarshipScore {
  totalScore: number;
  breakdown: {
    gpa: number;
    education: number;
    demographics: number;
    financial: number;
    activities: number;
    essays: number;
  };
  percentile: number;
  recommendations: string[];
}

// Financial Analysis Engine Types
export interface FinancialAnalysisEngine {
  calculateBudgetImpact: (scholarship: Scholarship, profile: FinancialProfile) => BudgetImpact;
  calculateROI: (scholarship: Scholarship, effort: ApplicationEffort) => ROIAnalysis;
  optimizePortfolio: (scholarships: Scholarship[], profile: StudentProfile) => OptimizedPortfolio;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: Date;
  requirements: ScholarshipRequirement[];
  competitiveness: 'low' | 'medium' | 'high';
  renewability: boolean;
  matchScore?: number;
}

export interface ScholarshipRequirement {
  type: 'gpa' | 'major' | 'demographic' | 'essay' | 'recommendation' | 'financial';
  value: any;
  isRequired: boolean;
}

export interface BudgetImpact {
  netBenefit: number;
  debtReduction: number;
  opportunityCost: number;
  paybackPeriod: number;
  recommendations: string[];
}

export interface ApplicationEffort {
  estimatedHours: number;
  complexity: 'low' | 'medium' | 'high';
  requiredDocuments: string[];
  deadlineStress: number;
}

export interface ROIAnalysis {
  roi: number;
  probability: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeToComplete: number;
}

export interface OptimizedPortfolio {
  selectedScholarships: Scholarship[];
  totalPotentialAward: number;
  totalEstimatedEffort: number;
  portfolioROI: number;
  riskDistribution: {
    safe: number;
    moderate: number;
    reach: number;
  };
}

// Pattern Recognition System Types
export interface PatternRecognitionSystem {
  antiPatterns: AntiPattern[];
  successPatterns: SuccessPattern[];
  analyzeProfile: (profile: StudentProfile) => PatternAnalysis;
}

export interface AntiPattern {
  id: string;
  name: string;
  description: string;
  category: 'application' | 'profile' | 'strategy' | 'timing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detector: (profile: StudentProfile, applications: ScholarshipApplication[]) => boolean;
  recommendation: string;
}

export interface SuccessPattern {
  id: string;
  name: string;
  description: string;
  category: 'profile' | 'strategy' | 'timing' | 'portfolio';
  confidence: number;
  requirements: string[];
  expectedOutcome: string;
}

export interface PatternAnalysis {
  detectedAntiPatterns: DetectedAntiPattern[];
  applicableSuccessPatterns: ApplicableSuccessPattern[];
  overallHealthScore: number;
  recommendations: PatternRecommendation[];
}

export interface DetectedAntiPattern {
  pattern: AntiPattern;
  confidence: number;
  affectedAreas: string[];
  urgency: number;
}

export interface ApplicableSuccessPattern {
  pattern: SuccessPattern;
  matchPercentage: number;
  missingRequirements: string[];
  potentialImpact: number;
}

export interface PatternRecommendation {
  type: 'fix' | 'optimize' | 'enhance';
  priority: number;
  description: string;
  actionItems: string[];
  estimatedImpact: number;
}

export interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  status: 'draft' | 'submitted' | 'under-review' | 'accepted' | 'rejected';
  submittedDate?: Date;
  resultDate?: Date;
  documents: ApplicationDocument[];
  effort: ApplicationEffort;
}

export interface ApplicationDocument {
  type: string;
  url: string;
  uploadDate: Date;
  isRequired: boolean;
}

// BugX v1.3 Validation Framework Types
export interface BugXValidation {
  phase: 'reality-check' | 'implementation' | 'integration' | 'performance';
  rules: ValidationRule[];
  performanceTargets: PerformanceTargets;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'type-safety' | 'performance' | 'circular-dependency' | 'business-logic';
  validator: () => Promise<ValidationResult>;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
  performance?: {
    executionTime: number;
    memoryUsage: number;
  };
}

export interface PerformanceTargets {
  validationTime: number; // sub-5ms
  pageLoadTime: number; // sub-3s
  buildTime: number;
  bundleSize: number;
}

// Design System Types
export interface SpiderWebDesignSystem {
  colors: SpiderWebColors;
  typography: SpiderWebTypography;
  spacing: SpiderWebSpacing;
  breakpoints: SpiderWebBreakpoints;
  animations: SpiderWebAnimations;
}

export interface SpiderWebColors {
  webPrimary: string; // #2563eb
  webSecondary: string; // #7c3aed
  webAccent: string; // #059669
  webNeutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  webGradients: {
    hub: string;
    spoke: string;
    connection: string;
  };
}

export interface SpiderWebTypography {
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
}

export interface SpiderWebSpacing {
  hub: {
    padding: string;
    margin: string;
    gap: string;
  };
  spoke: {
    padding: string;
    margin: string;
    gap: string;
  };
  connection: {
    width: string;
    spacing: string;
  };
}

export interface SpiderWebBreakpoints {
  mobile: string; // 640px
  tablet: string; // 768px
  desktop: string; // 1024px
  wide: string; // 1280px
}

export interface SpiderWebAnimations {
  hubPulse: string;
  spokeHover: string;
  connectionFlow: string;
  dataVisualization: string;
}