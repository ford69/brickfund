'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Store,
  Search,
  ShoppingCart,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from 'lucide-react';
import { apiClient, MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const HERO_ADS = [
  {
    id: '1',
    title: 'Tools for real estate teams',
    subtitle: 'Discover services and resources to grow your business.',
    cta: 'Browse now',
    href: '#filters',
    image: '/images/construction-site-sunset_23-2152006125.avif',
    gradient: 'from-primary/90 to-primary/70',
    icon: Store,
  },
  {
    id: '2',
    title: 'Secure checkout',
    subtitle: 'Pay with Paystack — fast, secure, and reliable.',
    cta: 'Shop marketplace',
    href: '#filters',
    image: '/images/construction-cranes-and-workers-on-a-residential-building-against-a-sunny-sky-city-housing-construction-apartment-block-free-photo.jpg',
    gradient: 'from-slate-900/70 to-slate-800/60',
    icon: Sparkles,
  },
  {
    id: '3',
    title: 'Promotions & updates',
    subtitle: 'New offerings and deals for real estate companies.',
    cta: 'See what\'s new',
    href: '#filters',
    image: '/images/usa-happy-labor-day-celebration-construction-tools-crane-pattern-background-banner-design_600409-6794.avif',
    gradient: 'from-brand-brown-600/90 to-brand-brown-700/80',
    icon: Megaphone,
  },
];

export default function MarketplaceHome() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [heroIndex, setHeroIndex] = useState(0);

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
    fetchItems();
  }, [user, isAuthenticated, router]);

  // Auto-advance hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_ADS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(items.map((item) => item.category)));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="p-10 max-w-md border border-border shadow-lg bg-card rounded-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Please sign in as a real estate company to access the marketplace.
              </p>
              <Link href="/signin">
                <Button className="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6 h-11 font-medium">
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
        {/* Mini hero carousel */}
        <section className="mb-10" aria-label="Promotions">
          <div className="relative overflow-hidden rounded-2xl bg-muted shadow-inner">
            <div className="relative aspect-[3/1] min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
              {HERO_ADS.map((ad, index) => {
                const Icon = ad.icon;
                const isActive = index === heroIndex;
                return (
                  <div
                    key={ad.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-hidden={!isActive}
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {/* Background image from public/images */}
                    <img
                      src={ad.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      aria-hidden
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${ad.gradient}`}
                      aria-hidden
                    />
                    <div className="relative z-10 w-full max-w-3xl mx-auto px-6 sm:px-10 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm mb-3 sm:mb-4">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                        {ad.title}
                      </h2>
                      <p className="mt-1 sm:mt-2 text-white/90 text-sm sm:text-base max-w-xl mx-auto">
                        {ad.subtitle}
                      </p>
                      <a
                        href={ad.href}
                        className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white hover:bg-white/30 transition-colors"
                      >
                        {ad.cta}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Prev / Next */}
            <button
              type="button"
              onClick={() => setHeroIndex((i) => (i - 1 + HERO_ADS.length) % HERO_ADS.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setHeroIndex((i) => (i + 1) % HERO_ADS.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {HERO_ADS.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === heroIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === heroIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Hero */}
        <div id="filters" className="mb-10 scroll-mt-6">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">For real estate teams</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Marketplace
          </h1>
          <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
            Browse and purchase tools, services, and resources for your business.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border bg-card focus-visible:ring-primary"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl border-border bg-card">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/marketplace/purchases">
            <Button
              variant="outline"
              className="h-11 rounded-xl border-border hover:bg-accent"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              My Purchases
            </Button>
          </Link>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Loading marketplace...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardContent className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No items found</p>
              <p className="text-muted-foreground text-sm mt-1">
                Try adjusting your search or category filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item._id}
                className="group overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl bg-card"
              >
                <Link href={`/marketplace/${item._id}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {getMarketplaceItemImageUrl(item) ? (
                      <img
                        src={getMarketplaceItemImageUrl(item)!}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Store className="h-14 w-14 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-card/90 text-foreground border-0 shadow-sm backdrop-blur-sm font-medium rounded-lg">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(item.price, item.currency)}
                      </p>
                      <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 gap-1 transition-all">
                        View details
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
