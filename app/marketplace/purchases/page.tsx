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
  Package,
  Truck,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { apiClient, MarketplacePurchase, type OrderStatus } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

export default function PurchaseHistory() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!user) {
      router.push('/signin?redirect=/marketplace/purchases');
      return;
    }

    // Allow owners and customers to view marketplace order history.
    if (user.role === 'owner' || user.role === 'customer') {
      fetchPurchases();
      return;
    }

    // Investors and admins are redirected away from marketplace orders.
    router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    toast({
      title: 'Access Denied',
      description: 'Marketplace orders are only available for marketplace customers and business accounts.',
      variant: 'destructive',
    });
  }, [user, isAuthenticated, router]);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplacePurchases();
      if (response.success && response.data) {
        setPurchases(response.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load order history';
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayStatus = (p: MarketplacePurchase): OrderStatus | string => {
    if (p.orderStatus) return p.orderStatus;
    if (p.status === 'completed') return 'delivered';
    return p.status;
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    const badges: Record<string, { label: string; className: string; icon: typeof Clock }> = {
      pending: { label: 'Order received', className: 'bg-amber-50 text-amber-700 border-0', icon: Clock },
      paid: { label: 'Quote shared', className: 'bg-blue-50 text-blue-700 border-0', icon: CheckCircle },
      processing: { label: 'Confirmed', className: 'bg-slate-100 text-slate-700 border-0', icon: Package },
      shipped: { label: 'Preparing delivery', className: 'bg-indigo-50 text-indigo-700 border-0', icon: Truck },
      out_for_delivery: { label: 'Out for delivery', className: 'bg-indigo-50 text-indigo-700 border-0', icon: Truck },
      delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-0', icon: CheckCircle },
      completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-0', icon: CheckCircle },
      failed: { label: 'Failed', className: 'bg-red-50 text-red-700 border-0', icon: XCircle },
      cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-0', icon: XCircle },
    };
    const config = badges[s] || { label: status, className: 'rounded-lg', icon: Clock };
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} font-medium rounded-lg gap-1`}>
        <Icon className="h-3.5 w-3" />
        {config.label}
      </Badge>
    );
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
                Please sign in as a real estate company to view order history.
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
                My Orders
              </h1>
              <p className="text-muted-foreground mt-0.5">Track status, delivery date, and view order details</p>
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
              My Orders
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {purchases.length === 0 && !isLoading
                ? 'Your order requests will appear here.'
                : `${purchases.length} order${purchases.length === 1 ? '' : 's'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Loading orders...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-1">No orders yet</p>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  When you place an order request from the marketplace, it will show up here.
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
                        Order
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Item(s)
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Amount
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
                        Est. delivery
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
                        Timeline
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden xl:table-cell">
                        Site
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                        Tracking
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                       
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {purchases.map((purchase) => {
                      const item =
                        purchase.item ||
                        (typeof purchase.itemId === 'object' ? purchase.itemId : null);
                      const itemName =
                        item && typeof item === 'object' ? item.name : 'Order items';
                      const orderLabel = purchase.items?.length
                        ? `${purchase.items.length} item(s)`
                        : itemName;

                      return (
                        <tr
                          key={purchase._id}
                          className="bg-card hover:bg-background/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                            #{purchase._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground">{orderLabel}</td>
                          <td className="px-6 py-4 text-foreground font-medium">
                            {formatCurrency(purchase.amount, purchase.currency)}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(displayStatus(purchase))}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm hidden lg:table-cell">
                            {purchase.estimatedDeliveryAt
                              ? formatDate(purchase.estimatedDeliveryAt)
                              : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm hidden lg:table-cell">
                            <span className="text-muted-foreground capitalize">
                              {(purchase.timeline || '—') as string}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm hidden xl:table-cell">
                            <span className="text-muted-foreground line-clamp-1">
                              {purchase.deliveryAddress || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm hidden md:table-cell">
                            {purchase.trackingNumber ? (
                              <span className="font-mono text-foreground">{purchase.trackingNumber}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/marketplace/orders/${purchase._id}`}>
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                Track <ChevronRight className="h-4 w-4 ml-0.5" />
                              </Button>
                            </Link>
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
