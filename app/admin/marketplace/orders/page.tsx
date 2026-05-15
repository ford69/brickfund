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
import {
  Calendar,
  ChevronRight,
  Clock3,
  MapPin,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  apiClient,
  MarketplacePurchase,
  type OrderStatus,
  getAdminPipelineStage,
  getAdminNextStatus,
  getAdminNextStatusButtonLabel,
  ADMIN_PIPELINE_LABELS,
  normalizeOrderStatus,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type FilterStatus = 'all' | OrderStatus;
type TimelineFilter = 'all' | 'urgent' | 'flexible';
import type { AdminPipelineStage } from '@/lib/orderStatus';

type StageFilter = 'all' | AdminPipelineStage;

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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const getPipelineStage = (order: MarketplacePurchase) =>
    getAdminPipelineStage(order.orderStatus || order.status, order.quoteAmount !== undefined);

  const stageLabel = ADMIN_PIPELINE_LABELS;

  const stageBadgeClass: Record<AdminPipelineStage, string> = {
    new_request: 'bg-slate-100 text-slate-700 border-slate-200',
    quote_sent: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-purple-100 text-purple-700 border-purple-200',
    processing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dispatching: 'bg-amber-100 text-amber-700 border-amber-200',
    delivering: 'bg-cyan-100 text-cyan-700 border-cyan-200',
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
        orderStatus: 'quote_shared',
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
    if (filterStatus !== 'all') {
      const matchesRaw = status === filterStatus;
      const matchesNormalized =
        normalizeOrderStatus(status) === normalizeOrderStatus(filterStatus);
      if (!matchesRaw && !matchesNormalized) return false;
    }
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

  const getPrimaryAction = (order: MarketplacePurchase) => {
    const stage = getPipelineStage(order);
    const currentStatus = normalizeOrderStatus(order.orderStatus || order.status);
    const nextStatus = getAdminNextStatus(currentStatus);
    const nextLabel = getAdminNextStatusButtonLabel(currentStatus);

    if (stage === 'new_request') {
      return { label: 'Share quote', onClick: () => openQuoteDialog(order) };
    }
    if (nextStatus && nextLabel) {
      return { label: nextLabel, onClick: () => handleStatusChange(order, nextStatus) };
    }
    return { label: 'View details', onClick: () => setQuickViewOrder(order) };
  };

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterStage('all');
    setFilterTimeline('all');
    setFilterLocation('');
    setFilterProductType('');
    setFilterStartDate('');
    setFilterEndDate('');
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

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1600px] mx-auto">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-5 pb-4 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Orders</CardTitle>
                <CardDescription className="mt-1">
                  {isLoading
                    ? 'Loading…'
                    : `${filteredOrders.length} of ${orders.length} order${orders.length === 1 ? '' : 's'}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFiltersOpen((o) => !o)}>
                  {filtersOpen ? 'Hide filters' : 'Filters'}
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search order ID, reference, or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-10 bg-background"
              />
            </div>
            {filtersOpen && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Filter orders</p>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Stage</Label>
                    <Select value={filterStage} onValueChange={(v: StageFilter) => setFilterStage(v)}>
                      <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All stages" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All stages</SelectItem>
                        <SelectItem value="new_request">New request</SelectItem>
                        <SelectItem value="quote_sent">Quote shared</SelectItem>
                        <SelectItem value="confirmed">Order confirmation</SelectItem>
                        <SelectItem value="processing">Order processing</SelectItem>
                        <SelectItem value="dispatching">Order dispatching</SelectItem>
                        <SelectItem value="delivering">Delivering</SelectItem>
                        <SelectItem value="completed">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Timeline</Label>
                    <Select value={filterTimeline} onValueChange={(v: TimelineFilter) => setFilterTimeline(v)}>
                      <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All timelines" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All timelines</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select value={filterStatus} onValueChange={(v: FilterStatus) => setFilterStatus(v)}>
                      <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="quote_shared">Quote shared</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="dispatching">Dispatching</SelectItem>
                        <SelectItem value="out_for_delivery">Delivering</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <Label className="text-xs text-muted-foreground">Product</Label>
                    <Select value={filterProductType || 'all'} onValueChange={(v) => setFilterProductType(v === 'all' ? '' : v)}>
                      <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="All products" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All products</SelectItem>
                        {productTypes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <Input className="h-10 bg-background" placeholder="City or region" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input className="h-10 bg-background" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input className="h-10 bg-background" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground text-sm">Loading orders…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm text-center">No orders match your search or filters.</p>
                <Button variant="link" size="sm" className="mt-2" onClick={clearFilters}>Clear filters</Button>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="py-4 pl-6 font-medium text-muted-foreground">Order</TableHead>
                        <TableHead className="py-4 font-medium text-muted-foreground">Product</TableHead>
                        <TableHead className="py-4 font-medium text-muted-foreground">Delivery</TableHead>
                        <TableHead className="py-4 font-medium text-muted-foreground">Status</TableHead>
                        <TableHead className="py-4 font-medium text-muted-foreground">Quote</TableHead>
                        <TableHead className="py-4 pr-6 text-right font-medium text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const stage = getPipelineStage(order);
                        const isUrgent = getPriority(order) === 'Urgent';
                        const primary = getPrimaryAction(order);
                        return (
                          <TableRow
                            key={order._id}
                            className={`cursor-pointer border-b border-border/50 ${isUrgent ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-muted/40'}`}
                            onClick={() => setQuickViewOrder(order)}
                          >
                            <TableCell className="py-5 pl-6 align-top">
                              <p className="font-semibold text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatShortDate(order.createdAt)}</p>
                            </TableCell>
                            <TableCell className="py-5 align-top max-w-[200px]">
                              <p className="font-medium text-sm line-clamp-2">{getProductName(order)}</p>
                              <p className="text-xs text-muted-foreground mt-1">Qty {getQuantity(order)}</p>
                            </TableCell>
                            <TableCell className="py-5 align-top max-w-[220px]">
                              <p className="text-sm line-clamp-2 leading-relaxed">{order.deliveryAddress || '—'}</p>
                              <Badge variant="outline" className={`mt-2 text-xs ${isUrgent ? 'bg-red-50 text-red-700 border-red-200' : 'bg-muted/50'}`}>{getPriority(order)}</Badge>
                            </TableCell>
                            <TableCell className="py-5 align-top">
                              <Badge variant="outline" className={`${stageBadgeClass[stage]} whitespace-nowrap`}>{stageLabel[stage]}</Badge>
                            </TableCell>
                            <TableCell className="py-5 align-top">
                              <p className="text-sm font-medium">{getAmountLabel(order)}</p>
                            </TableCell>
                            <TableCell className="py-5 pr-6 align-top text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button size="sm" className="h-9" onClick={() => primary.onClick()} disabled={updatingId === order._id}>
                                  {updatingId === order._id ? 'Updating…' : primary.label}
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-9 w-9"><MoreHorizontal className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => setQuickViewOrder(order)}>View details</DropdownMenuItem>
                                    {(stage === 'new_request' || stage === 'quote_sent') && (
                                      <DropdownMenuItem onClick={() => openQuoteDialog(order)}>{stage === 'quote_sent' ? 'Resend quote' : 'Share quote'}</DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleStatusChange(order, 'cancelled')}>Cancel order</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="lg:hidden divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const stage = getPipelineStage(order);
                    const isUrgent = getPriority(order) === 'Urgent';
                    const primary = getPrimaryAction(order);
                    return (
                      <div key={order._id} className={`p-5 space-y-4 ${isUrgent ? 'bg-red-50/30' : ''}`} onClick={() => setQuickViewOrder(order)}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatShortDate(order.createdAt)}</p>
                          </div>
                          <Badge variant="outline" className={stageBadgeClass[stage]}>{stageLabel[stage]}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2"><Package className="h-4 w-4 text-muted-foreground shrink-0" /><span className="line-clamp-2">{getProductName(order)} · Qty {getQuantity(order)}</span></div>
                          {order.deliveryAddress && <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /><span className="text-muted-foreground line-clamp-2">{order.deliveryAddress}</span></div>}
                          <p className="font-medium">{getAmountLabel(order)}</p>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" className="flex-1 h-10" onClick={() => primary.onClick()} disabled={updatingId === order._id}>{primary.label}</Button>
                          <Button size="sm" variant="outline" className="h-10 px-3" onClick={() => setQuickViewOrder(order)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
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
                      {(getPipelineStage(quickViewOrder) === 'new_request' ||
                        getPipelineStage(quickViewOrder) === 'quote_sent') && (
                        <Button variant="outline" onClick={() => openQuoteDialog(quickViewOrder)}>
                          {getPipelineStage(quickViewOrder) === 'quote_sent' ? 'Resend quote' : 'Share quote'}
                        </Button>
                      )}
                      {(() => {
                        const next = getAdminNextStatus(
                          normalizeOrderStatus(quickViewOrder.orderStatus || quickViewOrder.status)
                        );
                        const label = getAdminNextStatusButtonLabel(
                          normalizeOrderStatus(quickViewOrder.orderStatus || quickViewOrder.status)
                        );
                        return next && label ? (
                          <Button
                            onClick={() => handleStatusChange(quickViewOrder, next)}
                            disabled={updatingId === quickViewOrder._id}
                          >
                            {label}
                          </Button>
                        ) : null;
                      })()}
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

