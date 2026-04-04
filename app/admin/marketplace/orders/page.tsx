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
      pending: 'Pending payment',
      paid: 'Payment confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
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
                  Review and update customer order statuses
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
                Manage order status from order placed through delivery or pickup
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
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
                            <Select
                              value={status}
                              onValueChange={(value: OrderStatus) => handleStatusChange(order, value)}
                              disabled={updatingId === order._id}
                            >
                              <SelectTrigger className="w-[170px] text-xs">
                                <SelectValue placeholder="Set status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending payment</SelectItem>
                                <SelectItem value="paid">Payment confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
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
    </div>
  );
}

