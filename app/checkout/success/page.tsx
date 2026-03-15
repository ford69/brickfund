'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Store } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-16">
        <Card className="border border-border text-center overflow-hidden">
          <CardContent className="p-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Thank you for your order</h1>
            <p className="text-muted-foreground mb-8">
              Your payment was successful. We&apos;ll process your order and you can view it in your purchases.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/marketplace">
                <Button className="w-full sm:w-auto rounded-xl" variant="outline">
                  <Store className="h-4 w-4 mr-2" />
                  Back to Marketplace
                </Button>
              </Link>
              <Link href="/marketplace/purchases">
                <Button className="w-full sm:w-auto rounded-xl bg-primary hover:opacity-90 text-primary-foreground">
                  View my purchases
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
