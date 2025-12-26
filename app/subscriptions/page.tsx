'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Check, Zap, TrendingUp, Crown, Loader2 } from 'lucide-react';
import { apiClient, SubscriptionPlan, UserSubscription } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'starter',
    name: 'Starter',
    price: 0,
    duration: 21,
    durationLabel: '21 days',
    maxProjects: 1,
    features: [
      'Publish 1 project',
      'Basic project presentation page',
      'Standard marketplace visibility',
      'Access to basic project insights',
      'No featured placement',
    ],
    costRank: 'Free Trial',
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 199,
    duration: 90,
    durationLabel: '3 months',
    maxProjects: 5,
    features: [
      'List up to 5 projects',
      'Enhanced platform visibility',
      'Access to investor inquiries & messaging',
      'Basic performance analytics',
      'Option to activate 7-day featured badge',
    ],
    popular: false,
    costRank: 'Highest monthly rate',
  },
  {
    tier: 'growth',
    name: 'Growth',
    price: 299,
    duration: 180,
    durationLabel: '6 months',
    maxProjects: 10,
    features: [
      'List up to 10 projects',
      'Advanced analytics dashboard',
      'Rotating featured placements',
      'Investor engagement insights',
      'Newsletter promotional slots',
    ],
    popular: true,
    costRank: 'Mid-high (best value)',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 499,
    duration: 365,
    durationLabel: '12 months',
    maxProjects: 'unlimited',
    features: [
      'Unlimited project listings',
      'Premium analytics + downloadable reports',
      'Year-long featured placement cycle',
      'Priority investor matching system',
      'Dedicated account support',
      'Brand customization',
    ],
    costRank: 'Best long-term value',
  },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<SubscriptionPlan['tier'] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/subscriptions');
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await apiClient.getUserSubscription();
        if (response.success && response.data) {
          setCurrentSubscription(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated, router]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/subscriptions');
      return;
    }

    // If it's the free starter plan
    if (plan.tier === 'starter') {
      try {
        setProcessingTier(plan.tier);
        const response = await apiClient.createSubscription(plan.tier);
        
        if (response.success) {
          toast({
            title: 'Trial Started!',
            description: 'Your 21-day free trial has been activated.',
          });
          router.push('/dashboard');
        } else {
          throw new Error(response.message || 'Failed to start trial');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to start trial',
          variant: 'destructive',
        });
      } finally {
        setProcessingTier(null);
      }
      return;
    }

    // For paid plans, redirect to payment
    try {
      setProcessingTier(plan.tier);
      const response = await apiClient.createSubscription(plan.tier);
      
      if (response.success && response.data?.paymentUrl) {
        // Redirect to payment page
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.message || 'Failed to initialize subscription');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start subscription',
        variant: 'destructive',
      });
      setProcessingTier(null);
    }
  };

  const getTierIcon = (tier: SubscriptionPlan['tier']) => {
    switch (tier) {
      case 'starter':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <TrendingUp className="h-6 w-6" />;
      case 'growth':
        return <Building2 className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  const isCurrentPlan = (tier: SubscriptionPlan['tier']) => {
    return currentSubscription?.tier === tier && currentSubscription?.status === 'active';
  };

  const isTrialActive = currentSubscription?.status === 'trial';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-700" />
              <span className="ml-2 text-2xl font-bold text-gray-900">BrickFund</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost">Browse Projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the subscription tier that best fits your project needs. All plans include our secure investment platform with a 2-3% transaction fee.
          </p>
        </div>

        {/* Current Subscription Banner */}
        {currentSubscription && currentSubscription.status === 'active' && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  Current Plan: <span className="capitalize">{currentSubscription.tier}</span>
                </p>
                <p className="text-sm text-blue-700">
                  Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
              <Link href="/subscriptions/manage">
                <Button variant="outline">Manage Subscription</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = isCurrentPlan(plan.tier);
            const isProcessing = processingTier === plan.tier;
            
            return (
              <Card
                key={plan.tier}
                className={`relative ${plan.popular ? 'border-2 border-blue-600 shadow-lg' : ''} ${
                  isCurrent ? 'border-green-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-600 text-white">Current</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                    {getTierIcon(plan.tier)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/ {plan.durationLabel}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.costRank}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-900 mb-4">
                      {plan.maxProjects === 'unlimited' ? 'Unlimited' : `Up to ${plan.maxProjects}`} Projects
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                    disabled={isCurrent || isProcessing}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : plan.tier === 'starter' ? (
                      'Start Free Trial'
                    ) : (
                      `Subscribe to ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Investment Fee Notice */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Transaction Fee</h3>
          <p className="text-gray-600">
            All investment transactions on BrickFund are subject to a 2-3% platform fee. This fee is automatically 
            deducted from each investment and covers platform infrastructure, secure transaction processing, 
            investor-developer protection, and customer support.
          </p>
        </div>

        {/* Optional Add-Ons Preview */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Add-Ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Featured Boost</h4>
                <p className="text-2xl font-bold mb-2">$25<span className="text-sm text-gray-600">/week</span></p>
                <p className="text-sm text-gray-600">High-visibility placement in Trending, Featured, and Top Investments sections.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Marketing Push</h4>
                <p className="text-2xl font-bold mb-2">$49<span className="text-sm text-gray-600">/campaign</span></p>
                <p className="text-sm text-gray-600">Targeted promotion via email campaigns and investor dashboards.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Branding Customization</h4>
                <p className="text-2xl font-bold mb-2">$99</p>
                <p className="text-sm text-gray-600">Enhanced visual presentation with branded pages, banners, and custom templates.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
