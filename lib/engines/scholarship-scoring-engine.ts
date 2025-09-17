/**
 * Scholarship Scoring Engine - Core Business Logic Algorithm
 * Implements the weighted intelligence system for scholarship matching
 * 
 * Weights Distribution:
 * - GPA: 25%
 * - Education: 20%
 * - Demographics: 15%
 * - Financial: 15%
 * - Activities: 15%
 * - Essays: 10%
 */

import { 
  ScholarshipScoringEngine, 
  StudentProfile, 
  ScholarshipScore, 
  ScoringWeights, 
  Scholarship,
  ScholarshipRequirement 
} from '@/types/spider-web';
import { DEFAULT_SCORING_WEIGHTS } from '@/config/spider-web-config';

export class ScholarshipScoringEngineImpl implements ScholarshipScoringEngine {
  private weights: ScoringWeights;

  constructor(customWeights?: Partial<ScoringWeights>) {
    this.weights = { ...DEFAULT_SCORING_WEIGHTS, ...customWeights };
    this.validateWeights();
  }

  /**
   * Calculate the scholarship match score for a student profile
   */
  calculateScore(profile: StudentProfile): ScholarshipScore {
    const gpaScore = this.calculateGpaScore(profile.gpa);
    const educationScore = this.calculateEducationScore(profile);
    const demographicsScore = this.calculateDemographicsScore(profile.demographics);
    const financialScore = this.calculateFinancialScore(profile.financialNeed);
    const activitiesScore = this.calculateActivitiesScore(profile.activities);
    const essaysScore = this.calculateEssaysScore(profile.essays);

    const breakdown = {
      gpa: gpaScore * this.weights.gpa,
      education: educationScore * this.weights.education,
      demographics: demographicsScore * this.weights.demographics,
      financial: financialScore * this.weights.financial,
      activities: activitiesScore * this.weights.activities,
      essays: essaysScore * this.weights.essays,
    };

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const percentile = this.calculatePercentile(totalScore);
    const recommendations = this.generateRecommendations(breakdown, profile);

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      breakdown,
      percentile,
      recommendations,
    };
  }

  /**
   * Calculate GPA score (25% weight)
   * Normalized to 0-100 scale
   */
  private calculateGpaScore(gpa: number): number {
    if (gpa >= 4.0) return 100;
    if (gpa >= 3.8) return 95;
    if (gpa >= 3.5) return 85;
    if (gpa >= 3.2) return 75;
    if (gpa >= 3.0) return 65;
    if (gpa >= 2.8) return 55;
    if (gpa >= 2.5) return 45;
    if (gpa >= 2.0) return 35;
    return Math.max(0, (gpa / 2.0) * 35);
  }

  /**
   * Calculate education score (20% weight)
   * Based on education level, institution prestige, and major relevance
   */
  private calculateEducationScore(profile: StudentProfile): number {
    let score = 0;

    // Education Level Score (0-40 points)
    switch (profile.educationLevel.toLowerCase()) {
      case 'doctoral':
      case 'phd':
        score += 40;
        break;
      case 'masters':
      case 'graduate':
        score += 35;
        break;
      case 'bachelor':
      case 'undergraduate':
        score += 30;
        break;
      case 'associate':
        score += 25;
        break;
      case 'high school':
        score += 20;
        break;
      default:
        score += 15;
    }

    // Major Relevance Score (0-35 points)
    const highDemandMajors = [
      'computer science', 'engineering', 'medicine', 'nursing', 
      'mathematics', 'physics', 'chemistry', 'biology'
    ];
    const moderateDemandMajors = [
      'business', 'economics', 'accounting', 'finance', 
      'psychology', 'education', 'communications'
    ];

    const majorLower = profile.major.toLowerCase();
    if (highDemandMajors.some(major => majorLower.includes(major))) {
      score += 35;
    } else if (moderateDemandMajors.some(major => majorLower.includes(major))) {
      score += 25;
    } else {
      score += 15;
    }

    // Academic Standing Bonus (0-25 points)
    if (profile.gpa >= 3.8) score += 25;
    else if (profile.gpa >= 3.5) score += 20;
    else if (profile.gpa >= 3.2) score += 15;
    else if (profile.gpa >= 3.0) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate demographics score (15% weight)
   * Based on underrepresented status and diversity factors
   */
  private calculateDemographicsScore(demographics: any): number {
    let score = 50; // Base score

    // First generation college student
    if (demographics.firstGeneration) {
      score += 20;
    }

    // Disability status
    if (demographics.disability) {
      score += 15;
    }

    // Veteran status
    if (demographics.veteran) {
      score += 20;
    }

    // Underrepresented ethnicity bonus
    const underrepresentedEthnicities = [
      'african american', 'black', 'hispanic', 'latino', 'native american', 
      'pacific islander', 'alaska native'
    ];
    if (demographics.ethnicity && 
        underrepresentedEthnicities.some(eth => 
          demographics.ethnicity.toLowerCase().includes(eth))) {
      score += 15;
    }

    // Gender in STEM bonus (for underrepresented genders in STEM fields)
    if (demographics.gender && 
        (demographics.gender.toLowerCase().includes('female') || 
         demographics.gender.toLowerCase().includes('woman'))) {
      score += 10; // General bonus, would be higher for STEM majors
    }

    return Math.min(100, score);
  }

  /**
   * Calculate financial score (15% weight)
   * Based on financial need and family circumstances
   */
  private calculateFinancialScore(financialNeed: any): number {
    let score = 0;

    // Financial need score based on EFC and family income
    const efcRatio = financialNeed.expectedFamilyContribution / Math.max(1, financialNeed.familyIncome);
    
    if (efcRatio <= 0.1) score += 40; // Very high need
    else if (efcRatio <= 0.2) score += 35; // High need
    else if (efcRatio <= 0.3) score += 30; // Moderate-high need
    else if (efcRatio <= 0.4) score += 25; // Moderate need
    else if (efcRatio <= 0.5) score += 20; // Some need
    else score += 10; // Limited need

    // Family income brackets
    if (financialNeed.familyIncome <= 30000) score += 35;
    else if (financialNeed.familyIncome <= 50000) score += 30;
    else if (financialNeed.familyIncome <= 75000) score += 25;
    else if (financialNeed.familyIncome <= 100000) score += 20;
    else if (financialNeed.familyIncome <= 150000) score += 15;
    else score += 5;

    // Dependents factor
    score += Math.min(15, financialNeed.dependents * 3);

    // Assets consideration (negative factor for high assets)
    const assetsRatio = financialNeed.assets / Math.max(1, financialNeed.familyIncome);
    if (assetsRatio > 2.0) score -= 10;
    else if (assetsRatio > 1.0) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate activities score (15% weight)
   * Based on leadership, volunteer work, and achievements
   */
  private calculateActivitiesScore(activities: any[]): number {
    if (!activities || activities.length === 0) return 20;

    let score = 0;
    let leadershipCount = 0;
    let volunteerHours = 0;
    let workExperience = 0;
    let academicActivities = 0;

    activities.forEach(activity => {
      const hoursPerWeek = activity.hoursPerWeek || 0;
      
      switch (activity.type) {
        case 'leadership':
          leadershipCount++;
          score += Math.min(15, hoursPerWeek * 2);
          break;
        case 'volunteer':
          volunteerHours += hoursPerWeek;
          score += Math.min(10, hoursPerWeek * 1.5);
          break;
        case 'work':
          workExperience += hoursPerWeek;
          score += Math.min(12, hoursPerWeek * 1.2);
          break;
        case 'academic':
          academicActivities++;
          score += Math.min(8, hoursPerWeek * 1);
          break;
        case 'sports':
          score += Math.min(8, hoursPerWeek * 0.8);
          break;
        case 'arts':
          score += Math.min(6, hoursPerWeek * 0.8);
          break;
      }

      // Achievement bonus
      if (activity.achievements && activity.achievements.length > 0) {
        score += activity.achievements.length * 2;
      }
    });

    // Diversity bonus for multiple activity types
    const activityTypes = new Set(activities.map(a => a.type));
    if (activityTypes.size >= 4) score += 15;
    else if (activityTypes.size >= 3) score += 10;
    else if (activityTypes.size >= 2) score += 5;

    // Leadership bonus
    if (leadershipCount >= 2) score += 20;
    else if (leadershipCount >= 1) score += 10;

    // Long-term commitment bonus
    const longTermActivities = activities.filter(a => {
      const duration = a.duration || '';
      return duration.includes('year') || duration.includes('semester');
    });
    score += longTermActivities.length * 3;

    return Math.min(100, score);
  }

  /**
   * Calculate essays score (10% weight)
   * Based on quality metrics and relevance
   */
  private calculateEssaysScore(essays: any[]): number {
    if (!essays || essays.length === 0) return 30;

    let totalScore = 0;
    let essayCount = 0;

    essays.forEach(essay => {
      let essayScore = 50; // Base score

      // Word count assessment
      const wordCount = essay.wordCount || 0;
      if (wordCount >= 500 && wordCount <= 650) essayScore += 20; // Optimal range
      else if (wordCount >= 400 && wordCount <= 800) essayScore += 15;
      else if (wordCount >= 300 && wordCount <= 900) essayScore += 10;
      else if (wordCount < 200 || wordCount > 1000) essayScore -= 10;

      // Quality score if available
      if (essay.qualityScore !== undefined) {
        essayScore += essay.qualityScore * 0.3; // Assuming quality score is 0-100
      }

      // Content relevance (basic heuristics)
      if (essay.content) {
        const content = essay.content.toLowerCase();
        
        // Positive indicators
        if (content.includes('goal') || content.includes('aspiration')) essayScore += 5;
        if (content.includes('challenge') || content.includes('overcome')) essayScore += 5;
        if (content.includes('community') || content.includes('service')) essayScore += 5;
        if (content.includes('leadership') || content.includes('lead')) essayScore += 5;
        if (content.includes('impact') || content.includes('difference')) essayScore += 5;
        
        // Negative indicators
        if (content.length < 1000) essayScore -= 5; // Too brief
        if (content.split('.').length < 5) essayScore -= 5; // Too few sentences
      }

      totalScore += Math.max(0, Math.min(100, essayScore));
      essayCount++;
    });

    // Multiple essays bonus
    if (essayCount >= 3) totalScore *= 1.1;
    else if (essayCount >= 2) totalScore *= 1.05;

    return Math.min(100, essayCount > 0 ? totalScore / essayCount : 30);
  }

  /**
   * Calculate percentile ranking
   */
  private calculatePercentile(totalScore: number): number {
    // Percentile calculation based on score distribution
    if (totalScore >= 90) return 95;
    if (totalScore >= 85) return 90;
    if (totalScore >= 80) return 85;
    if (totalScore >= 75) return 80;
    if (totalScore >= 70) return 75;
    if (totalScore >= 65) return 65;
    if (totalScore >= 60) return 55;
    if (totalScore >= 55) return 45;
    if (totalScore >= 50) return 35;
    if (totalScore >= 45) return 25;
    if (totalScore >= 40) return 15;
    return Math.max(5, Math.round((totalScore / 40) * 15));
  }

  /**
   * Generate personalized recommendations based on score breakdown
   */
  private generateRecommendations(breakdown: any, profile: StudentProfile): string[] {
    const recommendations: string[] = [];

    // GPA recommendations
    if (breakdown.gpa < 20) {
      recommendations.push('Focus on improving your GPA - consider tutoring or study groups');
      recommendations.push('Look for scholarships that prioritize other factors over GPA');
    }

    // Activities recommendations
    if (breakdown.activities < 12) {
      recommendations.push('Increase your extracurricular involvement, especially leadership roles');
      recommendations.push('Consider volunteer work in your field of study');
    }

    // Essays recommendations
    if (breakdown.essays < 8) {
      recommendations.push('Invest more time in crafting compelling scholarship essays');
      recommendations.push('Seek feedback from mentors or writing centers');
    }

    // Financial recommendations
    if (breakdown.financial < 12) {
      recommendations.push('Ensure your FAFSA is completed accurately');
      recommendations.push('Look into need-based scholarships and grants');
    }

    // General recommendations
    recommendations.push('Apply to a mix of reach, match, and safety scholarships');
    recommendations.push('Start applications early to avoid rushing');

    return recommendations;
  }

  /**
   * Validate that weights sum to 1.0 (100%)
   */
  validateWeights(): boolean {
    const sum = Object.values(this.weights).reduce((total, weight) => total + weight, 0);
    const isValid = Math.abs(sum - 1.0) < 0.001; // Allow for floating point precision
    
    if (!isValid) {
      throw new Error(`Scoring weights must sum to 1.0, got ${sum}`);
    }
    
    return isValid;
  }

  /**
   * Calculate scholarship match score for a specific scholarship
   */
  calculateScholarshipMatch(profile: StudentProfile, scholarship: Scholarship): number {
    const baseScore = this.calculateScore(profile);
    
    // Apply scholarship-specific matching logic
    let matchMultiplier = 1.0;
    
    scholarship.requirements.forEach((requirement: ScholarshipRequirement) => {
      switch (requirement.type) {
        case 'gpa':
          if (profile.gpa >= requirement.value) {
            matchMultiplier += 0.1;
          } else {
            matchMultiplier -= 0.2;
          }
          break;
        case 'major':
          if (profile.major.toLowerCase().includes(requirement.value.toLowerCase())) {
            matchMultiplier += 0.15;
          }
          break;
        case 'demographic':
          // Would need more specific matching logic based on requirement
          matchMultiplier += 0.05;
          break;
        case 'financial':
          if (profile.financialNeed.expectedFamilyContribution <= requirement.value) {
            matchMultiplier += 0.1;
          }
          break;
      }
    });

    return Math.min(100, baseScore.totalScore * matchMultiplier);
  }

  /**
   * Get current weights configuration
   */
  getWeights(): ScoringWeights {
    return { ...this.weights };
  }

  /**
   * Update scoring weights
   */
  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
    this.validateWeights();
  }
}