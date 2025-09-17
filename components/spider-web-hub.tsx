'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  DollarSign, 
  BarChart3, 
  UserCog, 
  TrendingUp, 
  Target,
  Clock,
  Award,
  ArrowRight,
  Zap
} from 'lucide-react';
import { SPIDER_WEB_SPOKES, SPIDER_WEB_DESIGN } from '@/config/spider-web-config';
import { SpiderWebSpoke } from '@/types/spider-web';

interface HubMetricsProps {
  totalScholarships?: number;
  activeApplications?: number;
  totalAwardAmount?: number;
  completionRate?: number;
}

const iconMap = {
  'graduation-cap': GraduationCap,
  'dollar-sign': DollarSign,
  'bar-chart-3': BarChart3,
  'user-cog': UserCog,
};

export default function SpiderWebHub({ 
  totalScholarships = 47,
  activeApplications = 12,
  totalAwardAmount = 85000,
  completionRate = 73 
}: HubMetricsProps) {
  const handleSpokeClick = (spokePath: string) => {
    // For now, just console log - routing will be implemented later
    console.log(`Navigating to: ${spokePath}`);
  };

  const renderSpoke = (spoke: SpiderWebSpoke) => {
    const IconComponent = iconMap[spoke.icon as keyof typeof iconMap] || GraduationCap;
    const implementedFeatures = spoke.features.filter(f => f.isImplemented).length;
    const totalFeatures = spoke.features.length;
    
    return (
      <Card 
        key={spoke.id}
        className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50"
        onClick={() => handleSpokeClick(spoke.path)}
        style={{
          background: `linear-gradient(135deg, ${spoke.color}15, transparent)`,
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: `linear-gradient(135deg, ${spoke.color}20, ${spoke.color}10)`,
                color: spoke.color 
              }}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <Badge 
              variant={spoke.priority === 'high' ? 'destructive' : spoke.priority === 'medium' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {spoke.priority}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold">{spoke.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {spoke.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Features</span>
              <span className="font-medium">{implementedFeatures}/{totalFeatures}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  background: `linear-gradient(90deg, ${spoke.color}, ${spoke.color}80)`,
                  width: `${(implementedFeatures / totalFeatures) * 100}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {spoke.isEnabled ? 'Active' : 'Coming Soon'}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Central Hub Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-6 rounded-full mb-6"
          style={{ 
            background: SPIDER_WEB_DESIGN.colors.webGradients.hub,
            boxShadow: `0 20px 40px ${SPIDER_WEB_DESIGN.colors.webPrimary}20`
          }}
        >
          <Zap className="h-12 w-12 text-white animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Scholarship Tracker Pro v2
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Revolutionary Spider Web Architecture for comprehensive scholarship management, 
          financial tracking, and intelligent analytics.
        </p>
      </div>

      {/* Central Hub Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center p-6 border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-transparent">
          <div className="flex items-center justify-center mb-3">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{totalScholarships}</div>
          <div className="text-sm text-muted-foreground">Scholarships Found</div>
        </Card>

        <Card className="text-center p-6 border-2 border-secondary/20 bg-gradient-to-br from-purple-50 to-transparent">
          <div className="flex items-center justify-center mb-3">
            <Clock className="h-8 w-8 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-secondary">{activeApplications}</div>
          <div className="text-sm text-muted-foreground">Active Applications</div>
        </Card>

        <Card className="text-center p-6 border-2 border-emerald-600/20 bg-gradient-to-br from-emerald-50 to-transparent">
          <div className="flex items-center justify-center mb-3">
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            ${totalAwardAmount.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Potential Awards</div>
        </Card>

        <Card className="text-center p-6 border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-transparent">
          <div className="flex items-center justify-center mb-3">
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-500">{completionRate}%</div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </Card>
      </div>

      {/* Spider Web Spokes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {SPIDER_WEB_SPOKES.map(renderSpoke)}
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-6">Quick Actions</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Target className="mr-2 h-5 w-5" />
            Find Scholarships
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 hover:bg-primary/5"
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            View Analytics
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 hover:bg-primary/5"
          >
            <UserCog className="mr-2 h-5 w-5" />
            Update Profile
          </Button>
        </div>
      </div>

      {/* Spider Web Visualization Placeholder */}
      <div className="mt-16 text-center">
        <div className="inline-block p-8 rounded-full border-4 border-dashed border-primary/30 bg-gradient-to-r from-blue-50 via-purple-50 to-emerald-50">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            Spider Web Architecture
          </div>
          <div className="text-sm text-muted-foreground">
            Interactive visualization coming soon
          </div>
        </div>
      </div>
    </div>
  );
}