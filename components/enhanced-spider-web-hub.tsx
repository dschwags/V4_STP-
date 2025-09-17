'use client';

import React, { useEffect, useState } from 'react';
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
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Activity,
  Timer,
  Shield,
  Lightbulb
} from 'lucide-react';
import { useHubMetrics, useRealtimeMetrics } from '@/hooks/use-hub-metrics';
import { useSpiderWebNavigation } from '@/hooks/use-spider-web-navigation';
import { SPIDER_WEB_DESIGN } from '@/config/spider-web-config';
import { SpiderWebSpoke, SpokeId } from '@/types/spider-web';

const iconMap = {
  'graduation-cap': GraduationCap,
  'dollar-sign': DollarSign,
  'bar-chart-3': BarChart3,
  'user-cog': UserCog,
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
  isLoading?: boolean;
}> = ({ title, value, trend, icon, color, suffix = '', isLoading = false }) => {
  const getTrendIcon = () => {
    if (!trend || trend === 0) return null;
    return trend > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg`}
          style={{ borderColor: `${color}20` }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
            {icon}
          </div>
          {getTrendIcon()}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold" style={{ color }}>
              {isLoading ? '...' : `${value}${suffix}`}
            </p>
            {trend && (
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SpokeCard: React.FC<{
  spoke: SpiderWebSpoke;
  onNavigate: (spokeId: SpokeId) => void;
}> = ({ spoke, onNavigate }) => {
  const IconComponent = iconMap[spoke.icon as keyof typeof iconMap] || GraduationCap;
  const implementedFeatures = spoke.features.filter(f => f.isImplemented).length;
  const totalFeatures = spoke.features.length;
  const progress = (implementedFeatures / totalFeatures) * 100;
  
  return (
    <Card 
      className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50 bg-gradient-to-br from-background to-background/50"
      onClick={() => onNavigate(spoke.id)}
    >
      <div className="absolute inset-0 opacity-5 rounded-lg"
           style={{ background: `linear-gradient(135deg, ${spoke.color}, transparent)` }} />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div 
            className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{ 
              background: `linear-gradient(135deg, ${spoke.color}20, ${spoke.color}10)`,
              color: spoke.color,
              boxShadow: `0 4px 12px ${spoke.color}15`
            }}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={spoke.priority === 'high' ? 'destructive' : spoke.priority === 'medium' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {spoke.priority}
            </Badge>
            {!spoke.isEnabled && (
              <Badge variant="outline" className="text-xs">
                Coming Soon
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
          {spoke.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {spoke.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Features
            </span>
            <span className="font-medium">{implementedFeatures}/{totalFeatures}</span>
          </div>
          
          <div className="space-y-2">
            <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  background: `linear-gradient(90deg, ${spoke.color}, ${spoke.color}80)`,
                  width: `${progress}%`,
                  boxShadow: progress > 0 ? `0 0 8px ${spoke.color}40` : 'none'
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
              <span className={`font-medium ${spoke.isEnabled ? 'text-green-600' : 'text-orange-500'}`}>
                {spoke.isEnabled ? 'Active' : 'In Development'}
              </span>
            </div>
          </div>
          
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {spoke.features.length} capabilities
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EnhancedSpiderWebHub() {
  const [isClient, setIsClient] = useState(false);
  const { metrics, derivedMetrics, isLoading, error, refreshMetrics, formatCurrency, lastRefresh } = useHubMetrics();
  const realtimeData = useRealtimeMetrics(true);
  const { enabledSpokes, navigateToSpoke } = useSpiderWebNavigation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshMetrics} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Central Hub Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-6 rounded-full mb-6 relative"
          style={{ 
            background: SPIDER_WEB_DESIGN.colors.webGradients.hub,
            boxShadow: `0 20px 40px ${SPIDER_WEB_DESIGN.colors.webPrimary}20`
          }}
        >
          <Zap className="h-12 w-12 text-white animate-pulse" />
          {isLoading && (
            <div className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Scholarship Tracker Pro v2
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Revolutionary Spider Web Architecture for comprehensive scholarship management
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{isClient ? realtimeData.activeUsers : 125} active users</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span>Last updated: {lastRefresh?.toLocaleTimeString() || 'Never'}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Scholarships Found"
          value={metrics?.totalScholarships || 0}
          trend={derivedMetrics?.scholarshipTrend}
          icon={<Award className="h-6 w-6" />}
          color={SPIDER_WEB_DESIGN.colors.webPrimary}
          isLoading={isLoading}
        />
        
        <MetricCard
          title="Active Applications"
          value={metrics?.activeApplications || 0}
          trend={derivedMetrics?.applicationTrend}
          icon={<Clock className="h-6 w-6" />}
          color={SPIDER_WEB_DESIGN.colors.webSecondary}
          isLoading={isLoading}
        />
        
        <MetricCard
          title="Potential Awards"
          value={metrics ? formatCurrency(metrics.totalAwardAmount) : '$0'}
          icon={<DollarSign className="h-6 w-6" />}
          color={SPIDER_WEB_DESIGN.colors.webAccent}
          isLoading={isLoading}
        />
        
        <MetricCard
          title="Success Rate"
          value={metrics?.completionRate || 0}
          trend={metrics?.successTrend}
          icon={<TrendingUp className="h-6 w-6" />}
          color="#f59e0b"
          suffix="%"
          isLoading={isLoading}
        />
      </div>

      {/* Additional Insights Row */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-transparent border-blue-200">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="font-semibold text-blue-600">{metrics.scholarshipsThisMonth} New</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-transparent border-purple-200">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="font-semibold text-purple-600">{metrics.avgApplicationTime.toFixed(1)}h</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-transparent border-emerald-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="font-semibold text-emerald-600">{metrics.efficiencyScore}%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-transparent border-orange-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Deadlines</p>
                <p className="font-semibold text-orange-600">{metrics.upcomingDeadlines} Coming</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Spider Web Spokes Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Spider Web Spokes</h2>
          <Button onClick={refreshMetrics} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {enabledSpokes.map(spoke => (
            <SpokeCard 
              key={spoke.id} 
              spoke={spoke} 
              onNavigate={navigateToSpoke}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="text-center bg-gradient-to-r from-blue-50 via-purple-50 to-emerald-50 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold mb-6">Quick Actions</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            onClick={() => navigateToSpoke('scholarship-management')}
          >
            <Target className="mr-2 h-5 w-5" />
            Find Scholarships
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 hover:bg-primary/5 shadow-lg"
            onClick={() => navigateToSpoke('analytics-insights')}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            View Analytics
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 hover:bg-primary/5 shadow-lg"
            onClick={() => navigateToSpoke('profile-settings')}
          >
            <UserCog className="mr-2 h-5 w-5" />
            Update Profile
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 hover:bg-emerald-600/10 hover:border-emerald-600/30 shadow-lg"
            asChild
          >
            <a href="/scoring-demo">
              <Zap className="mr-2 h-5 w-5" />
              Scoring Demo
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}