'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar, Clock3, MapPin, RefreshCw, ShoppingCart, Store, Truck } from 'lucide-react';
import { apiClient, MarketplacePurchase, type OrderStatus } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type FilterStatus = 'all' | OrderStatus;
type TimelineFilter = 'all' | 'urgent' | 'flexible';
type StageFilter = 'all' | PipelineStage;
type PipelineStage =
  | 'new_request'
  | 'reviewing'
  | 'quote_sent'
  | 'negotiation'
  | 'confirmed'
  | 'fulfilled'
  | 'completed'
  | 'cancelled'
  | 'failed';

export default function AdminMarketplaceOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<MarketplacePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterStage, setFilterStage] = useState<StageFilter>('all');
  const [filterTimeline, setFilterTimeline] = useState<TimelineFilter>('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterProductType, setFilterProductType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteTargetOrder, setQuoteTargetOrder] = useState<MarketplacePurchase | null>(null);
  const [quickViewOrder, setQuickViewOrder] = useState<MarketplacePurchase | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDeliveryWindow, setQuoteDeliveryWindow] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [assignedToById, setAssignedToById] = useState<Record<string, string>>({});

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

  const getPipelineStage = (order: MarketplacePurchase): PipelineStage => {
    const status = (order.orderStatus || order.status || 'pending') as string;
    if (status === 'cancelled') return 'cancelled';
    if (status === 'failed') return 'failed';
    if (status === 'delivered' || order.status === 'completed') return 'completed';
    if (status === 'out_for_delivery') return 'fulfilled';
    if (status === 'shipped') return 'negotiation';
    if (status === 'paid') return 'quote_sent';
    if (status === 'processing') return 'confirmed';
    if (status === 'pending' && order.quoteAmount !== undefined) return 'reviewing';
    return 'new_request';
  };

  const stageLabel: Record<PipelineStage, string> = {
    new_request: 'New Request',
    reviewing: 'Reviewing',
    quote_sent: 'Quote Sent',
    negotiation: 'Negotiation',
    confirmed: 'Confirmed',
    fulfilled: 'Fulfilled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };

  const stageBadgeClass: Record<PipelineStage, string> = {
    new_request: 'bg-slate-100 text-slate-700 border-slate-200',
    reviewing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    quote_sent: 'bg-blue-100 text-blue-700 border-blue-200',
    negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-purple-100 text-purple-700 border-purple-200',
    fulfilled: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };

  const getQuantity = (order: MarketplacePurchase) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, line) => sum + (line.quantity || 0), 0);
    }
    return 1;
  };

  const getProductName = (order: MarketplacePurchase) =>
    (order.item && typeof order.item === 'object' ? (order.item as any).name : '') || 'Marketplace item';

  const getOrderType = (order: MarketplacePurchase) => {
    const text = (order.notes || '').toLowerCase();
    if (text.includes('order type: recurring')) return 'Recurring';
    return 'One-time';
  };

  const getPriority = (order: MarketplacePurchase) => {
    if (order.timeline === 'urgent') return 'Urgent';
    return 'Flexible';
  };

  const getAmountLabel = (order: MarketplacePurchase) => {
    if (order.quoteAmount !== undefined) {
      return formatCurrency(order.quoteAmount, order.quoteCurrency || order.currency);
    }
    const est = order.item?.price && order.item.price > 0 ? order.item.price * getQuantity(order) : 0;
    if (est > 0) return `Est: ${formatCurrency(est, order.currency)}`;
    return 'Pending quote';
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

  const handleAssign = (orderId: string, assignee: string) => {
    setAssignedToById((prev) => ({ ...prev, [orderId]: assignee }));
  };

  const openQuoteDialog = (order: MarketplacePurchase) => {
    setQuoteTargetOrder(order);
    setQuoteAmount(order.quoteAmount !== undefined ? String(order.quoteAmount) : '');
    setQuoteDeliveryWindow(order.quoteDeliveryWindow || '');
    setQuoteMessage(order.quoteMessage || '');
    setSendViaWhatsApp(false);
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
        description: sendViaWhatsApp
          ? 'Quote sent via email. Follow up on WhatsApp from customer profile.'
          : 'Quote email has been sent to the customer and order status updated.',
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
    const status = (order.orderStatus || order.status) as string;
    const stage = getPipelineStage(order);
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (filterStage !== 'all' && stage !== filterStage) return false;
    if (filterTimeline !== 'all' && (order.timeline || 'flexible') !== filterTimeline) return false;
    if (filterLocation.trim() && !(order.deliveryAddress || '').toLowerCase().includes(filterLocation.toLowerCase())) return false;
    if (filterProductType.trim() && !getProductName(order).toLowerCase().includes(filterProductType.toLowerCase())) return false;
    if (filterStartDate && new Date(order.createdAt) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(order.createdAt) > new Date(`${filterEndDate}T23:59:59`)) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const idMatch = order._id.toLowerCase().includes(term);
    const refMatch = (order.paymentReference || '').toLowerCase().includes(term);
    const itemName = getProductName(order);
    const itemMatch = itemName.toLowerCase().includes(term);
    return idMatch || refMatch || itemMatch;
  });

  const renderActions = (order: MarketplacePurchase) => {
    const stage = getPipelineStage(order);
    if (stage === 'new_request') {
      return (
        <Button size="sm" variant="outline" onClick={() => handleStatusChange(order, 'processing')} disabled={updatingId === order._id}>
          Review Request
        </Button>
      );
    }
    if (stage === 'reviewing') {
      return (
        <Button size="sm" variant="outline" onClick={() => openQuoteDialog(order)} disabled={updatingId === order._id}>
          Create Quote
        </Button>
      );
    }
    if (stage === 'quote_sent') {
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openQuoteDialog(order)}>
            Resend Quote
          </Button>
          <Button size="sm" onClick={() => handleStatusChange(order, 'processing')} disabled={updatingId === order._id}>
            Mark Accepted
          </Button>
        </div>
      );
    }
    if (stage === 'confirmed') {
      return (
        <Button size="sm" onClick={() => handleStatusChange(order, 'out_for_delivery')} disabled={updatingId === order._id}>
          Mark Fulfilled
        </Button>
      );
    }
    if (stage === 'fulfilled') {
      return (
        <Button size="sm" onClick={() => handleStatusChange(order, 'delivered')} disabled={updatingId === order._id}>
          Complete
        </Button>
      );
    }
    return (
      <Button size="sm" variant="ghost" onClick={() => setQuickViewOrder(order)}>
        View
      </Button>
    );
  };

  const productTypes = useMemo(
    () => Array.from(new Set(orders.map((o) => getProductName(o)).filter(Boolean))),
    [orders]
  );

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
                  Status-driven order pipeline with contextual actions
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Track requests, quotes, and fulfillment.</CardDescription>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                <Input
                  placeholder="Search by order ID, reference, or item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 bg-background"
                />
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    setSearch('');
                    setFilterStatus('all');
                    setFilterStage('all');
                    setFilterTimeline('all');
                    setFilterLocation('');
                    setFilterProductType('');
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <Select value={filterStage} onValueChange={(v: StageFilter) => setFilterStage(v)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Pipeline stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stages</SelectItem>
                    <SelectItem value="new_request">New Request</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="quote_sent">Quote Sent</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTimeline} onValueChange={(v: TimelineFilter) => setFilterTimeline(v)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All timelines</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterProductType || 'all'}
                  onValueChange={(v) => setFilterProductType(v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All products</SelectItem>
                    {productTypes.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v: FilterStatus) => setFilterStatus(v)}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Backend status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  className="h-10 bg-background"
                  placeholder="Location / region"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                />
                <Input
                  className="h-10 bg-background"
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
                <Input
                  className="h-10 bg-background"
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
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
              <div className="overflow-x-auto max-h-[72vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quote</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[260px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const stage = getPipelineStage(order);
                      const isUrgent = getPriority(order) === 'Urgent';
                      return (
                        <TableRow
                          key={order._id}
                          className={isUrgent ? 'bg-red-50/40 hover:bg-red-50/60' : ''}
                          onClick={() => setQuickViewOrder(order)}
                        >
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
                            <span className="text-sm">Customer</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{getProductName(order)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{getQuantity(order)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 max-w-[180px]">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {order.deliveryAddress || 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={isUrgent ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}
                            >
                              {getPriority(order)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-lg">
                              {getOrderType(order)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`rounded-lg ${stageBadgeClass[stage]}`}>
                              {stageLabel[stage]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{getAmountLabel(order)}</span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={assignedToById[order._id] || 'unassigned'}
                              onValueChange={(v) => handleAssign(order._id, v)}
                            >
                              <SelectTrigger className="w-[130px]" onClick={(e) => e.stopPropagation()}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                <SelectItem value="clifford">Clifford</SelectItem>
                                <SelectItem value="operations">Operations</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateTime(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {renderActions(order)}
                              <Button size="sm" variant="ghost" onClick={() => setQuickViewOrder(order)}>
                                View
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
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sendViaWhatsApp} onChange={(e) => setSendViaWhatsApp(e.target.checked)} />
              Send via WhatsApp (manual follow-up)
            </label>
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
              {sendingQuote ? 'Sending...' : 'Send Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!quickViewOrder} onOpenChange={(open) => !open && setQuickViewOrder(null)}>
        <SheetContent side="right" className="w-[92vw] sm:max-w-2xl overflow-y-auto">
          {quickViewOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order #{quickViewOrder._id.slice(-8).toUpperCase()}</SheetTitle>
                <SheetDescription>Quick view with request details, quote actions, and activity timeline.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Request Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Product:</span> {getProductName(quickViewOrder)}</p>
                    <p><span className="text-muted-foreground">Quantity:</span> {getQuantity(quickViewOrder)}</p>
                    <p><span className="text-muted-foreground">Location:</span> {quickViewOrder.deliveryAddress || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Timeline:</span> {quickViewOrder.timeline || 'flexible'}</p>
                    <p><span className="text-muted-foreground">Type:</span> {getOrderType(quickViewOrder)}</p>
                    <p><span className="text-muted-foreground">Delivery:</span> {quickViewOrder.fulfillmentMethod || 'delivery'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Customer & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Customer:</span> Customer</p>
                    <p><span className="text-muted-foreground">Notes:</span> {quickViewOrder.notes || 'No notes provided.'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quote & Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm"><span className="text-muted-foreground">Quote:</span> {getAmountLabel(quickViewOrder)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => openQuoteDialog(quickViewOrder)}>Create / Edit Quote</Button>
                      <Button variant="outline" onClick={() => openQuoteDialog(quickViewOrder)}>Send Quote (Email + WhatsApp)</Button>
                      <Button variant="outline" disabled>View Quote PDF</Button>
                      <Button variant="outline" onClick={() => handleStatusChange(quickViewOrder, 'processing')}>Mark Accepted</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-muted-foreground" />[{formatDateTime(quickViewOrder.createdAt)}] Request created</div>
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-muted-foreground" />[{formatDateTime(quickViewOrder.updatedAt)}] Status: {stageLabel[getPipelineStage(quickViewOrder)]}</div>
                    {quickViewOrder.quotedAt && (
                      <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-muted-foreground" />[{formatDateTime(quickViewOrder.quotedAt)}] Quote sent</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

