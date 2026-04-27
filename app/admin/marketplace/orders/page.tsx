'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar, RefreshCw, ShoppingCart, Truck, Store } from 'lucide-react';
import { apiClient, MarketplacePurchase, type OrderStatus } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type FilterStatus = 'all' | OrderStatus;

export default function AdminMarketplaceOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<MarketplacePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteTargetOrder, setQuoteTargetOrder] = useState<MarketplacePurchase | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDeliveryWindow, setQuoteDeliveryWindow] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAdminMarketplaceOrders(
        filterStatus === 'all' ? undefined : { status: filterStatus }
      );
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load orders';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (order: MarketplacePurchase, status: OrderStatus) => {
    try {
      setUpdatingId(order._id);
      const payload: Parameters<typeof apiClient.updateMarketplaceOrderStatus>[1] = {
        orderStatus: status,
      };
      // If marking as delivered, set deliveredAt timestamp if backend supports it
      if (status === 'delivered') {
        payload.deliveredAt = new Date().toISOString();
      }
      const response = await apiClient.updateMarketplaceOrderStatus(order._id, payload);
      if (response.success && response.data) {
        toast({
          title: 'Order updated',
          description: `Status set to ${status}`,
        });
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? { ...o, ...response.data } : o))
        );
      } else {
        throw new Error((response as any).message || 'Failed to update order');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update order status';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openQuoteDialog = (order: MarketplacePurchase) => {
    setQuoteTargetOrder(order);
    setQuoteAmount(order.quoteAmount !== undefined ? String(order.quoteAmount) : '');
    setQuoteDeliveryWindow(order.quoteDeliveryWindow || '');
    setQuoteMessage(order.quoteMessage || '');
    setQuoteDialogOpen(true);
  };

  const handleSendQuote = async () => {
    if (!quoteTargetOrder) return;
    const parsedAmount = Number(quoteAmount);
    if (!quoteAmount || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast({
        title: 'Invalid quote amount',
        description: 'Please enter a valid non-negative quote amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingQuote(true);
      const response = await apiClient.updateMarketplaceOrderStatus(quoteTargetOrder._id, {
        orderStatus: 'paid',
        quoteAmount: parsedAmount,
        quoteCurrency: quoteTargetOrder.currency || 'GHS',
        quoteDeliveryWindow: quoteDeliveryWindow.trim() || undefined,
        quoteMessage: quoteMessage.trim() || undefined,
        sendQuoteEmail: true,
      });

      if (!response.success || !response.data) {
        throw new Error((response as any).message || 'Failed to send quote');
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === quoteTargetOrder._id ? { ...o, ...response.data } : o))
      );
      setQuoteDialogOpen(false);
      setQuoteTargetOrder(null);
      toast({
        title: 'Quote sent',
        description: 'Quote email has been sent to the customer and order status updated.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send quote';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSendingQuote(false);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'all') {
      const status = (order.orderStatus || order.status) as string;
      if (status !== filterStatus) return false;
    }
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const idMatch = order._id.toLowerCase().includes(term);
    const refMatch = (order.paymentReference || '').toLowerCase().includes(term);
    const itemName =
      order.item && typeof order.item === 'object' ? (order.item as any).name || '' : '';
    const itemMatch = itemName.toLowerCase().includes(term);
    return idMatch || refMatch || itemMatch;
  });

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    const labels: Record<string, string> = {
      pending: 'New request',
      paid: 'Quote shared',
      processing: 'Confirmed',
      shipped: 'Preparing dispatch',
      out_for_delivery: 'Out for delivery',
      delivered: 'Delivered',
      failed: 'Failed',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };
    return labels[s] || status;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" className="px-2">
                  <Store className="h-5 w-5 mr-1" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                  Marketplace Orders
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Review order requests and send quote-stage updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Manage request flow from new order through quote, confirmation, and fulfillment
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Input
                placeholder="Search by order ID, reference, or item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select
                value={filterStatus}
                onValueChange={(v: FilterStatus) => {
                  setFilterStatus(v);
                  // Refetch with new filter
                  fetchOrders();
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">New request</SelectItem>
                  <SelectItem value="paid">Quote shared</SelectItem>
                  <SelectItem value="processing">Confirmed</SelectItem>
                  <SelectItem value="shipped">Preparing dispatch</SelectItem>
                  <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground text-sm">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Fulfillment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-[180px]">Update status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const status = (order.orderStatus || order.status) as string;
                      const fulfillmentLabel =
                        order.fulfillmentMethod === 'pickup'
                          ? 'Pickup'
                          : order.deliveryZoneName || 'Delivery';
                      return (
                        <TableRow key={order._id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                #{order._id.slice(-8).toUpperCase()}
                              </span>
                              {order.paymentReference && (
                                <span className="text-xs text-muted-foreground font-mono">
                                  Ref: {order.paymentReference}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              <span className="text-foreground">Customer</span>
                              {/* Backend can later populate customer name/email */}
                              {order.deliveryAddress && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {order.deliveryAddress}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              {order.fulfillmentMethod === 'pickup' ? (
                                <Store className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Truck className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{fulfillmentLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {formatCurrency(order.amount, order.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-lg">
                              {getStatusLabel(status)}
                            </Badge>
                            {order.quoteAmount !== undefined && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Quote: {formatCurrency(order.quoteAmount, order.quoteCurrency || order.currency)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateTime(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateTime(order.updatedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <Select
                                value={status}
                                onValueChange={(value: OrderStatus) => handleStatusChange(order, value)}
                                disabled={updatingId === order._id}
                              >
                                <SelectTrigger className="w-[170px] text-xs">
                                  <SelectValue placeholder="Set status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">New request</SelectItem>
                                  <SelectItem value="paid">Quote shared</SelectItem>
                                  <SelectItem value="processing">Confirmed</SelectItem>
                                  <SelectItem value="shipped">Preparing dispatch</SelectItem>
                                  <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => openQuoteDialog(order)}
                                disabled={updatingId === order._id}
                              >
                                Send Quote Email
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Quote to Customer</DialogTitle>
            <DialogDescription>
              Share quote details and notify the customer by email for order{' '}
              {quoteTargetOrder ? `#${quoteTargetOrder._id.slice(-8).toUpperCase()}` : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="quote-amount">Quote amount ({quoteTargetOrder?.currency || 'GHS'})</Label>
              <Input
                id="quote-amount"
                type="number"
                min="0"
                step="0.01"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-window">Delivery window (optional)</Label>
              <Input
                id="quote-window"
                value={quoteDeliveryWindow}
                onChange={(e) => setQuoteDeliveryWindow(e.target.value)}
                placeholder="e.g. 2-3 business days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-message">Message to customer (optional)</Label>
              <Textarea
                id="quote-message"
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                placeholder="Include availability, delivery notes, and next steps."
                className="min-h-[110px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuoteDialogOpen(false)}
              disabled={sendingQuote}
            >
              Cancel
            </Button>
            <Button onClick={handleSendQuote} disabled={sendingQuote}>
              {sendingQuote ? 'Sending...' : 'Send Quote Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

