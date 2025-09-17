import { SpiderWebDesignSystem, SpiderWebSpoke, ScoringWeights, AntiPattern } from '@/types/spider-web';

/**
 * Core configuration for Scholarship Tracker Pro v2 Spider Web Architecture
 * Contains all the foundational settings and configurations
 */

// Design System Configuration
export const SPIDER_WEB_DESIGN: SpiderWebDesignSystem = {
  colors: {
    webPrimary: '#2563eb',
    webSecondary: '#7c3aed',
    webAccent: '#059669',
    webNeutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    webGradients: {
      hub: 'radial-gradient(circle at center, #2563eb, #7c3aed)',
      spoke: 'linear-gradient(135deg, #7c3aed, #059669)',
      connection: 'linear-gradient(90deg, #2563eb, transparent, #7c3aed)',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
  },
  spacing: {
    hub: {
      padding: '2rem',
      margin: '1rem',
      gap: '1.5rem',
    },
    spoke: {
      padding: '1.5rem',
      margin: '0.75rem',
      gap: '1rem',
    },
    connection: {
      width: '2px',
      spacing: '0.5rem',
    },
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  animations: {
    hubPulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    spokeHover: 'transform 0.2s ease-in-out',
    connectionFlow: 'flow 3s linear infinite',
    dataVisualization: 'fadeIn 0.5s ease-out',
  },
};

// Spider Web Spokes Configuration
export const SPIDER_WEB_SPOKES: SpiderWebSpoke[] = [
  {
    id: 'scholarship-management',
    title: 'Scholarship Management',
    description: 'Discover, track, and manage scholarship opportunities with intelligent matching',
    icon: 'graduation-cap',
    path: '/scholarship-management',
    color: SPIDER_WEB_DESIGN.colors.webPrimary,
    isEnabled: true,
    priority: 'high',
    features: [
      {
        id: 'discovery',
        title: 'Smart Discovery',
        description: 'AI-powered scholarship discovery based on your profile',
        path: '/scholarship-management/discovery',
        isImplemented: false,
      },
      {
        id: 'tracking',
        title: 'Application Tracking',
        description: 'Track application status, deadlines, and requirements',
        path: '/scholarship-management/tracking',
        isImplemented: false,
      },
      {
        id: 'matching',
        title: 'Intelligent Matching',
        description: 'Match scholarships based on scoring algorithm',
        path: '/scholarship-management/matching',
        isImplemented: false,
      },
      {
        id: 'deadlines',
        title: 'Deadline Management',
        description: 'Never miss a scholarship deadline with smart reminders',
        path: '/scholarship-management/deadlines',
        isImplemented: false,
      },
    ],
  },
  {
    id: 'financial-tracking',
    title: 'Financial Tracking',
    description: 'Comprehensive financial planning, budgeting, and ROI analysis',
    icon: 'dollar-sign',
    path: '/financial-tracking',
    color: SPIDER_WEB_DESIGN.colors.webSecondary,
    isEnabled: true,
    priority: 'high',
    features: [
      {
        id: 'budget-impact',
        title: 'Budget Impact Analysis',
        description: 'Real-time analysis of scholarship impact on your finances',
        path: '/financial-tracking/budget-impact',
        isImplemented: false,
      },
      {
        id: 'roi-optimization',
        title: 'ROI Optimization',
        description: 'Optimize your application efforts for maximum return',
        path: '/financial-tracking/roi-optimization',
        isImplemented: false,
      },
      {
        id: 'portfolio-management',
        title: 'Portfolio Management',
        description: 'Manage your scholarship application portfolio strategically',
        path: '/financial-tracking/portfolio',
        isImplemented: false,
      },
      {
        id: 'cost-analysis',
        title: 'Cost Analysis',
        description: 'Analyze the true cost of education and funding gaps',
        path: '/financial-tracking/cost-analysis',
        isImplemented: false,
      },
    ],
  },
  {
    id: 'analytics-insights',
    title: 'Analytics & Insights',
    description: 'Data-driven insights, visualizations, and performance analytics',
    icon: 'bar-chart-3',
    path: '/analytics-insights',
    color: SPIDER_WEB_DESIGN.colors.webAccent,
    isEnabled: true,
    priority: 'medium',
    features: [
      {
        id: 'dashboard',
        title: 'Analytics Dashboard',
        description: 'Comprehensive overview of your scholarship journey',
        path: '/analytics-insights/dashboard',
        isImplemented: false,
      },
      {
        id: 'performance-tracking',
        title: 'Performance Tracking',
        description: 'Track your application success rates and improvements',
        path: '/analytics-insights/performance',
        isImplemented: false,
      },
      {
        id: 'pattern-analysis',
        title: 'Pattern Analysis',
        description: 'Identify success patterns and anti-patterns in your approach',
        path: '/analytics-insights/patterns',
        isImplemented: false,
      },
      {
        id: 'market-insights',
        title: 'Market Insights',
        description: 'Insights into scholarship market trends and opportunities',
        path: '/analytics-insights/market',
        isImplemented: false,
      },
    ],
  },
  {
    id: 'profile-settings',
    title: 'Profile & Settings',
    description: 'Manage your profile, preferences, and system configuration',
    icon: 'user-cog',
    path: '/profile-settings',
    color: SPIDER_WEB_DESIGN.colors.webNeutral[600],
    isEnabled: true,
    priority: 'medium',
    features: [
      {
        id: 'profile-management',
        title: 'Profile Management',
        description: 'Manage your student profile and academic information',
        path: '/profile-settings/profile',
        isImplemented: false,
      },
      {
        id: 'preferences',
        title: 'Preferences',
        description: 'Configure your notification and application preferences',
        path: '/profile-settings/preferences',
        isImplemented: false,
      },
      {
        id: 'data-export',
        title: 'Data Export',
        description: 'Export your data and application history',
        path: '/profile-settings/export',
        isImplemented: false,
      },
      {
        id: 'security',
        title: 'Security Settings',
        description: 'Manage your account security and privacy settings',
        path: '/profile-settings/security',
        isImplemented: false,
      },
    ],
  },
];

// Scholarship Scoring Engine Configuration
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  gpa: 0.25,        // 25% - Academic performance
  education: 0.20,  // 20% - Education level and institution
  demographics: 0.15, // 15% - Demographic factors
  financial: 0.15,  // 15% - Financial need assessment
  activities: 0.15, // 15% - Extracurricular activities and achievements
  essays: 0.10,     // 10% - Essay quality and relevance
};

// Performance Targets Configuration
export const PERFORMANCE_TARGETS = {
  validationTime: 5, // sub-5ms validation performance
  pageLoadTime: 3000, // sub-3s page load times (3000ms)
  buildTime: 60000, // 60 seconds build time target
  bundleSize: 1000000, // 1MB bundle size target
} as const;

// BugX v1.3 Configuration
export const BUGX_CONFIG = {
  phases: ['reality-check', 'implementation', 'integration', 'performance'] as const,
  validationRules: {
    typeSafety: {
      enabled: true,
      strictMode: true,
      noImplicitAny: true,
    },
    performance: {
      enabled: true,
      targets: PERFORMANCE_TARGETS,
    },
    circularDependencies: {
      enabled: true,
      maxDepth: 5,
    },
    businessLogic: {
      enabled: true,
      preserveAlgorithms: true,
      testParity: true,
    },
  },
} as const;

// Route Configuration
export const ROUTE_CONFIG = {
  hub: '/',
  spokes: {
    scholarshipManagement: '/scholarship-management',
    financialTracking: '/financial-tracking',
    analyticsInsights: '/analytics-insights',
    profileSettings: '/profile-settings',
  },
  auth: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    signOut: '/sign-out',
  },
} as const;

// Navigation Configuration
export const NAVIGATION_CONFIG = {
  mainNav: [
    { title: 'Hub', path: ROUTE_CONFIG.hub },
    { title: 'Scholarships', path: ROUTE_CONFIG.spokes.scholarshipManagement },
    { title: 'Financial', path: ROUTE_CONFIG.spokes.financialTracking },
    { title: 'Analytics', path: ROUTE_CONFIG.spokes.analyticsInsights },
    { title: 'Profile', path: ROUTE_CONFIG.spokes.profileSettings },
  ],
  footerNav: [
    { title: 'About', path: '/about' },
    { title: 'Help', path: '/help' },
    { title: 'Privacy', path: '/privacy' },
    { title: 'Terms', path: '/terms' },
  ],
} as const;