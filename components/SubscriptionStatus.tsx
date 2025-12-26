'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserSubscription } from '@/lib/api';
import { getFeatureLimits } from '@/lib/subscription-utils';
import { Calendar, AlertTriangle } from 'lucide-react';

interface SubscriptionStatusProps {
  subscription: UserSubscription | null;
  currentProjectCount?: number;
}

export default function SubscriptionStatus({ subscription, currentProjectCount = 0 }: SubscriptionStatusProps) {
  if (!subscription || subscription.status !== 'active') {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="font-medium text-yellow-900">No Active Subscription</p>
              </div>
              <p className="text-sm text-yellow-700">
                Subscribe to a plan to start listing projects and accessing premium features.
              </p>
            </div>
            <Link href="/subscriptions">
              <Button size="sm">View Plans</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const limits = getFeatureLimits(subscription);
  const maxProjects = limits.maxProjects === 'unlimited' ? 'Unlimited' : limits.maxProjects;
  const projectsRemaining = limits.maxProjects === 'unlimited' 
    ? 'Unlimited' 
    : Math.max(0, limits.maxProjects - currentProjectCount);
  
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <Card className={isExpiringSoon ? 'border-yellow-200 bg-yellow-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Badge className="capitalize mr-2">{subscription.tier} Plan</Badge>
              {isExpiringSoon && (
                <Badge variant="outline" className="border-yellow-600 text-yellow-800">
                  Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Projects</p>
                <p className="font-medium text-gray-900">
                  {currentProjectCount} / {maxProjects}
                </p>
                {limits.maxProjects !== 'unlimited' && (
                  <p className="text-xs text-gray-500">{projectsRemaining} remaining</p>
                )}
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Expires</span>
                </div>
                <p className="font-medium text-gray-900">
                  {endDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <Link href="/subscriptions/manage">
            <Button variant="outline" size="sm">Manage</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
