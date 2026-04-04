'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, RefreshCw, Store } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient, type MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';

export default function CartPage() {
  const { items, itemCount, updateQuantity, removeItem, totalByCurrency, totalAmount } = useCart();
  const [suggestions, setSuggestions] = useState<MarketplaceItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const primaryCurrency = useMemo(() => Object.keys(totalByCurrency)[0] || 'GHS', [totalByCurrency]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        const res = await apiClient.getActiveMarketplaceItems({ limit: 8 });
        if (res.success && res.data) {
          const inCart = new Set(items.map((i) => i.itemId));
          setSuggestions(res.data.filter((it) => !inCart.has(it._id)).slice(0, 4));
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
    // keep it simple: refresh suggestions when cart contents change
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Cart</h1>
            <p className="text-sm text-muted-foreground mt-1">Review items before checkout.</p>
          </div>
          <Link href="/checkout">
            <Button
              className="rounded-xl bg-primary hover:opacity-90 text-primary-foreground"
              disabled={itemCount === 0}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {itemCount === 0 ? (
          <Card className="border border-border rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted text-muted-foreground mb-4">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <p className="font-medium text-foreground mb-1">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-6">Add items from the marketplace.</p>
              <Link href="/marketplace">
                <Button variant="outline" className="rounded-xl">Browse Marketplace</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border border-border rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg">Items ({itemCount})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {items.map((line) => (
                  <div key={line.itemId} className="flex gap-5 p-6 border-b border-border last:border-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted shrink-0">
                      {line.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={line.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/marketplace/${line.itemId}`} className="font-medium text-foreground hover:text-primary line-clamp-2">
                        {line.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(line.price, line.currency)}
                        {line.unitLabel && ` · ${line.unitLabel}`}
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="inline-flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.itemId, line.quantity - 1)}
                            className="p-1.5 text-muted-foreground hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.itemId, line.quantity + 1)}
                            className="p-1.5 text-muted-foreground hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(line.itemId)}
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-foreground text-lg">
                        {formatCurrency(line.price * line.quantity, line.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border rounded-2xl overflow-hidden lg:sticky lg:top-24 h-fit">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {Object.entries(totalByCurrency).map(([currency, total]) => (
                  <div key={currency} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({currency})</span>
                    <span className="font-medium text-foreground">{formatCurrency(total, currency)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-3 mt-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-foreground">
                    {Object.keys(totalByCurrency).length === 1
                      ? formatCurrency(totalAmount, primaryCurrency)
                      : formatCurrency(totalAmount, 'GHS')}
                  </span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full mt-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full rounded-xl">
                    Continue shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suggestions */}
        <div className="mt-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">You may also like</h2>
              <p className="text-sm text-muted-foreground">Popular items picked for you.</p>
            </div>
            <Link href="/marketplace" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Loading suggestions...
            </div>
          ) : suggestions.length === 0 ? (
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-10 text-center text-muted-foreground">
                No suggestions available right now.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {suggestions.map((it) => (
                <Card
                  key={it._id}
                  className="group overflow-hidden border border-border bg-card rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <Link href={`/marketplace/${it._id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {getMarketplaceItemImageUrl(it) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMarketplaceItemImageUrl(it)!}
                          alt={it.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {it.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mb-2">
                        {it.category}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(it.price, it.currency)}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

