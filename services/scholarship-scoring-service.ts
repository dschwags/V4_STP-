/**
 * Scholarship Scoring Service
 * Integration layer between the scoring engine and UI components
 */

import { ScholarshipScoringEngineImpl } from '@/lib/engines/scholarship-scoring-engine';
import { 
  StudentProfile, 
  ScholarshipScore, 
  Scholarship, 
  ScoringWeights,
  Demographics,
  FinancialProfile,
  Activity,
  Essay
} from '@/types/spider-web';

// Service class for scholarship scoring
export class ScholarshipScoringService {
  private scoringEngine: ScholarshipScoringEngineImpl;

  constructor(customWeights?: Partial<ScoringWeights>) {
    this.scoringEngine = new ScholarshipScoringEngineImpl(customWeights);
  }

  // Calculate score for a student profile
  async calculateScore(profile: StudentProfile): Promise<ScholarshipScore> {
    // In a real application, this would validate the profile and handle async operations
    try {
      return this.scoringEngine.calculateScore(profile);
    } catch (error) {
      console.error('Error calculating scholarship score:', error);
      throw new Error('Failed to calculate scholarship score');
    }
  }

  // Calculate match score for a specific scholarship
  async calculateScholarshipMatch(profile: StudentProfile, scholarship: Scholarship): Promise<number> {
    try {
      return this.scoringEngine.calculateScholarshipMatch(profile, scholarship);
    } catch (error) {
      console.error('Error calculating scholarship match:', error);
      throw new Error('Failed to calculate scholarship match');
    }
  }

  // Batch calculate scores for multiple scholarships
  async batchCalculateMatches(profile: StudentProfile, scholarships: Scholarship[]): Promise<Array<{
    scholarship: Scholarship;
    matchScore: number;
    baseScore: ScholarshipScore;
  }>> {
    const results = [];
    const baseScore = await this.calculateScore(profile);

    for (const scholarship of scholarships) {
      try {
        const matchScore = await this.calculateScholarshipMatch(profile, scholarship);
        results.push({
          scholarship,
          matchScore,
          baseScore,
        });
      } catch (error) {
        console.error(`Error calculating match for scholarship ${scholarship.id}:`, error);
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Update scoring weights
  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.scoringEngine.updateWeights(newWeights);
  }

  // Get current weights
  getWeights(): ScoringWeights {
    return this.scoringEngine.getWeights();
  }

  // Validate weights
  validateWeights(): boolean {
    return this.scoringEngine.validateWeights();
  }
}

// Factory function to create service instance
export function createScoringService(customWeights?: Partial<ScoringWeights>): ScholarshipScoringService {
  return new ScholarshipScoringService(customWeights);
}

// Test data generators for demonstration
export function generateTestStudentProfiles(): StudentProfile[] {
  return [
    // High-achieving STEM student
    {
      id: 'student-001',
      gpa: 3.95,
      educationLevel: 'undergraduate',
      major: 'Computer Science',
      demographics: {
        ethnicity: 'Hispanic',
        gender: 'Female',
        firstGeneration: true,
        disability: false,
        veteran: false,
      },
      financialNeed: {
        familyIncome: 35000,
        dependents: 3,
        assets: 2000,
        expectedFamilyContribution: 500,
        financialNeed: 45000,
      },
      activities: [
        {
          id: 'act-001',
          type: 'leadership',
          title: 'Computer Science Club President',
          description: 'Led a team of 30 students in organizing tech events',
          duration: '2 years',
          hoursPerWeek: 8,
          achievements: ['Increased membership by 150%', 'Organized 5 major tech conferences'],
        },
        {
          id: 'act-002',
          type: 'volunteer',
          title: 'Code for Good Volunteer',
          description: 'Teaching programming to underserved youth',
          duration: '3 years',
          hoursPerWeek: 6,
          achievements: ['Taught 50+ students', 'Developed curriculum'],
        },
        {
          id: 'act-003',
          type: 'work',
          title: 'Software Development Intern',
          description: 'Backend development at local startup',
          duration: '1 year',
          hoursPerWeek: 20,
          achievements: ['Developed REST APIs', 'Improved system performance by 30%'],
        },
      ],
      essays: [
        {
          id: 'essay-001',
          prompt: 'Describe your career goals and how this scholarship will help',
          content: 'My goal is to become a software engineer who creates technology that addresses social inequity. Growing up in a low-income household, I witnessed firsthand how lack of access to technology can limit opportunities. This scholarship would allow me to focus on my studies rather than working multiple jobs to support my family. I plan to use my education to develop applications that provide educational resources to underserved communities, similar to the work I\'ve been doing as a volunteer. With this financial support, I can dedicate more time to research and internships that will prepare me to make a meaningful impact in the tech industry while giving back to my community.',
          wordCount: 567,
          qualityScore: 88,
        },
      ],
    },

    // Pre-med student with moderate scores
    {
      id: 'student-002',
      gpa: 3.7,
      educationLevel: 'undergraduate',
      major: 'Biology',
      demographics: {
        ethnicity: 'Asian American',
        gender: 'Male',
        firstGeneration: false,
        disability: false,
        veteran: false,
      },
      financialNeed: {
        familyIncome: 75000,
        dependents: 2,
        assets: 25000,
        expectedFamilyContribution: 15000,
        financialNeed: 30000,
      },
      activities: [
        {
          id: 'act-004',
          type: 'volunteer',
          title: 'Hospital Volunteer',
          description: 'Assisting patients and medical staff',
          duration: '2 years',
          hoursPerWeek: 4,
          achievements: ['200+ volunteer hours', 'Patient care recognition'],
        },
        {
          id: 'act-005',
          type: 'academic',
          title: 'Research Assistant',
          description: 'Cancer research lab assistant',
          duration: '1 year',
          hoursPerWeek: 10,
          achievements: ['Co-authored research paper', 'Presented at conference'],
        },
      ],
      essays: [
        {
          id: 'essay-002',
          prompt: 'Why do you want to pursue medicine?',
          content: 'Medicine has always been my passion because it combines scientific knowledge with direct service to others. Through my volunteer work at the hospital, I have seen how physicians can make a profound difference in people\'s lives during their most vulnerable moments. My research experience has taught me the importance of evidence-based practice and continuous learning. I am particularly interested in oncology research and hope to contribute to developing better treatments for cancer patients. This scholarship would help me focus on my pre-medical studies and continue my research work without the financial stress that currently limits my opportunities.',
          wordCount: 445,
          qualityScore: 75,
        },
      ],
    },

    // Business student with financial need
    {
      id: 'student-003',
      gpa: 3.2,
      educationLevel: 'undergraduate',
      major: 'Business Administration',
      demographics: {
        ethnicity: 'African American',
        gender: 'Female',
        firstGeneration: true,
        disability: false,
        veteran: true,
      },
      financialNeed: {
        familyIncome: 28000,
        dependents: 2,
        assets: 500,
        expectedFamilyContribution: 0,
        financialNeed: 50000,
      },
      activities: [
        {
          id: 'act-006',
          type: 'work',
          title: 'Retail Manager',
          description: 'Managing a team of 15 employees',
          duration: '3 years',
          hoursPerWeek: 30,
          achievements: ['Increased sales by 20%', 'Employee of the month (3 times)'],
        },
        {
          id: 'act-007',
          type: 'leadership',
          title: 'Student Veterans Association VP',
          description: 'Supporting fellow student veterans',
          duration: '1 year',
          hoursPerWeek: 5,
          achievements: ['Organized support programs', 'Increased membership by 50%'],
        },
      ],
      essays: [
        {
          id: 'essay-003',
          prompt: 'How has your military service influenced your educational goals?',
          content: 'My military service taught me discipline, leadership, and the value of teamwork. These skills have been invaluable as I pursue my business degree while working full-time to support my family. The military showed me how effective leadership can inspire people to achieve goals they never thought possible. I want to use my business education to create opportunities for other veterans and underrepresented communities. My goal is to start a consulting firm that helps small businesses in underserved areas grow and thrive. This scholarship would allow me to reduce my work hours and focus more on my studies, giving me the foundation I need to achieve this dream.',
          wordCount: 512,
          qualityScore: 82,
        },
      ],
    },
  ];
}

export function generateTestScholarships(): Scholarship[] {
  return [
    {
      id: 'scholarship-001',
      title: 'STEM Excellence Scholarship',
      provider: 'Technology Education Foundation',
      amount: 25000,
      deadline: new Date('2024-03-15'),
      requirements: [
        { type: 'gpa', value: 3.5, isRequired: true },
        { type: 'major', value: 'STEM', isRequired: true },
        { type: 'essay', value: 'career goals', isRequired: true },
      ],
      competitiveness: 'high',
      renewability: true,
    },
    {
      id: 'scholarship-002',
      title: 'First Generation College Student Award',
      provider: 'Educational Opportunity Fund',
      amount: 15000,
      deadline: new Date('2024-04-01'),
      requirements: [
        { type: 'demographic', value: 'first generation', isRequired: true },
        { type: 'financial', value: 50000, isRequired: true },
        { type: 'gpa', value: 3.0, isRequired: true },
      ],
      competitiveness: 'medium',
      renewability: true,
    },
    {
      id: 'scholarship-003',
      title: 'Veterans Education Support Grant',
      provider: 'Veterans Educational Foundation',
      amount: 20000,
      deadline: new Date('2024-05-15'),
      requirements: [
        { type: 'demographic', value: 'veteran', isRequired: true },
        { type: 'gpa', value: 2.5, isRequired: true },
        { type: 'essay', value: 'military service impact', isRequired: true },
      ],
      competitiveness: 'low',
      renewability: false,
    },
    {
      id: 'scholarship-004',
      title: 'Women in Technology Scholarship',
      provider: 'Women Tech Alliance',
      amount: 18000,
      deadline: new Date('2024-02-28'),
      requirements: [
        { type: 'demographic', value: 'female', isRequired: true },
        { type: 'major', value: 'technology', isRequired: true },
        { type: 'gpa', value: 3.2, isRequired: true },
      ],
      competitiveness: 'medium',
      renewability: true,
    },
    {
      id: 'scholarship-005',
      title: 'Healthcare Heroes Scholarship',
      provider: 'Medical Education Fund',
      amount: 30000,
      deadline: new Date('2024-06-30'),
      requirements: [
        { type: 'major', value: 'healthcare', isRequired: true },
        { type: 'gpa', value: 3.8, isRequired: true },
        { type: 'recommendation', value: 'medical professional', isRequired: true },
      ],
      competitiveness: 'high',
      renewability: true,
    },
  ];
}

// Behavioral parity test functions
export async function runScoringEngineParityTests(): Promise<{
  passed: boolean;
  results: Array<{
    test: string;
    passed: boolean;
    details: string;
  }>;
}> {
  const results = [];
  const service = createScoringService();
  const testProfiles = generateTestStudentProfiles();
  
  // Test 1: Weight validation
  try {
    const isValid = service.validateWeights();
    results.push({
      test: 'Weight Validation',
      passed: isValid,
      details: isValid ? 'All weights sum to 1.0' : 'Weights do not sum to 1.0',
    });
  } catch (error) {
    results.push({
      test: 'Weight Validation',
      passed: false,
      details: `Error: ${error}`,
    });
  }

  // Test 2: Score consistency
  try {
    const profile = testProfiles[0];
    const score1 = await service.calculateScore(profile);
    const score2 = await service.calculateScore(profile);
    
    const consistent = Math.abs(score1.totalScore - score2.totalScore) < 0.001;
    results.push({
      test: 'Score Consistency',
      passed: consistent,
      details: consistent ? 'Scores are consistent across calls' : `Scores vary: ${score1.totalScore} vs ${score2.totalScore}`,
    });
  } catch (error) {
    results.push({
      test: 'Score Consistency',
      passed: false,
      details: `Error: ${error}`,
    });
  }

  // Test 3: Score range validation
  try {
    const allScoresValid = true;
    for (const profile of testProfiles) {
      const score = await service.calculateScore(profile);
      if (score.totalScore < 0 || score.totalScore > 100 || score.percentile < 0 || score.percentile > 100) {
        results.push({
          test: 'Score Range Validation',
          passed: false,
          details: `Score out of range: ${score.totalScore} or percentile: ${score.percentile}`,
        });
        break;
      }
    }
    if (allScoresValid) {
      results.push({
        test: 'Score Range Validation',
        passed: true,
        details: 'All scores within valid range (0-100)',
      });
    }
  } catch (error) {
    results.push({
      test: 'Score Range Validation',
      passed: false,
      details: `Error: ${error}`,
    });
  }

  // Test 4: GPA impact verification
  try {
    const baseProfile = testProfiles[0];
    const highGpaProfile = { ...baseProfile, gpa: 4.0 };
    const lowGpaProfile = { ...baseProfile, gpa: 2.5 };
    
    const highScore = await service.calculateScore(highGpaProfile);
    const lowScore = await service.calculateScore(lowGpaProfile);
    
    const gpaImpactCorrect = highScore.totalScore > lowScore.totalScore;
    results.push({
      test: 'GPA Impact Verification',
      passed: gpaImpactCorrect,
      details: gpaImpactCorrect 
        ? `Higher GPA yields higher score: ${highScore.totalScore} > ${lowScore.totalScore}`
        : `GPA impact incorrect: ${highScore.totalScore} vs ${lowScore.totalScore}`,
    });
  } catch (error) {
    results.push({
      test: 'GPA Impact Verification',
      passed: false,
      details: `Error: ${error}`,
    });
  }

  const allPassed = results.every(result => result.passed);
  
  return {
    passed: allPassed,
    results,
  };
}