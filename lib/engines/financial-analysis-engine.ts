/**
 * Financial Analysis Engine - Core Business Logic Algorithm
 * Implements real-time budget impact calculations and ROI optimization
 * 
 * Key Features:
 * - Budget Impact Analysis
 * - ROI Optimization
 * - Portfolio Management
 * - Cost-Benefit Analysis
 */

import { 
  FinancialAnalysisEngine, 
  Scholarship, 
  FinancialProfile, 
  BudgetImpact, 
  ApplicationEffort, 
  ROIAnalysis, 
  StudentProfile, 
  OptimizedPortfolio 
} from '@/types/spider-web';

export class FinancialAnalysisEngineImpl implements FinancialAnalysisEngine {
  private readonly OPPORTUNITY_COST_RATE = 0.15; // 15% annual opportunity cost
  private readonly APPLICATION_HOUR_VALUE = 25; // $25/hour value of student time
  private readonly RISK_ADJUSTMENT_FACTORS = {
    low: 0.9,
    medium: 0.7,
    high: 0.4,
  };

  /**
   * Calculate the budget impact of a scholarship
   */
  calculateBudgetImpact(scholarship: Scholarship, profile: FinancialProfile): BudgetImpact {
    const netBenefit = this.calculateNetBenefit(scholarship, profile);
    const debtReduction = this.calculateDebtReduction(scholarship.amount, profile);
    const opportunityCost = this.calculateOpportunityCost(scholarship.amount);
    const paybackPeriod = this.calculatePaybackPeriod(scholarship.amount, profile);
    const recommendations = this.generateBudgetRecommendations(scholarship, profile, netBenefit);

    return {
      netBenefit,
      debtReduction,
      opportunityCost,
      paybackPeriod,
      recommendations,
    };
  }

  /**
   * Calculate ROI for scholarship application effort
   */
  calculateROI(scholarship: Scholarship, effort: ApplicationEffort): ROIAnalysis {
    const applicationCost = this.calculateApplicationCost(effort);
    const expectedValue = this.calculateExpectedValue(scholarship, effort);
    const roi = ((expectedValue - applicationCost) / applicationCost) * 100;
    const probability = this.calculateWinProbability(scholarship, effort);
    const riskLevel = this.assessRiskLevel(scholarship, effort);
    const timeToComplete = effort.estimatedHours;

    return {
      roi: Math.round(roi * 100) / 100,
      probability: Math.round(probability * 100) / 100,
      expectedValue: Math.round(expectedValue * 100) / 100,
      riskLevel,
      timeToComplete,
    };
  }

  /**
   * Optimize scholarship portfolio for maximum return
   */
  optimizePortfolio(scholarships: Scholarship[], profile: StudentProfile): OptimizedPortfolio {
    // Calculate ROI and risk for each scholarship
    const scholarshipAnalysis = scholarships.map(scholarship => {
      const effort = this.estimateApplicationEffort(scholarship);
      const roi = this.calculateROI(scholarship, effort);
      const budgetImpact = this.calculateBudgetImpact(scholarship, profile.financialNeed);
      
      return {
        scholarship,
        effort,
        roi,
        budgetImpact,
        score: this.calculatePortfolioScore(scholarship, roi, budgetImpact),
      };
    });

    // Sort by score and select optimal mix
    const sortedScholarships = scholarshipAnalysis.sort((a, b) => b.score - a.score);
    
    // Apply portfolio optimization logic
    const optimized = this.selectOptimalPortfolio(sortedScholarships, profile);
    
    const totalPotentialAward = optimized.reduce((sum, item) => 
      sum + (item.scholarship.amount * item.roi.probability / 100), 0);
    
    const totalEstimatedEffort = optimized.reduce((sum, item) => 
      sum + item.effort.estimatedHours, 0);
    
    const portfolioROI = this.calculatePortfolioROI(optimized);
    const riskDistribution = this.calculateRiskDistribution(optimized);

    return {
      selectedScholarships: optimized.map(item => item.scholarship),
      totalPotentialAward: Math.round(totalPotentialAward),
      totalEstimatedEffort,
      portfolioROI,
      riskDistribution,
    };
  }

  // Private helper methods

  private calculateNetBenefit(scholarship: Scholarship, profile: FinancialProfile): number {
    let benefit = scholarship.amount;
    
    // Adjust for tax implications (scholarships are generally tax-free for tuition)
    const taxableAmount = Math.max(0, scholarship.amount - 20000); // Rough estimate
    benefit -= taxableAmount * 0.22; // Assumed tax rate
    
    // Adjust for financial need
    const needAdjustment = Math.min(1.0, profile.financialNeed / scholarship.amount);
    benefit *= (0.5 + 0.5 * needAdjustment); // Higher benefit for higher need
    
    return Math.round(benefit);
  }

  private calculateDebtReduction(amount: number, profile: FinancialProfile): number {
    // Assume scholarship reduces debt dollar-for-dollar up to total need
    const maxDebtReduction = Math.min(amount, profile.financialNeed);
    
    // Calculate present value of debt reduction (assuming 6% interest over 10 years)
    const interestRate = 0.06;
    const years = 10;
    const presentValue = maxDebtReduction * (1 - Math.pow(1 + interestRate, -years)) / interestRate;
    
    return Math.round(presentValue);
  }

  private calculateOpportunityCost(amount: number): number {
    // Opportunity cost of not investing the scholarship amount
    return Math.round(amount * this.OPPORTUNITY_COST_RATE);
  }

  private calculatePaybackPeriod(amount: number, profile: FinancialProfile): number {
    // Estimate payback period based on expected salary increase from education
    const expectedSalaryIncrease = 5000; // Rough estimate per year of education funded
    const annualBenefit = Math.min(amount / 4, expectedSalaryIncrease); // Assuming 4-year program
    
    if (annualBenefit <= 0) return Infinity;
    
    return Math.round((amount / annualBenefit) * 100) / 100;
  }

  private generateBudgetRecommendations(
    scholarship: Scholarship, 
    profile: FinancialProfile, 
    netBenefit: number
  ): string[] {
    const recommendations: string[] = [];

    if (netBenefit > scholarship.amount * 0.8) {
      recommendations.push('Excellent financial match - high priority application');
    } else if (netBenefit > scholarship.amount * 0.5) {
      recommendations.push('Good financial benefit - consider applying');
    } else {
      recommendations.push('Moderate financial benefit - evaluate time investment');
    }

    if (scholarship.renewability) {
      recommendations.push('Renewable scholarship - factor in multi-year value');
    }

    if (profile.familyIncome < 50000) {
      recommendations.push('Focus on need-based scholarships for maximum impact');
    }

    const debtToIncomeRatio = profile.financialNeed / Math.max(profile.familyIncome, 1);
    if (debtToIncomeRatio > 1.0) {
      recommendations.push('High debt risk - prioritize larger scholarships');
    }

    return recommendations;
  }

  private calculateApplicationCost(effort: ApplicationEffort): number {
    const timeCost = effort.estimatedHours * this.APPLICATION_HOUR_VALUE;
    
    // Add complexity multiplier
    const complexityMultiplier = {
      low: 1.0,
      medium: 1.5,
      high: 2.5,
    }[effort.complexity];

    // Add stress cost (psychological cost of tight deadlines)
    const stressCost = effort.deadlineStress * 50; // $50 per stress unit

    return timeCost * complexityMultiplier + stressCost;
  }

  private calculateExpectedValue(scholarship: Scholarship, effort: ApplicationEffort): number {
    const winProbability = this.calculateWinProbability(scholarship, effort);
    const adjustedAmount = scholarship.amount * this.RISK_ADJUSTMENT_FACTORS[scholarship.competitiveness];
    
    return winProbability * adjustedAmount / 100;
  }

  private calculateWinProbability(scholarship: Scholarship, effort: ApplicationEffort): number {
    let baseProbability = {
      low: 25,    // 25% for low competition
      medium: 10, // 10% for medium competition
      high: 3,    // 3% for high competition
    }[scholarship.competitiveness];

    // Adjust based on effort quality
    const effortMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
    }[effort.complexity];

    // Adjust based on deadline stress (rushed applications perform worse)
    const stressAdjustment = Math.max(0.5, 1.0 - (effort.deadlineStress * 0.1));

    return Math.min(50, baseProbability * effortMultiplier * stressAdjustment);
  }

  private assessRiskLevel(scholarship: Scholarship, effort: ApplicationEffort): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Competition level risk
    if (scholarship.competitiveness === 'high') riskScore += 3;
    else if (scholarship.competitiveness === 'medium') riskScore += 2;
    else riskScore += 1;

    // Application complexity risk
    if (effort.complexity === 'high') riskScore += 2;
    else if (effort.complexity === 'medium') riskScore += 1;

    // Deadline stress risk
    if (effort.deadlineStress >= 8) riskScore += 2;
    else if (effort.deadlineStress >= 5) riskScore += 1;

    // Amount risk (larger amounts are inherently riskier)
    if (scholarship.amount >= 20000) riskScore += 1;
    if (scholarship.amount >= 50000) riskScore += 1;

    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  private estimateApplicationEffort(scholarship: Scholarship): ApplicationEffort {
    // Estimate effort based on scholarship characteristics
    let estimatedHours = 5; // Base hours
    let complexity: 'low' | 'medium' | 'high' = 'medium';
    let deadlineStress = 3; // Base stress level

    // Adjust based on amount (higher amounts typically require more effort)
    if (scholarship.amount >= 50000) {
      estimatedHours += 15;
      complexity = 'high';
    } else if (scholarship.amount >= 20000) {
      estimatedHours += 10;
      complexity = 'medium';
    } else {
      estimatedHours += 5;
      complexity = 'low';
    }

    // Adjust based on competitiveness
    if (scholarship.competitiveness === 'high') {
      estimatedHours += 10;
      complexity = 'high';
    }

    // Adjust based on requirements
    const requirementCount = scholarship.requirements.length;
    estimatedHours += requirementCount * 2;

    // Check if essays are required
    const hasEssayRequirement = scholarship.requirements.some(req => req.type === 'essay');
    if (hasEssayRequirement) {
      estimatedHours += 8;
      if (complexity !== 'high') complexity = 'medium';
    }

    // Estimate deadline stress based on current date vs deadline
    const daysUntilDeadline = Math.max(0, 
      Math.floor((scholarship.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    
    if (daysUntilDeadline <= 7) deadlineStress = 9;
    else if (daysUntilDeadline <= 14) deadlineStress = 6;
    else if (daysUntilDeadline <= 30) deadlineStress = 4;
    else deadlineStress = 2;

    const requiredDocuments = scholarship.requirements
      .filter(req => req.isRequired)
      .map(req => req.type);

    return {
      estimatedHours: Math.round(estimatedHours),
      complexity,
      requiredDocuments,
      deadlineStress,
    };
  }

  private calculatePortfolioScore(
    scholarship: Scholarship, 
    roi: ROIAnalysis, 
    budgetImpact: BudgetImpact
  ): number {
    // Weighted score calculation
    const roiScore = Math.min(100, roi.roi / 5); // Normalize ROI
    const probabilityScore = roi.probability;
    const impactScore = Math.min(100, budgetImpact.netBenefit / 1000); // Normalize impact
    const riskScore = roi.riskLevel === 'low' ? 100 : roi.riskLevel === 'medium' ? 70 : 40;

    return (roiScore * 0.3) + (probabilityScore * 0.3) + (impactScore * 0.25) + (riskScore * 0.15);
  }

  private selectOptimalPortfolio(
    sortedAnalysis: any[], 
    profile: StudentProfile
  ): any[] {
    const selected = [];
    let totalEffort = 0;
    let riskBudget = { safe: 0, moderate: 0, reach: 0 };
    
    // Set effort and risk limits based on profile
    const maxEffort = this.calculateMaxEffort(profile);
    const targetRiskDistribution = { safe: 0.4, moderate: 0.4, reach: 0.2 };

    for (const analysis of sortedAnalysis) {
      const wouldExceedEffort = totalEffort + analysis.effort.estimatedHours > maxEffort;
      const riskCategory = this.categorizeBirisk(analysis.roi.riskLevel);
      const wouldExceedRisk = riskBudget[riskCategory] >= targetRiskDistribution[riskCategory] * 10;

      if (!wouldExceedEffort && !wouldExceedRisk && selected.length < 10) {
        selected.push(analysis);
        totalEffort += analysis.effort.estimatedHours;
        riskBudget[riskCategory]++;
      }
    }

    return selected;
  }

  private calculateMaxEffort(profile: StudentProfile): number {
    // Estimate available time based on student profile
    let maxHours = 80; // Base assumption: 20 hours/week for 4 weeks

    // Adjust based on current course load (would need this data)
    // For now, assume standard full-time student
    
    // Adjust based on work commitments
    const workHours = profile.activities
      .filter(a => a.type === 'work')
      .reduce((sum, a) => sum + (a.hoursPerWeek || 0), 0);
    
    maxHours -= workHours * 0.5; // Reduce available time based on work

    // Adjust based on GPA (students with lower GPAs should focus more on studies)
    if (profile.gpa < 3.0) maxHours *= 0.7;
    else if (profile.gpa < 3.5) maxHours *= 0.85;

    return Math.max(20, maxHours); // Minimum 20 hours
  }

  private categorizeBirisk(riskLevel: 'low' | 'medium' | 'high'): 'safe' | 'moderate' | 'reach' {
    switch (riskLevel) {
      case 'low': return 'safe';
      case 'medium': return 'moderate';
      case 'high': return 'reach';
    }
  }

  private calculatePortfolioROI(portfolio: any[]): number {
    if (portfolio.length === 0) return 0;

    const totalExpectedReturn = portfolio.reduce((sum, item) => 
      sum + item.roi.expectedValue, 0);
    
    const totalCost = portfolio.reduce((sum, item) => 
      sum + this.calculateApplicationCost(item.effort), 0);

    if (totalCost === 0) return 0;

    return Math.round(((totalExpectedReturn - totalCost) / totalCost) * 100 * 100) / 100;
  }

  private calculateRiskDistribution(portfolio: any[]): { safe: number; moderate: number; reach: number } {
    const total = portfolio.length;
    if (total === 0) return { safe: 0, moderate: 0, reach: 0 };

    const distribution = portfolio.reduce((dist, item) => {
      const category = this.categorizeBirisk(item.roi.riskLevel);
      dist[category]++;
      return dist;
    }, { safe: 0, moderate: 0, reach: 0 });

    return {
      safe: Math.round((distribution.safe / total) * 100),
      moderate: Math.round((distribution.moderate / total) * 100),
      reach: Math.round((distribution.reach / total) * 100),
    };
  }
}