'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Mail, Palette, Loader2 } from 'lucide-react';
import { apiClient, SubscriptionAddOn, Project } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddOnsPurchaseProps {
  projectId?: string;
  project?: Project;
  onPurchaseComplete?: () => void;
}

const ADD_ON_TYPES = {
  featured_boost: {
    name: 'Featured Boost',
    icon: Zap,
    price: 25,
    duration: 'week',
    description: 'High-visibility placement in Trending, Featured, and Top Investments sections.',
  },
  marketing_push: {
    name: 'Marketing Push',
    icon: Mail,
    price: 49,
    duration: 'campaign',
    description: 'Targeted promotion via email campaigns and investor dashboards.',
  },
  branding_customization: {
    name: 'Branding Customization',
    icon: Palette,
    price: 99,
    duration: 'one-time',
    description: 'Enhanced visual presentation with branded pages, banners, and custom templates.',
  },
};

export default function AddOnsPurchase({ projectId, project, onPurchaseComplete }: AddOnsPurchaseProps) {
  const router = useRouter();
  const [availableAddOns, setAvailableAddOns] = useState<SubscriptionAddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAddOn, setProcessingAddOn] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const response = await apiClient.getAvailableAddOns();
        if (response.success && response.data) {
          setAvailableAddOns(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch add-ons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddOns();
  }, []);

  const handlePurchase = async (addOnType: string) => {
    try {
      setProcessingAddOn(addOnType);
      const response = await apiClient.purchaseAddOn(addOnType, projectId);

      if (response.success) {
        if (response.data?.paymentUrl) {
          // Redirect to payment
          window.location.href = response.data.paymentUrl;
        } else {
          toast({
            title: 'Add-On Purchased!',
            description: 'Your add-on has been activated successfully.',
          });
          if (onPurchaseComplete) {
            onPurchaseComplete();
          }
        }
      } else {
        throw new Error(response.message || 'Failed to purchase add-on');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to purchase add-on',
        variant: 'destructive',
      });
    } finally {
      setProcessingAddOn(null);
    }
  };

  const getAddOnInfo = (type: string) => {
    return ADD_ON_TYPES[type as keyof typeof ADD_ON_TYPES] || {
      name: type.replace(/_/g, ' '),
      icon: Zap,
      price: 0,
      duration: '',
      description: '',
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Add-Ons</h3>
        {project && (
          <p className="text-sm text-gray-600 mb-4">
            Enhance visibility for: <span className="font-medium">{project.title}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {availableAddOns.map((addOn) => {
          const info = getAddOnInfo(addOn.type);
          const Icon = info.icon;
          const isProcessing = processingAddOn === addOn.type;

          return (
            <Card key={addOn._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge variant="outline">{info.duration}</Badge>
                </div>
                <CardTitle className="text-lg">{info.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    ${addOn.price}
                    {info.duration && (
                      <span className="text-sm text-gray-600 font-normal">/{info.duration}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{info.description}</p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handlePurchase(addOn.type)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
