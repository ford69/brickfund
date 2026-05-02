'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Package,
  RefreshCw,
  Store,
  Tag,
  Truck,
} from 'lucide-react';
import { apiClient, type MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

function formatDateTime(value: string | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2.5 border-b border-border/60 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:w-40 shrink-0">
        {label}
      </span>
      <div className="text-sm text-foreground min-w-0 flex-1">{value}</div>
    </div>
  );
}

export default function AdminMarketplaceItemViewPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const itemId = params.id as string;
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (itemId) {
      void fetchItem();
    }
  }, [user, router, itemId]);

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplaceItem(itemId);
      if (response.success && response.data) {
        setItem(response.data);
      } else {
        setItem(null);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load item';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      router.push('/admin/marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const galleryImages = useMemo(() => {
    if (!item) return [];
    const raw = item.images?.length ? [...item.images] : [];
    const hero = getMarketplaceItemImageUrl(item);
    if (hero && !raw.includes(hero)) raw.unshift(hero);
    return raw.filter(Boolean);
  }, [item]);

  const tags = useMemo(() => {
    const t = (item as MarketplaceItem & { tags?: string[] })?.tags;
    return Array.isArray(t) ? t : [];
  }, [item]);

  const stockLabel = (() => {
    if (!item) return '—';
    const stock = (item as MarketplaceItem & { stock?: number }).stock;
    const lowStockThreshold = (item as MarketplaceItem & { lowStockThreshold?: number }).lowStockThreshold;
    if (typeof stock !== 'number') return '—';
    const threshold = typeof lowStockThreshold === 'number' ? lowStockThreshold : 5;
    if (stock === 0) return 'Out of stock';
    if (stock <= threshold) return `Low stock (${stock})`;
    return String(stock);
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading inventory item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Item not found.</p>
        <Button asChild variant="outline">
          <Link href="/admin/marketplace">Back to inventory</Link>
        </Button>
      </div>
    );
  }

  const extended = item as MarketplaceItem & {
    sku?: string;
    brand?: string;
    stock?: number;
    lowStockThreshold?: number;
    fulfillmentTier?: 'small' | 'medium' | 'large';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex items-start gap-3 min-w-0">
              <Link href="/admin/marketplace">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-foreground truncate">{item.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Inventory · #{item._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <a href={`/marketplace/${item._id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview listing
                </a>
              </Button>
              <Button size="sm" className="bg-primary hover:opacity-90" asChild>
                <Link href={`/admin/marketplace/edit/${item._id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit item
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={item.isActive ? 'bg-emerald-100 text-emerald-800 border-0' : 'bg-muted text-muted-foreground'}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {item.category}
          </Badge>
          <Badge variant="secondary" className="font-normal">
            Quote on request
          </Badge>
        </div>

        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Images
            </CardTitle>
            <CardDescription>Gallery stored for this inventory record</CardDescription>
          </CardHeader>
          <CardContent>
            {galleryImages.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
                <Store className="h-10 w-10 text-muted-foreground/50" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-2 left-2 rounded bg-background/90 px-2 py-0.5 text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{item.description}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Catalog & identifiers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailRow label="SKU" value={extended.sku || '—'} />
            <DetailRow label="Brand" value={extended.brand || '—'} />
            <DetailRow
              label="Tags"
              value={
                tags.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  '—'
                )
              }
            />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inventory</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailRow label="Stock" value={stockLabel} />
            <DetailRow
              label="Low-stock threshold"
              value={
                typeof extended.lowStockThreshold === 'number'
                  ? String(extended.lowStockThreshold)
                  : 'Default (5)'
              }
            />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              Units & fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailRow label="Unit type" value={item.unitType || '—'} />
            <DetailRow label="Unit label" value={item.unitLabel || '—'} />
            <DetailRow
              label="Unit size"
              value={typeof item.unitSize === 'number' ? String(item.unitSize) : '—'}
            />
            <DetailRow
              label="Fulfillment tier"
              value={
                extended.fulfillmentTier ? (
                  <span className="capitalize">{extended.fulfillmentTier}</span>
                ) : (
                  '—'
                )
              }
            />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pricing</CardTitle>
            <CardDescription>List price is quote-managed; backend may still store reference values.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailRow
              label="Stored price"
              value={
                item.price > 0
                  ? `${item.currency} ${item.price.toLocaleString()}`
                  : '— (quote-based)'
              }
            />
            <DetailRow label="Currency" value={item.currency || 'GHS'} />
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>Created {formatDateTime(item.createdAt)}</span>
          <span>Updated {formatDateTime(item.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
