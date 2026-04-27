'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Store,
  ArrowLeft,
  RefreshCw,
  XCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiClient, MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

export default function MarketplaceItemDetails() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const itemId = params.id as string;
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedItems, setRelatedItems] = useState<MarketplaceItem[]>([]);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [siteAccessibility, setSiteAccessibility] = useState<'easy' | 'restricted' | 'heavy-truck-limited'>('easy');
  const [projectType, setProjectType] = useState('Residential');
  const [timeline, setTimeline] = useState<'urgent' | 'flexible'>('flexible');
  const [orderType, setOrderType] = useState<'one-time' | 'recurring'>('one-time');
  const [brandPreference, setBrandPreference] = useState('');
  const [notes, setNotes] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [showEstimatedPrice, setShowEstimatedPrice] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      router.push('/admin');
      return;
    }
    if (itemId) fetchItem();
  }, [user, isAuthenticated, router, itemId]);
  // Product detail is public; no auth required to view. Order request requires sign-in/sign-up.

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

  const handlePlaceOrder = async () => {
    if (!item?.isActive) return;
    if (!isAuthenticated || !user) {
      router.push(`/signup?redirect=${encodeURIComponent('/marketplace/' + itemId)}&reason=order-request`);
      return;
    }
    if (!deliveryLocation.trim()) {
      toast({
        title: 'Delivery location required',
        description: 'Please provide the project or delivery site location before placing your order.',
        variant: 'destructive',
      });
      return;
    }
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast({
        title: 'Contact details required',
        description: 'Please provide your full name and phone number so we can send your quote.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsSubmittingOrder(true);
      const enrichedNotes = [
        notes.trim() ? `Notes: ${notes.trim()}` : null,
        `Delivery type: ${deliveryType}`,
        `Site accessibility: ${siteAccessibility}`,
        `Project type: ${projectType}`,
        `Order type: ${orderType}`,
        brandPreference.trim() ? `Brand preference: ${brandPreference.trim()}` : null,
        `Contact name: ${fullName.trim()}`,
        `Phone: ${phoneNumber.trim()}`,
        whatsAppNumber.trim() ? `WhatsApp: ${whatsAppNumber.trim()}` : null,
        companyName.trim() ? `Company: ${companyName.trim()}` : null,
        budgetRange.trim() ? `Budget range: ${budgetRange.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');
      await apiClient.createMarketplaceOrderRequest({
        items: [{ itemId: item._id, quantity }],
        deliveryAddress: deliveryLocation.trim(),
        timeline,
        notes: enrichedNotes || undefined,
      });
      toast({
        title: 'Order request submitted',
        description: `Request sent (${quantity} unit${quantity > 1 ? 's' : ''}, ${timeline}). BrickFund will respond with a quote within 48 hours.`,
      });
      router.push('/marketplace/purchases');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit order request';
      toast({
        title: 'Could not submit request',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingOrder(false);
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
  const estimatedAmount = item ? item.price * quantity : 0;
  const goToNextStep = () => setWizardStep((prev) => (prev < 6 ? ((prev + 1) as 1 | 2 | 3 | 4 | 5 | 6) : prev));
  const goToPrevStep = () => setWizardStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4 | 5 | 6) : prev));
  const unitLabel =
    ((item as any)?.unitLabel as string) ||
    ((item as any)?.unitType ? `per ${(item as any).unitType}` : 'per unit');

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
            <Card className="overflow-hidden border-0 shadow-sm rounded-2xl max-w-xl">
              {activeImage ? (
                <div className="relative">
                  <img
                    src={activeImage}
                    alt={item.name}
                    className="w-full h-[280px] sm:h-[340px] object-cover"
                  />
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((idx) => (idx === 0 ? galleryImages.length - 1 : idx - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-sm hover:bg-background"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((idx) => (idx === galleryImages.length - 1 ? 0 : idx + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-sm hover:bg-background"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
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

          {/* Details & order request */}
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
            <p className="text-lg font-semibold text-foreground mb-1">Quote on request</p>
            <p className="text-sm text-muted-foreground mb-4">{unitLabel}</p>

            {/* Order request controls */}
            <Card className="border-0 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step {wizardStep} of 6</span>
                  <span>Request Quote</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(wizardStep / 6) * 100}%` }} />
                </div>

                {wizardStep === 1 && (
                  <div className="space-y-3">
                    <Label>Quantity</Label>
                    <div className="flex flex-wrap gap-2">
                      {[50, 100, 200].map((quickQty) => (
                        <Button key={quickQty} type="button" variant={quantity === quickQty ? 'default' : 'outline'} onClick={() => setQuantity(quickQty)}>
                          {quickQty}
                        </Button>
                      ))}
                    </div>
                    <div className="inline-flex items-center rounded-full border border-border overflow-hidden">
                      <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1 text-sm hover:bg-accent">-</button>
                      <span className="px-4 py-1 text-sm font-medium text-foreground min-w-[2.5rem] text-center">{quantity}</span>
                      <button type="button" onClick={() => setQuantity((q) => q + 1)} className="px-3 py-1 text-sm hover:bg-accent">+</button>
                    </div>
                    <p className="text-xs text-muted-foreground">1 bag = 50kg (adjust based on your order need).</p>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="delivery-location">Project / delivery location</Label>
                      <Input id="delivery-location" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="Enter project site or delivery address" />
                    </div>
                    <div>
                      <Label>Delivery type</Label>
                      <div className="flex gap-2 mt-2">
                        <Button type="button" variant={deliveryType === 'delivery' ? 'default' : 'outline'} onClick={() => setDeliveryType('delivery')}>Delivery</Button>
                        <Button type="button" variant={deliveryType === 'pickup' ? 'default' : 'outline'} onClick={() => setDeliveryType('pickup')}>Pickup</Button>
                      </div>
                    </div>
                    <div>
                      <Label>Site accessibility</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button type="button" variant={siteAccessibility === 'easy' ? 'default' : 'outline'} onClick={() => setSiteAccessibility('easy')}>Easy access</Button>
                        <Button type="button" variant={siteAccessibility === 'restricted' ? 'default' : 'outline'} onClick={() => setSiteAccessibility('restricted')}>Restricted</Button>
                        <Button type="button" variant={siteAccessibility === 'heavy-truck-limited' ? 'default' : 'outline'} onClick={() => setSiteAccessibility('heavy-truck-limited')}>Heavy truck limited</Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="project-type">Project type</Label>
                      <Input id="project-type" value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="Residential, commercial, road works..." />
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-3">
                    <div>
                      <Label>Timeline</Label>
                      <div className="flex gap-2 mt-2">
                        <Button type="button" variant={timeline === 'urgent' ? 'default' : 'outline'} onClick={() => setTimeline('urgent')}>Urgent</Button>
                        <Button type="button" variant={timeline === 'flexible' ? 'default' : 'outline'} onClick={() => setTimeline('flexible')}>Flexible</Button>
                      </div>
                    </div>
                    <div>
                      <Label>Order type</Label>
                      <div className="flex gap-2 mt-2">
                        <Button type="button" variant={orderType === 'one-time' ? 'default' : 'outline'} onClick={() => setOrderType('one-time')}>One-time</Button>
                        <Button type="button" variant={orderType === 'recurring' ? 'default' : 'outline'} onClick={() => setOrderType('recurring')}>Recurring</Button>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="brand-preference">Brand preference (optional)</Label>
                      <Input id="brand-preference" value={brandPreference} onChange={(e) => setBrandPreference(e.target.value)} placeholder="Ghacem, Dzata, any trusted brand..." />
                    </div>
                    <div>
                      <Label htmlFor="order-notes">Additional notes</Label>
                      <Textarea id="order-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder='e.g. "for foundation work"' className="min-h-[84px]" />
                    </div>
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="full-name">Full name</Label>
                      <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div>
                      <Label htmlFor="phone-number">Phone number</Label>
                      <Input id="phone-number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Primary contact number" />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp-number">WhatsApp (optional)</Label>
                      <Input id="whatsapp-number" value={whatsAppNumber} onChange={(e) => setWhatsAppNumber(e.target.value)} placeholder="WhatsApp number" />
                    </div>
                    <div>
                      <Label htmlFor="company-name">Company (optional)</Label>
                      <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company or business name" />
                    </div>
                  </div>
                )}

                {wizardStep === 6 && (
                  <div className="space-y-3 text-sm">
                    <div className="rounded-xl border border-border p-3 space-y-1">
                      <p><span className="text-muted-foreground">Product:</span> {item.name}</p>
                      <p><span className="text-muted-foreground">Quantity:</span> {quantity}</p>
                      <p><span className="text-muted-foreground">Location:</span> {deliveryLocation || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Timeline:</span> {timeline}</p>
                    </div>
                    <div>
                      <Label htmlFor="budget-range">Budget range (optional)</Label>
                      <Input id="budget-range" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} placeholder="e.g. GHS 10,000 - 15,000" />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={showEstimatedPrice} onChange={(e) => setShowEstimatedPrice(e.target.checked)} />
                      Show estimated price
                    </label>
                    {showEstimatedPrice && <p className="text-sm font-medium text-foreground">Estimated: {formatCurrency(estimatedAmount, item.currency)}</p>}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={goToPrevStep} disabled={wizardStep === 1} className="flex-1">
                    Previous
                  </Button>
                  {wizardStep < 6 ? (
                    <Button type="button" onClick={goToNextStep} className="flex-1">
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!item.isActive || isSubmittingOrder}
                      className="flex-1 h-12 rounded-xl bg-primary hover:opacity-90 text-white font-medium shadow-sm"
                      size="lg"
                    >
                      {isSubmittingOrder ? 'Submitting...' : 'Request Quote'}
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground pt-1 space-y-1">
                  <p>✔ Verified suppliers</p>
                  <p>✔ Best market rates</p>
                  <p>✔ Response within 24 hours</p>
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
                  This item is currently unavailable for ordering.
                </p>
              </div>
            )}

            {item.isActive && (
              <div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Available for order request and supplier quote coordination</span>
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
                      <p className="text-xs text-muted-foreground">
                        Quote on request
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
