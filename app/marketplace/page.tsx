'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Store,
  Search,
  ShoppingCart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Truck,
  Award,
} from 'lucide-react';
import { apiClient, MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const CATEGORY_LABELS: Record<string, string> = {
  cement: 'Cement',
  steel: 'Steel & Iron Rods',
  blocks: 'Blocks & Bricks',
  wood: 'Timber & Wood',
  roofing: 'Roofing Materials',
  finishing: 'Finishing Materials',
  tools: 'Tools & Equipment',
  other: 'Other Building Materials',
};

const ALL_CATEGORY_KEYS = ['cement', 'steel', 'blocks', 'wood', 'roofing', 'finishing', 'tools', 'other'];

export default function MarketplaceHome() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterSectionOpen, setFilterSectionOpen] = useState(true);
  const [categorySectionOpen, setCategorySectionOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      router.push('/admin');
      return;
    }
    fetchItems();
  }, [user, isAuthenticated, router]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getActiveMarketplaceItems();
      if (response.success && response.data) {
        setItems(response.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load marketplace items';
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

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((item as any).tags && Array.isArray((item as any).tags) &&
        (item as any).tags.some((t: string) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoriesWithCount = ALL_CATEGORY_KEYS.map((key) => ({
    key,
    label: CATEGORY_LABELS[key] || key,
    count: items.filter((i) => i.category === key).length,
  }));

  const handleAddToCart = (e: React.MouseEvent, item: MarketplaceItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.isActive) {
      toast({ title: 'Unavailable', description: 'This item is not available.', variant: 'destructive' });
      return;
    }
    addItem({
      itemId: item._id,
      name: item.name,
      price: item.price,
      currency: item.currency,
      image: getMarketplaceItemImageUrl(item),
      unitLabel: (item as any).unitLabel,
      fulfillmentTier: (item as any).fulfillmentTier as 'small' | 'medium' | 'large' | undefined,
      quantity: 1,
    });
    toast({ title: 'Added to cart', description: `${item.name} added to your cart.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Hero / welcome */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
          <div className="relative px-6 py-10 sm:px-10 sm:py-14">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-wider text-primary mb-2">BrickFund Marketplace</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Building materials &amp; supplies for your projects
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                Quality cement, steel, timber, roofing, and more. Add to cart and pay securely with Paystack.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" />
                Reliable supply
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                Trusted by builders
              </span>
            </div>
          </div>
        </div>

        {/* Shop by category - quick filters */}
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Shop by category</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            {ALL_CATEGORY_KEYS.map((key) => {
              const count = items.filter((i) => i.category === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoryFilter(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    categoryFilter === key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {CATEGORY_LABELS[key]} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left sidebar - filters */}
          <aside className="lg:w-64 shrink-0 border border-border rounded-xl bg-card overflow-hidden">
            <div className="p-4 space-y-4">
              <button
                type="button"
                className="flex items-center justify-between w-full font-semibold text-foreground lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                Filter
                {sidebarOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <div className={sidebarOpen ? '' : 'hidden lg:block'}>
                <div>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
                      onClick={() => setFilterSectionOpen(!filterSectionOpen)}
                    >
                      Search
                      {filterSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {filterSectionOpen && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-10 rounded-lg border-border bg-background"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
                      onClick={() => setCategorySectionOpen(!categorySectionOpen)}
                    >
                      Filter by Category
                      {categorySectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {categorySectionOpen && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        <label className="flex items-center gap-2 cursor-pointer py-1.5 rounded-md hover:bg-muted/50 px-2">
                          <Checkbox
                            checked={categoryFilter === 'all'}
                            onCheckedChange={() => setCategoryFilter('all')}
                          />
                          <span className="text-sm">All categories</span>
                        </label>
                        {categoriesWithCount.map(({ key, label, count }) => (
                          <label
                            key={key}
                            className="flex items-center gap-2 cursor-pointer py-1.5 rounded-md hover:bg-muted/50 px-2"
                          >
                            <Checkbox
                              checked={categoryFilter === key}
                              onCheckedChange={() => setCategoryFilter(key)}
                            />
                            <span className="text-sm">{label}</span>
                            {count > 0 && (
                              <span className="text-xs text-muted-foreground ml-auto">({count})</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </aside>

          {/* Main: product grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Loading products...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardContent className="p-14 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-5">
                    <Store className="h-8 w-8" />
                  </div>
                  <p className="text-foreground font-semibold text-lg">No products in this category yet</p>
                  <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                    Try &quot;All categories&quot; or a different filter. New items are added regularly.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-xl"
                    onClick={() => { setCategoryFilter('all'); setSearchQuery(''); }}
                  >
                    Show all products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card
                      key={item._id}
                      className="group overflow-hidden border border-border bg-card flex flex-col rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                      <Link href={`/marketplace/${item._id}`} className="flex flex-1 flex-col">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {getMarketplaceItemImageUrl(item) ? (
                            <img
                              src={getMarketplaceItemImageUrl(item)!}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Store className="h-14 w-14 text-muted-foreground/60" />
                            </div>
                          )}
                          <Badge className="absolute top-3 right-3 bg-background/95 text-foreground border-0 shadow-md font-medium rounded-lg text-xs capitalize px-2.5 py-1">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </Badge>
                          {item.isActive && (
                            <span className="absolute bottom-3 left-3 text-xs font-medium text-emerald-700 bg-emerald-100/95 px-2.5 py-1 rounded-full">
                              In stock
                            </span>
                          )}
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-base">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="mt-auto">
                            <p className="text-xl font-bold text-foreground">
                              {formatCurrency(item.price, item.currency)}
                              {(item as any).unitLabel && (
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                  {((item as any).unitLabel as string).toLowerCase().startsWith('per ') ? '' : 'per '}
                                  {(item as any).unitLabel}
                                </span>
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Link>
                      <div className="p-5 pt-0">
                        <Button
                          onClick={(e) => handleAddToCart(e, item)}
                          disabled={!item.isActive}
                          className="w-full rounded-xl h-11 bg-primary hover:opacity-90 text-primary-foreground font-medium shadow-sm"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-border flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Secure checkout with Paystack
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    Reliable delivery
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Trusted by professionals
                  </span>
                </div>
              </>
            )}
          </main>
        </div>

        {isAuthenticated && (
          <div className="mt-8 flex justify-end">
            <Link href="/marketplace/purchases">
              <Button variant="outline" className="rounded-lg">
                My Purchases
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
