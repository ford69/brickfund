'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  ArrowLeft,
  ShoppingCart,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiClient, MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

export default function MarketplaceItemDetails() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const itemId = params.id as string;
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'owner') {
      if (user.role === 'investor') {
        router.push('/dashboard');
        toast({
          title: 'Access Denied',
          description: 'Marketplace is only available for real estate companies',
          variant: 'destructive',
        });
      } else {
        router.push('/dashboard');
      }
      return;
    }
    if (itemId) {
      fetchItem();
    }
  }, [user, isAuthenticated, router, itemId]);

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplaceItem(itemId);
      if (response.success && response.data) {
        if (!response.data.isActive) {
          toast({
            title: 'Item Unavailable',
            description: 'This item is not currently available',
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }
        setItem(response.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load item details';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      router.push('/marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) {
      router.push('/signin?redirect=/marketplace/' + itemId);
      return;
    }

    if (user.role !== 'owner') {
      toast({
        title: 'Access Denied',
        description: 'Marketplace is only available for real estate companies',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsPurchasing(true);
      const response = await apiClient.initializeMarketplacePurchase(itemId);

      if (response.success && response.data) {
        const authorizationUrl =
          response.data.authorization_url || response.data.authorizationUrl;

        if (!authorizationUrl) {
          throw new Error('No authorization URL received from payment initialization');
        }

        window.location.href = authorizationUrl;
      } else {
        throw new Error(response.message || 'Failed to initialize purchase');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      toast({
        title: 'Purchase Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsPurchasing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="p-10 max-w-md border-0 shadow-xl bg-white rounded-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Please sign in as a real estate company to view item details.
              </p>
              <Link href="/signin">
                <Button className="bg-primary hover:opacity-90 text-white rounded-xl px-6 h-11 font-medium shadow-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="p-10 max-w-md border-0 shadow-xl bg-white rounded-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-6">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Item Not Found</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The item you&apos;re looking for doesn&apos;t exist or is no longer available.
              </p>
              <Link href="/marketplace">
                <Button className="bg-primary hover:opacity-90 text-white rounded-xl px-6 h-11 font-medium shadow-sm">
                  Back to Marketplace
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <Link
          href="/marketplace"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Image */}
          <Card className="overflow-hidden border-0 shadow-sm rounded-2xl aspect-square lg:aspect-auto lg:min-h-[480px]">
            {getMarketplaceItemImageUrl(item) ? (
              <img
                src={getMarketplaceItemImageUrl(item)!}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[320px] flex items-center justify-center bg-muted">
                <Store className="h-24 w-24 text-slate-300" />
              </div>
            )}
          </Card>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-muted text-foreground border-0 font-medium rounded-lg px-3 py-1">
                {item.category}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              {item.name}
            </h1>
            <p className="text-3xl font-bold text-foreground mb-6">
              {formatCurrency(item.price, item.currency)}
            </p>

            <Card className="border-0 shadow-sm rounded-2xl mb-6 flex-1">
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Description
                </h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || !item.isActive}
                className="flex-1 h-12 rounded-xl bg-primary hover:opacity-90 text-white font-medium shadow-sm"
                size="lg"
              >
                {isPurchasing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
              <Link href="/marketplace/purchases">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-border hover:bg-accent"
                >
                  View Purchases
                </Button>
              </Link>
            </div>

            {!item.isActive && (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-amber-800">
                  This item is currently unavailable for purchase.
                </p>
              </div>
            )}

            {item.isActive && (
              <div className="mt-6 flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Available — secure checkout via Paystack</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
