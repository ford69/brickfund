'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  ExternalLink,
  Receipt,
  Store,
} from 'lucide-react';
import { apiClient, MarketplacePurchase, type OrderStatus } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const stepOrder: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

function getStepIndex(status: string): number {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'delivered' || s === 'out_for_delivery') return 4;
  const i = stepOrder.indexOf(s as OrderStatus);
  return i >= 0 ? Math.min(i, 4) : 0;
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const orderId = params.id as string;
  const [order, setOrder] = useState<MarketplacePurchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace(`/signin?redirect=${encodeURIComponent('/marketplace/orders/' + orderId)}`);
      return;
    }
    if (user.role !== 'customer' && user.role !== 'owner') {
      router.push('/marketplace');
      return;
    }
    if (orderId) fetchOrder();
  }, [isAuthenticated, user, router, orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplaceOrder(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setOrder(null);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Could not load order details.',
        variant: 'destructive',
      });
      setOrder(null);
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
      weekday: 'short',
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

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-6">Order not found or you don’t have access.</p>
          <Link href="/marketplace/purchases">
            <Button variant="outline" className="rounded-xl">Back to My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = (order.orderStatus || order.status) as string;
  const currentStepIndex = getStepIndex(currentStatus === 'completed' ? 'delivered' : currentStatus);
  const itemName = order.item && typeof order.item === 'object' ? order.item.name : 'Order items';
  const isPickup = order.fulfillmentMethod === 'pickup';
  const orderTimeline = order.timeline || ((order as any).deliveryTimeline as string | undefined);
  const orderNotes = order.notes || ((order as any).customerNotes as string | undefined);

  const steps: { key: OrderStatus; label: string; icon: typeof Package }[] = isPickup
    ? [
        { key: 'pending', label: 'Order request received', icon: Receipt },
        { key: 'paid', label: 'Quote shared (within 48 hours)', icon: CheckCircle2 },
        { key: 'processing', label: 'Order confirmed', icon: Package },
        { key: 'shipped', label: 'Ready for pickup', icon: Store },
        { key: 'delivered', label: 'Picked up', icon: CheckCircle2 },
      ]
    : [
        { key: 'pending', label: 'Order request received', icon: Receipt },
        { key: 'paid', label: 'Quote shared (within 48 hours)', icon: CheckCircle2 },
        { key: 'processing', label: 'Order confirmed', icon: Package },
        { key: 'shipped', label: 'Preparing dispatch', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
      ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/marketplace/purchases"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Orders
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {formatDateTime(order.createdAt)}{' '}
            <span className="inline-block text-xs">
              • Last updated {formatDateTime(order.updatedAt)}
            </span>
          </p>
        </div>

        {/* Status timeline */}
        <Card className="mb-8 border border-border rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Order progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative">
              {steps.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                          isDone ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[24px] mt-1 ${isDone ? 'bg-primary' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      {index === 0 && order.createdAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(order.createdAt)}
                        </p>
                      )}
                      {step.key === 'delivered' && order.deliveredAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(order.deliveredAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery / pickup & tracking */}
        <Card className="mb-8 border border-border rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {isPickup ? 'Pickup details' : 'Delivery & tracking'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {order.fulfillmentMethod && (
              <p className="text-sm">
                <span className="text-muted-foreground">Fulfillment:</span>{' '}
                {order.fulfillmentMethod === 'pickup' ? 'Pickup' : order.deliveryZoneName || 'Delivery'}
              </p>
            )}
            {order.deliveryAddress && (
              <p className="text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </p>
            )}
            {orderTimeline && (
              <p className="text-sm">
                <span className="text-muted-foreground">Requested timeline:</span>{' '}
                <span className="font-medium text-foreground capitalize">{orderTimeline}</span>
              </p>
            )}
            {orderNotes && (
              <p className="text-sm">
                <span className="text-muted-foreground">Notes:</span>{' '}
                <span className="text-foreground">{orderNotes}</span>
              </p>
            )}
            {order.estimatedDeliveryAt && (
              <p className="text-sm">
                <span className="text-muted-foreground">Estimated delivery:</span>{' '}
                <span className="font-medium text-foreground">{formatDate(order.estimatedDeliveryAt)}</span>
              </p>
            )}
            {order.deliveredAt && (
              <p className="text-sm">
                <span className="text-muted-foreground">Delivered:</span>{' '}
                <span className="font-medium text-foreground">{formatDateTime(order.deliveredAt)}</span>
              </p>
            )}
            {order.trackingNumber && (
              <p className="text-sm flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">Tracking:</span>
                <span className="font-mono font-medium">{order.trackingNumber}</span>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    Track <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </p>
            )}
            {!order.estimatedDeliveryAt && !order.deliveredAt && !order.trackingNumber && (
              <p className="text-sm text-muted-foreground">Delivery and tracking details will appear here once available.</p>
            )}
          </CardContent>
        </Card>

        {/* Order summary */}
        <Card className="border border-border rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground font-medium">{itemName}</p>
            <p className="text-lg font-bold text-foreground mt-2">
              {formatCurrency(order.amount, order.currency)}
            </p>
            {order.paymentReference && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">Ref: {order.paymentReference}</p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Link href="/marketplace/purchases">
            <Button variant="outline" className="rounded-xl">View all orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
