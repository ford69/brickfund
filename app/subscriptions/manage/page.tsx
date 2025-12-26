'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { apiClient, UserSubscription, UserAddOn } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [addOns, setAddOns] = useState<UserAddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/subscriptions/manage');
      return;
    }

    const fetchData = async () => {
      try {
        const [subResponse, addOnsResponse] = await Promise.all([
          apiClient.getUserSubscription(),
          apiClient.getUserAddOns(),
        ]);

        if (subResponse.success && subResponse.data) {
          setSubscription(subResponse.data);
        }

        if (addOnsResponse.success && addOnsResponse.data) {
          setAddOns(addOnsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router]);

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription? You will lose access to premium features when it expires.')) {
      return;
    }

    try {
      setIsCancelling(true);
      const response = await apiClient.cancelSubscription(subscription._id);
      
      if (response.success) {
        setSubscription(response.data || null);
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription will remain active until the end of the current billing period.',
        });
      } else {
        throw new Error(response.message || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;

    try {
      const response = await apiClient.updateSubscription(subscription._id, {
        autoRenew: !subscription.autoRenew,
      });

      if (response.success) {
        setSubscription(response.data || null);
        toast({
          title: 'Auto-renew Updated',
          description: `Auto-renewal has been ${response.data?.autoRenew ? 'enabled' : 'disabled'}.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update auto-renewal',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: UserSubscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'trial':
        return <Badge className="bg-blue-600">Trial</Badge>;
      case 'expired':
        return <Badge className="bg-red-600">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-600">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-700" />
                <span className="ml-2 text-2xl font-bold text-gray-900">BrickFund</span>
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h2>
              <p className="text-gray-600 mb-6">You don't have an active subscription. Choose a plan to get started.</p>
              <Link href="/subscriptions">
                <Button>View Plans</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(subscription.endDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

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
              <Link href="/subscriptions">
                <Button variant="ghost">View Plans</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Subscription</h1>

        {/* Subscription Status */}
        {isExpiringSoon && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
                <Link href="/subscriptions" className="ml-2 underline font-medium">Renew now</Link>
              </p>
            </div>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl capitalize">{subscription.tier} Plan</CardTitle>
                <p className="text-gray-600 mt-1">Subscription Details</p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Start Date</span>
                </div>
                <p className="text-gray-900">{formatDate(subscription.startDate)}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">End Date</span>
                </div>
                <p className="text-gray-900">{formatDate(subscription.endDate)}</p>
                {daysRemaining > 0 && (
                  <p className="text-sm text-gray-500 mt-1">{daysRemaining} days remaining</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Auto-renewal</h3>
                  <p className="text-sm text-gray-600">
                    {subscription.autoRenew 
                      ? 'Your subscription will automatically renew at the end of the billing period.'
                      : 'Your subscription will not automatically renew.'}
                  </p>
                </div>
                <Button
                  variant={subscription.autoRenew ? 'default' : 'outline'}
                  onClick={handleToggleAutoRenew}
                  size="sm"
                >
                  {subscription.autoRenew ? 'Disable' : 'Enable'} Auto-renew
                </Button>
              </div>
            </div>

            {subscription.status === 'active' && (
              <div className="border-t pt-6">
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  You'll retain access to all features until {formatDate(subscription.endDate)}.
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <Link href="/subscriptions">
                <Button variant="outline" className="w-full">
                  Change Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Active Add-Ons */}
        {addOns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Add-Ons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addOns.map((addOn) => (
                  <div key={addOn._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {addOn.addOnType.replace(/_/g, ' ')}
                      </p>
                      {addOn.endDate && (
                        <p className="text-sm text-gray-600">
                          Expires: {formatDate(addOn.endDate)}
                        </p>
                      )}
                    </div>
                    <Badge className={addOn.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                      {addOn.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
