import { UserSubscription, SubscriptionTier } from './api';

export interface FeatureLimits {
  maxProjects: number | 'unlimited';
  canFeatureProject: boolean;
  hasAdvancedAnalytics: boolean;
  hasInvestorMessaging: boolean;
  hasNewsletterPromotion: boolean;
  hasPriorityMatching: boolean;
  hasBrandCustomization: boolean;
  hasDedicatedSupport: boolean;
}

export const getFeatureLimits = (subscription: UserSubscription | null): FeatureLimits => {
  if (!subscription || subscription.status !== 'active') {
    return {
      maxProjects: 0,
      canFeatureProject: false,
      hasAdvancedAnalytics: false,
      hasInvestorMessaging: false,
      hasNewsletterPromotion: false,
      hasPriorityMatching: false,
      hasBrandCustomization: false,
      hasDedicatedSupport: false,
    };
  }

  switch (subscription.tier) {
    case 'starter':
      return {
        maxProjects: 1,
        canFeatureProject: false,
        hasAdvancedAnalytics: false,
        hasInvestorMessaging: false,
        hasNewsletterPromotion: false,
        hasPriorityMatching: false,
        hasBrandCustomization: false,
        hasDedicatedSupport: false,
      };
    case 'pro':
      return {
        maxProjects: 5,
        canFeatureProject: true,
        hasAdvancedAnalytics: false,
        hasInvestorMessaging: true,
        hasNewsletterPromotion: false,
        hasPriorityMatching: false,
        hasBrandCustomization: false,
        hasDedicatedSupport: false,
      };
    case 'growth':
      return {
        maxProjects: 10,
        canFeatureProject: true,
        hasAdvancedAnalytics: true,
        hasInvestorMessaging: true,
        hasNewsletterPromotion: true,
        hasPriorityMatching: false,
        hasBrandCustomization: false,
        hasDedicatedSupport: false,
      };
    case 'enterprise':
      return {
        maxProjects: 'unlimited',
        canFeatureProject: true,
        hasAdvancedAnalytics: true,
        hasInvestorMessaging: true,
        hasNewsletterPromotion: true,
        hasPriorityMatching: true,
        hasBrandCustomization: true,
        hasDedicatedSupport: true,
      };
    default:
      return {
        maxProjects: 0,
        canFeatureProject: false,
        hasAdvancedAnalytics: false,
        hasInvestorMessaging: false,
        hasNewsletterPromotion: false,
        hasPriorityMatching: false,
        hasBrandCustomization: false,
        hasDedicatedSupport: false,
      };
  }
};

export const canCreateProject = (
  subscription: UserSubscription | null,
  currentProjectCount: number
): boolean => {
  const limits = getFeatureLimits(subscription);
  
  if (limits.maxProjects === 'unlimited') {
    return true;
  }
  
  return currentProjectCount < limits.maxProjects;
};

export const getUpgradeMessage = (currentTier: SubscriptionTier | null): string => {
  if (!currentTier || currentTier === 'starter') {
    return 'Upgrade to Pro to list more projects and unlock premium features.';
  }
  if (currentTier === 'pro') {
    return 'Upgrade to Growth for advanced analytics and more project listings.';
  }
  if (currentTier === 'growth') {
    return 'Upgrade to Enterprise for unlimited projects and premium features.';
  }
  return '';
};

export const calculateInvestmentFee = (amount: number, feePercentage: number = 2.5): number => {
  return Math.round(amount * (feePercentage / 100));
};

export const getNetInvestmentAmount = (amount: number, feePercentage: number = 2.5): number => {
  return amount - calculateInvestmentFee(amount, feePercentage);
};
