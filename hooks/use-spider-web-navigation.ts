'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ROUTE_CONFIG, SPIDER_WEB_SPOKES } from '@/config/spider-web-config';
import { SpiderWebSpoke, SpokeId } from '@/types/spider-web';

export interface NavigationState {
  currentSpoke: SpokeId | 'hub' | null;
  isInSpoke: boolean;
  isInHub: boolean;
  availableSpokes: SpiderWebSpoke[];
  enabledSpokes: SpiderWebSpoke[];
}

export interface Breadcrumb {
  label: string;
  path: string;
}

export function useSpiderWebNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current location in spider web
  const navigationState: NavigationState = useMemo(() => {
    const isInHub = pathname === ROUTE_CONFIG.hub;
    let currentSpoke: SpokeId | 'hub' | null = null;
    let isInSpoke = false;

    if (isInHub) {
      currentSpoke = 'hub';
    } else {
      // Check which spoke we're in
      for (const spoke of SPIDER_WEB_SPOKES) {
        if (pathname.startsWith(spoke.path)) {
          currentSpoke = spoke.id;
          isInSpoke = true;
          break;
        }
      }
    }

    const availableSpokes = SPIDER_WEB_SPOKES;
    const enabledSpokes = SPIDER_WEB_SPOKES.filter(spoke => spoke.isEnabled);

    return {
      currentSpoke,
      isInSpoke,
      isInHub,
      availableSpokes,
      enabledSpokes,
    };
  }, [pathname]);

  // Navigation functions
  const navigateToHub = useCallback(() => {
    router.push(ROUTE_CONFIG.hub);
  }, [router]);

  const navigateToSpoke = useCallback((spokeId: SpokeId) => {
    const spoke = SPIDER_WEB_SPOKES.find(s => s.id === spokeId);
    if (spoke && spoke.isEnabled) {
      router.push(spoke.path);
    } else {
      console.warn(`Spoke ${spokeId} is not enabled or does not exist`);
    }
  }, [router]);

  const navigateToSpokeFeature = useCallback((spokeId: SpokeId, featureId: string) => {
    const spoke = SPIDER_WEB_SPOKES.find(s => s.id === spokeId);
    if (spoke && spoke.isEnabled) {
      const feature = spoke.features.find(f => f.id === featureId);
      if (feature && feature.isImplemented) {
        router.push(feature.path);
      } else {
        console.warn(`Feature ${featureId} in spoke ${spokeId} is not implemented or does not exist`);
        // Fallback to spoke main page
        router.push(spoke.path);
      }
    }
  }, [router]);

  const goBack = useCallback(() => {
    if (navigationState.isInSpoke) {
      navigateToHub();
    } else {
      router.back();
    }
  }, [navigationState.isInSpoke, navigateToHub, router]);

  // Get spoke by ID
  const getSpokeById = useCallback((spokeId: SpokeId): SpiderWebSpoke | null => {
    return SPIDER_WEB_SPOKES.find(s => s.id === spokeId) || null;
  }, []);

  // Get current spoke details
  const getCurrentSpoke = useCallback((): SpiderWebSpoke | null => {
    if (navigationState.currentSpoke && navigationState.currentSpoke !== 'hub') {
      return getSpokeById(navigationState.currentSpoke as SpokeId);
    }
    return null;
  }, [navigationState.currentSpoke, getSpokeById]);

  // Check if navigation is available
  const canNavigateToSpoke = useCallback((spokeId: SpokeId): boolean => {
    const spoke = getSpokeById(spokeId);
    return spoke ? spoke.isEnabled : false;
  }, [getSpokeById]);

  // Get navigation breadcrumbs
  const getBreadcrumbs = useCallback((): Breadcrumb[] => {
    const breadcrumbs: Breadcrumb[] = [{ label: 'Hub', path: ROUTE_CONFIG.hub }];
    
    if (navigationState.isInSpoke) {
      const currentSpoke = getCurrentSpoke();
      if (currentSpoke) {
        breadcrumbs.push({
          label: currentSpoke.title,
          path: currentSpoke.path,
        });
        
        // Check if we're in a specific feature
        for (const feature of currentSpoke.features) {
          if (pathname === feature.path || pathname.startsWith(feature.path + '/')) {
            breadcrumbs.push({
              label: feature.title,
              path: feature.path,
            });
            break;
          }
        }
      }
    }
    
    return breadcrumbs;
  }, [navigationState.isInSpoke, getCurrentSpoke, pathname]);

  return {
    ...navigationState,
    navigateToHub,
    navigateToSpoke,
    navigateToSpokeFeature,
    goBack,
    getSpokeById,
    getCurrentSpoke,
    canNavigateToSpoke,
    getBreadcrumbs,
    pathname,
  };
}