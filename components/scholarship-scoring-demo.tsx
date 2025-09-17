'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  TrendingUp, 
  Award, 
  User,
  BookOpen,
  DollarSign,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import { 
  ScholarshipScoringService,
  createScoringService,
  generateTestStudentProfiles,
  generateTestScholarships,
  runScoringEngineParityTests
} from '@/services/scholarship-scoring-service';
import { StudentProfile, ScholarshipScore, Scholarship } from '@/types/spider-web';

interface ScoringResults {
  profile: StudentProfile;
  score: ScholarshipScore;
  scholarshipMatches: Array<{
    scholarship: Scholarship;
    matchScore: number;
  }>;
}

export default function ScholarshipScoringDemo() {
  const [scoringService] = useState(() => createScoringService());
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ScoringResults[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<number>(0);
  const [parityTestResults, setParityTestResults] = useState<any>(null);

  const testProfiles = generateTestStudentProfiles();
  const testScholarships = generateTestScholarships();

  const runScoringDemo = async () => {
    setIsRunning(true);
    const newResults: ScoringResults[] = [];

    try {
      for (const profile of testProfiles) {
        // Calculate base score
        const score = await scoringService.calculateScore(profile);
        
        // Calculate scholarship matches
        const scholarshipMatches = [];
        for (const scholarship of testScholarships) {
          const matchScore = await scoringService.calculateScholarshipMatch(profile, scholarship);
          scholarshipMatches.push({ scholarship, matchScore });
        }
        
        // Sort matches by score
        scholarshipMatches.sort((a, b) => b.matchScore - a.matchScore);

        newResults.push({
          profile,
          score,
          scholarshipMatches,
        });
      }

      setResults(newResults);
    } catch (error) {
      console.error('Error running scoring demo:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runParityTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await runScoringEngineParityTests();
      setParityTestResults(testResults);
    } catch (error) {
      console.error('Error running parity tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetDemo = () => {
    setResults([]);
    setParityTestResults(null);
    setSelectedProfile(0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-blue-100">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Scholarship Scoring Engine Demo</h1>
            <p className="text-muted-foreground">
              Interactive demonstration of the weighted intelligence scoring system
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={runScoringDemo} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Scoring Demo'}
          </Button>
          <Button 
            onClick={runParityTests} 
            disabled={isRunning}
            variant="outline"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Run Parity Tests
          </Button>
          <Button 
            onClick={resetDemo} 
            variant="outline"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Scoring Weights Display */}
      <Card className="mb-8 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Scoring Algorithm Weights
          </CardTitle>
          <CardDescription>
            Weighted intelligence system for scholarship matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(scoringService.getWeights()).map(([key, weight]) => (
              <div key={key} className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {(weight * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parity Test Results */}
      {parityTestResults && (
        <Card className="mb-8 border-2 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {parityTestResults.passed ? 
                <CheckCircle className="h-5 w-5 text-emerald-600" /> : 
                <XCircle className="h-5 w-5 text-red-600" />
              }
              Behavioral Parity Tests
            </CardTitle>
            <CardDescription>
              Validation of scoring engine algorithms and consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parityTestResults.results.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    {result.passed ? 
                      <CheckCircle className="h-5 w-5 text-emerald-600" /> : 
                      <XCircle className="h-5 w-5 text-red-600" />
                    }
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.details}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <>
          {/* Profile Selector */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Test Profiles</h3>
            <div className="flex gap-4 flex-wrap">
              {results.map((result, index) => (
                <Button
                  key={index}
                  variant={selectedProfile === index ? 'default' : 'outline'}
                  onClick={() => setSelectedProfile(index)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {result.profile.major} Student
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Profile Results */}
          {results[selectedProfile] && (
            <div className="space-y-6">
              {/* Profile Overview */}
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Student Profile: {results[selectedProfile].profile.major}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold text-purple-800">
                        {results[selectedProfile].profile.gpa}
                      </div>
                      <div className="text-sm text-muted-foreground">GPA</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold text-purple-800">
                        ${results[selectedProfile].profile.financialNeed.financialNeed.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Financial Need</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold text-purple-800">
                        {results[selectedProfile].profile.activities.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Activities</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold text-purple-800">
                        {results[selectedProfile].profile.essays.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Essays</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card className="border-2 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Scoring Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${getScoreColor(results[selectedProfile].score.totalScore)}`}>
                        {results[selectedProfile].score.totalScore.toFixed(1)}
                      </div>
                      <div className="text-lg text-muted-foreground">
                        {results[selectedProfile].score.percentile}th Percentile
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(results[selectedProfile].score.breakdown).map(([category, score]) => (
                        <div key={category} className="text-center p-3 bg-emerald-50 rounded-lg">
                          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score.toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-emerald-600" />
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {results[selectedProfile].score.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-emerald-50 rounded-lg text-sm">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scholarship Matches */}
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    Scholarship Matches
                  </CardTitle>
                  <CardDescription>
                    Scholarships ranked by match score for this profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results[selectedProfile].scholarshipMatches.map((match, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{match.scholarship.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getCompetitivenessColor(match.scholarship.competitiveness)}>
                              {match.scholarship.competitiveness}
                            </Badge>
                            <div className={`text-lg font-bold ${getScoreColor(match.matchScore)}`}>
                              {match.matchScore.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{match.scholarship.provider}</span>
                          <span>${match.scholarship.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}