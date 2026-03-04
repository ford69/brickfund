'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  ArrowLeft,
  RefreshCw,
  Store,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
} from 'lucide-react';
import { apiClient, MarketplacePurchase } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

export default function PurchaseHistory() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (isAuthenticated) {
      fetchPurchases();
    }
  }, [user, isAuthenticated, router]);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplacePurchases();
      if (response.success && response.data) {
        setPurchases(response.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load purchase history';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-0 font-medium rounded-lg gap-1">
            <CheckCircle className="h-3.5 w-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-0 font-medium rounded-lg gap-1">
            <Clock className="h-3.5 w-3" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-50 text-red-700 border-0 font-medium rounded-lg gap-1">
            <XCircle className="h-3.5 w-3" />
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-muted text-muted-foreground border-0 font-medium rounded-lg gap-1">
            <XCircle className="h-3.5 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge className="rounded-lg">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="p-10 max-w-md border-0 shadow-xl bg-card rounded-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Please sign in as a real estate company to view purchase history.
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card hover:bg-background transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Purchase History
              </h1>
              <p className="text-muted-foreground mt-0.5">All items you&apos;ve purchased from the marketplace</p>
            </div>
          </div>
          <Link href="/marketplace">
            <Button
              variant="outline"
              className="rounded-xl border-border hover:bg-background h-11"
            >
              <Store className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Purchases Card */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border bg-card px-6 py-5">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              My Purchases
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {purchases.length === 0 && !isLoading
                ? 'Your purchase history will appear here.'
                : `${purchases.length} purchase${purchases.length === 1 ? '' : 's'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Loading purchases...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-1">No purchases yet</p>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  When you buy from the marketplace, your orders will show up here.
                </p>
                <Link href="/marketplace">
                  <Button className="bg-primary hover:opacity-90 text-white rounded-xl px-6 h-11 font-medium shadow-sm">
                    <Store className="h-4 w-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Item
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Amount
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Date
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {purchases.map((purchase) => {
                      const item =
                        purchase.item ||
                        (typeof purchase.itemId === 'object' ? purchase.itemId : null);
                      const itemName =
                        item && typeof item === 'object' ? item.name : 'Unknown Item';

                      return (
                        <tr
                          key={purchase._id}
                          className="bg-card hover:bg-background/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">{itemName}</td>
                          <td className="px-6 py-4 text-foreground font-medium">
                            {formatCurrency(purchase.amount, purchase.currency)}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(purchase.status)}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">
                            {formatDate(purchase.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell font-mono">
                            {purchase.paymentReference || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
