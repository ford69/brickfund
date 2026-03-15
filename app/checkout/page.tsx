'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, RefreshCw, Trash2, Minus, Plus, ChevronDown, ChevronUp, ShieldCheck, Truck, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  getFulfillmentSettings,
  getDeliveryZoneById,
  getDeliveryFeeForVehicle,
  getVehicleForOrderSize,
  VEHICLE_LABELS,
  type OrderSize,
} from '@/lib/fulfillment';
import { apiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

type Step = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items, itemCount, updateQuantity, removeItem, totalAmount, totalByCurrency } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryZoneId, setDeliveryZoneId] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fulfillmentSettings, setFulfillmentSettings] = useState<ReturnType<typeof getFulfillmentSettings> | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.firstName || user?.lastName) {
      setDeliveryName([user.firstName, user.lastName].filter(Boolean).join(' ') || '');
    }
  }, [user]);

  useEffect(() => {
    const s = getFulfillmentSettings();
    setFulfillmentSettings(s);
    if (!deliveryZoneId && s.deliveryZones.length > 0) setDeliveryZoneId(s.deliveryZones[0].id);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace(`/signup?redirect=${encodeURIComponent('/checkout')}&reason=purchase`);
    }
  }, [isAuthenticated, user, isLoading, router]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const primaryCurrency = Object.keys(totalByCurrency)[0] || 'GHS';
  const subtotal = totalAmount;

  const orderSize: OrderSize = (() => {
    const tiers = items.map((i) => i.fulfillmentTier).filter(Boolean);
    if (tiers.some((t) => t === 'large')) return 'large';
    if (tiers.some((t) => t === 'medium')) return 'medium';
    return 'small';
  })();
  const deliveryVehicle = getVehicleForOrderSize(orderSize);

  const fulfillmentFee = (() => {
    if (!fulfillmentSettings) return 0;
    if (fulfillmentMethod === 'pickup') return fulfillmentSettings.pickup.enabled ? fulfillmentSettings.pickup.fee : 0;
    if (deliveryZoneId) return getDeliveryFeeForVehicle(deliveryZoneId, deliveryVehicle);
    return 0;
  })();
  const total = subtotal + fulfillmentFee;

  const handleContinue = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
  };

  const handlePayWithPaystack = async () => {
    if (items.length === 0) {
      toast({ title: 'Cart is empty', description: 'Add items from the marketplace.', variant: 'destructive' });
      return;
    }
    try {
      setIsProcessing(true);
      const cartPayload = items.map((i) => ({ itemId: i.itemId, quantity: i.quantity }));
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

      let response: any;
      try {
        response = await apiClient.initializeMarketplaceCartPurchase(cartPayload, {
          successUrl: `${baseUrl}/checkout/success`,
          cancelUrl: `${baseUrl}/checkout`,
        });
      } catch (cartErr) {
        if (items.length === 1 && items[0].quantity === 1) {
          response = await apiClient.initializeMarketplacePurchase(items[0].itemId);
        } else {
          throw cartErr;
        }
      }

      if (response.success && response.data) {
        const url = response.data.authorization_url || response.data.authorizationUrl;
        if (url) {
          window.location.href = url;
          return;
        }
      }
      throw new Error((response as any).message || 'Could not start payment');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment could not be started.';
      toast({ title: 'Checkout failed', description: message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Checkout</h1>
        <p className="text-muted-foreground text-sm mb-8">Complete your order securely.</p>

        {itemCount === 0 ? (
          <div className="max-w-md rounded-2xl border border-border bg-card p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted text-muted-foreground mb-4">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <p className="font-medium text-foreground mb-1">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-6">Add items from the marketplace, then return here to pay.</p>
            <Link href="/marketplace">
              <Button className="bg-primary hover:opacity-90 text-primary-foreground">Browse Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Checkout steps */}
            <div className="lg:col-span-3 space-y-4">
              {/* Step 1: Your Email */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setStep(1)}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">1</span>
                    Your Email
                  </span>
                  {step === 1 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {step === 1 && (
                  <div className="border-t border-border p-4 pt-4 space-y-4">
                    <div>
                      <Label htmlFor="checkout-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                      <Input
                        id="checkout-email"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 h-11 rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">You&apos;ll receive receipts and order updates at this email.</p>
                    </div>
                    <Button onClick={handleContinue} className="w-full h-11 rounded-lg bg-foreground hover:opacity-90 text-background font-medium">
                      CONTINUE
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 2: Delivery */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setStep(2)}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">2</span>
                    Delivery
                  </span>
                  {step === 2 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {step === 2 && (
                  <div className="border-t border-border p-4 pt-4 space-y-4">
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">Fulfillment option</Label>
                      {fulfillmentSettings && fulfillmentSettings.deliveryZones.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Order size: <strong className="text-foreground capitalize">{orderSize}</strong> — Delivery by <strong className="text-foreground">{VEHICLE_LABELS[deliveryVehicle]}</strong>
                        </p>
                      )}
                      <div className="space-y-2">
                        {fulfillmentSettings && fulfillmentSettings.deliveryZones.length > 0 && (
                          <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="fulfillment"
                              checked={fulfillmentMethod === 'delivery'}
                              onChange={() => setFulfillmentMethod('delivery')}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <span className="font-medium flex items-center gap-2"><Truck className="h-4 w-4" /> Delivery</span>
                              <select
                                value={deliveryZoneId || ''}
                                onChange={(e) => setDeliveryZoneId(e.target.value || null)}
                                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              >
                                {fulfillmentSettings.deliveryZones.map((z) => {
                                  const rate = z.rates ? z.rates[deliveryVehicle] : (z as any).amount;
                                  const amt = typeof rate === 'number' ? rate : 0;
                                  return (
                                    <option key={z.id} value={z.id}>
                                      {z.name} — {formatCurrency(amt, z.currency)}
                                      {z.estimatedDaysMin != null && z.estimatedDaysMax != null && ` (${z.estimatedDaysMin}-${z.estimatedDaysMax} days)`}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </label>
                        )}
                        {fulfillmentSettings?.pickup.enabled && (
                          <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="fulfillment"
                              checked={fulfillmentMethod === 'pickup'}
                              onChange={() => setFulfillmentMethod('pickup')}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <span className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4" /> Pickup</span>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {fulfillmentSettings.pickup.locationName}
                                {fulfillmentSettings.pickup.fee > 0 ? ` — ${formatCurrency(fulfillmentSettings.pickup.fee, fulfillmentSettings.pickup.currency)}` : ' — Free'}
                              </p>
                              {fulfillmentSettings.pickup.instructions && (
                                <p className="text-xs text-muted-foreground mt-1">{fulfillmentSettings.pickup.instructions}</p>
                              )}
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="checkout-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full name</Label>
                      <Input
                        id="checkout-name"
                        placeholder="Full name"
                        value={deliveryName}
                        onChange={(e) => setDeliveryName(e.target.value)}
                        className="mt-2 h-11 rounded-lg"
                      />
                    </div>
                    {fulfillmentMethod === 'delivery' && (
                      <div>
                        <Label htmlFor="checkout-address" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Delivery address</Label>
                        <Input
                          id="checkout-address"
                          placeholder="Street, city, region"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="mt-2 h-11 rounded-lg"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="checkout-phone" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</Label>
                      <Input
                        id="checkout-phone"
                        type="tel"
                        placeholder="Phone number"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="mt-2 h-11 rounded-lg"
                      />
                    </div>
                    <Button onClick={handleContinue} className="w-full h-11 rounded-lg bg-foreground hover:opacity-90 text-background font-medium">
                      CONTINUE
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 3: Payment */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setStep(3)}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">3</span>
                    Payment
                  </span>
                  {step === 3 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {step === 3 && (
                  <div className="border-t border-border p-4 pt-4">
                    <p className="text-sm text-muted-foreground mb-4">You will complete payment securely on Paystack (card, mobile money, bank).</p>
                    <Button
                      onClick={handlePayWithPaystack}
                      disabled={isProcessing}
                      className="w-full h-11 rounded-lg bg-foreground hover:opacity-90 text-background font-medium"
                    >
                      {isProcessing ? (
                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Redirecting...</>
                      ) : (
                        'Pay with Paystack'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 4: Review & Purchase */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setStep(4)}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">4</span>
                    Review &amp; Purchase
                  </span>
                  {step === 4 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {step === 4 && (
                  <div className="border-t border-border p-4 pt-4 space-y-3 text-sm">
                    <p><span className="text-muted-foreground">Email:</span> {email || '—'}</p>
                    <p><span className="text-muted-foreground">Fulfillment:</span> {fulfillmentMethod === 'delivery' && deliveryZoneId ? `${VEHICLE_LABELS[deliveryVehicle]} — ${getDeliveryZoneById(deliveryZoneId)?.name ?? 'Delivery'}` : 'Pickup'}</p>
                    <p><span className="text-muted-foreground">Deliver to:</span> {deliveryName || '—'} {fulfillmentMethod === 'delivery' && deliveryAddress && `, ${deliveryAddress}`}</p>
                    <p><span className="text-muted-foreground">Payment:</span> Paystack</p>
                    <Button
                      onClick={handlePayWithPaystack}
                      disabled={isProcessing}
                      className="w-full h-11 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-medium mt-2"
                    >
                      {isProcessing ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : 'Place order — Pay with Paystack'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Order Summary</h2>
                </div>
                <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
                  {items.map((line) => (
                    <div key={line.itemId} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        {line.image ? (
                          <img src={line.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center text-xs font-medium py-0.5">
                          {line.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/marketplace/${line.itemId}`} className="font-medium text-foreground hover:text-primary text-sm line-clamp-2">
                          {line.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(line.price, line.currency)} each
                          {line.unitLabel && ` · ${line.unitLabel}`}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {formatCurrency(line.price * line.quantity, line.currency)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center rounded border border-border">
                            <button type="button" onClick={() => updateQuantity(line.itemId, line.quantity - 1)} className="p-1 text-muted-foreground hover:bg-muted" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="px-2 text-xs font-medium min-w-[1.5rem] text-center">{line.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(line.itemId, line.quantity + 1)} className="p-1 text-muted-foreground hover:bg-muted" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(line.itemId)}
                            className="text-xs text-muted-foreground hover:text-destructive underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GIFT OR DISCOUNT CODE</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Gift or discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="h-10 rounded-lg flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" className="rounded-lg shrink-0">
                      APPLY
                    </Button>
                  </div>
                  <div className="space-y-2 pt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">{formatCurrency(subtotal, primaryCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {fulfillmentMethod === 'pickup' ? 'Pickup' : `Delivery (${VEHICLE_LABELS[deliveryVehicle]})`}
                      </span>
                      <span className="font-medium text-foreground">{formatCurrency(fulfillmentFee, primaryCurrency)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 mt-3">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-foreground">{formatCurrency(total, primaryCurrency)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>SECURE CHECKOUT</span>
                  </div>
                </div>
              </div>
              <Link href="/marketplace" className="block mt-4 text-center text-sm text-primary hover:underline">
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
