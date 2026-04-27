'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Store,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Shield,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { apiClient, MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function AdminMarketplaceList() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MarketplaceItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchItems();
  }, [user, router]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplaceItems();
      if (response.success && response.data) {
        setItems(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load marketplace items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (item: MarketplaceItem) => {
    try {
      const response = await apiClient.toggleMarketplaceItemStatus(item._id, !item.isActive);
      if (response.success) {
        toast({
          title: 'Success',
          description: `Item ${!item.isActive ? 'activated' : 'deactivated'} successfully`,
        });
        fetchItems();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await apiClient.deleteMarketplaceItem(itemToDelete._id);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Item deleted successfully',
        });
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        fetchItems();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Marketplace Management</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Manage marketplace items</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-700">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/admin/marketplace/create">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Marketplace Items ({filteredItems.length})</CardTitle>
            <CardDescription>
              Manage all marketplace items available for purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600">No marketplace items found</p>
                <Link href="/admin/marketplace/create">
                  <Button className="mt-4 bg-blue-700 hover:bg-blue-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          {getMarketplaceItemImageUrl(item) ? (
                            <img
                              src={getMarketplaceItemImageUrl(item)!}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <Store className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">Quote on request</span>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const stock = (item as any).stock as number | undefined;
                            const lowStockThreshold = (item as any).lowStockThreshold as number | undefined;
                            if (typeof stock !== 'number') {
                              return <span className="text-sm text-gray-500">—</span>;
                            }
                            const threshold = typeof lowStockThreshold === 'number' ? lowStockThreshold : 5;
                            if (stock === 0) {
                              return (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                                  Out of stock
                                </span>
                              );
                            }
                            if (stock <= threshold) {
                              return (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                  Low stock ({stock})
                                </span>
                              );
                            }
                            return <span className="text-sm text-gray-900">{stock}</span>;
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge className={item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/marketplace/${item._id}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Store className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/admin/marketplace/edit/${item._id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(item)}
                              className={item.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete(item);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Marketplace Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
