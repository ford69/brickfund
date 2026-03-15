'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  ArrowLeft,
  ShoppingCart,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiClient, MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

export default function MarketplaceItemDetails() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const itemId = params.id as string;
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedItems, setRelatedItems] = useState<MarketplaceItem[]>([]);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      router.push('/admin');
      return;
    }
    if (itemId) fetchItem();
  }, [user, isAuthenticated, router, itemId]);
  // Product detail is public; no auth required to view. Purchase requires sign-in/sign-up.

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplaceItem(itemId);
      if (response.success && response.data) {
        if (!response.data.isActive) {
          toast({
            title: 'Item Unavailable',
            description: 'This item is not currently available',
            variant: 'destructive',
          });
          router.push('/marketplace');
          return;
        }
        const loaded = response.data;
        setItem(loaded);

        // Load some related items in the same category (best-effort, non-blocking)
        try {
          const relatedRes = await apiClient.getActiveMarketplaceItems({ limit: 6, category: loaded.category });
          if (relatedRes.success && relatedRes.data) {
            const filtered = relatedRes.data.filter((i) => i._id !== loaded._id);
            setRelatedItems(filtered.slice(0, 4));
          }
        } catch {
          // Ignore related-items failure
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load item details';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      router.push('/marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!item?.isActive) return;
    addItem({
      itemId: item._id,
      name: item.name,
      price: item.price,
      currency: item.currency,
      image: getMarketplaceItemImageUrl(item),
      unitLabel: (item as any).unitLabel,
      fulfillmentTier: (item as any).fulfillmentTier as 'small' | 'medium' | 'large' | undefined,
      quantity,
    });
    toast({ title: 'Added to cart', description: `${item.name} (${quantity}) added to your cart.` });
  };

  const handleBuyNow = () => {
    if (!item?.isActive) return;
    if (!isAuthenticated || !user) {
      router.push(`/signup?redirect=${encodeURIComponent('/marketplace/' + itemId)}&reason=purchase`);
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
      quantity,
    });
    router.push('/checkout');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const galleryImages = useMemo(() => {
    if (!item) return [];
    const images: string[] = [];
    if (item.images && item.images.length > 0) {
      images.push(...item.images);
    }
    const hero = getMarketplaceItemImageUrl(item);
    if (hero && !images.includes(hero)) {
      images.unshift(hero);
    }
    return images;
  }, [item]);

  const activeImage = galleryImages[activeImageIndex] || getMarketplaceItemImageUrl(item);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="p-10 max-w-md border-0 shadow-xl bg-white rounded-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-6">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Item Not Found</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The item you&apos;re looking for doesn&apos;t exist or is no longer available.
              </p>
              <Link href="/marketplace">
                <Button className="bg-primary hover:opacity-90 text-white rounded-xl px-6 h-11 font-medium shadow-sm">
                  Back to Marketplace
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
        <Link
          href="/marketplace"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Media / gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-sm rounded-2xl aspect-square lg:aspect-auto lg:min-h-[420px]">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[320px] flex items-center justify-center bg-muted">
                  <Store className="h-24 w-24 text-slate-300" />
                </div>
              )}
            </Card>
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((src, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border ${
                      index === activeImageIndex ? 'border-primary ring-2 ring-primary/40' : 'border-border'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${item.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & purchase */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-muted text-foreground border-0 font-medium rounded-lg px-3 py-1 capitalize">
                {item.category}
              </Badge>
              {item.isActive ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  In stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  <XCircle className="h-3.5 w-3.5" />
                  Unavailable
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
              {item.name}
            </h1>
            <p className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(item.price, item.currency)}
              <span className="ml-2 text-base font-medium text-muted-foreground">
                {((item as any).unitLabel as string) ||
                  ((item as any).unitType ? `per ${(item as any).unitType}` : 'per unit')}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Total for {quantity}{' '}
              {((item as any).unitLabel as string) ||
                ((item as any).unitType ? (item as any).unitType : 'unit')}
              :{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(item.price * quantity, item.currency)}
              </span>
            </p>

            {/* Purchase controls */}
            <Card className="border-0 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="inline-flex items-center rounded-full border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-accent"
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="px-4 py-1 text-sm font-medium text-foreground min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-accent"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleBuyNow}
                    disabled={!item.isActive}
                    className="flex-1 h-12 rounded-xl bg-primary hover:opacity-90 text-white font-medium shadow-sm"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-xl border-border"
                    onClick={handleAddToCart}
                    disabled={!item.isActive}
                  >
                    Add to Cart
                  </Button>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Checkout with cart — secure payment via Paystack</span>
                </div>
              </CardContent>
            </Card>

            {/* Description & info */}
            <Card className="border-0 shadow-sm rounded-2xl mb-6 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </CardContent>
            </Card>

            {!item.isActive && (
              <div className="mt-2 flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-amber-800">
                  This item is currently unavailable for purchase.
                </p>
              </div>
            )}

            {item.isActive && (
              <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Available — add to cart and pay at checkout with Paystack</span>
              </div>
            )}
          </div>
        </div>

        {/* Related items */}
        {relatedItems.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">You may also like</h2>
              <Link href="/marketplace" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedItems.map((related) => (
                <Card
                  key={related._id}
                  className="group overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl bg-card"
                >
                  <Link href={`/marketplace/${related._id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {getMarketplaceItemImageUrl(related) ? (
                        <img
                          src={getMarketplaceItemImageUrl(related)!}
                          alt={related.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Store className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                        {related.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mb-1">
                        {related.category}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(related.price, related.currency)}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
