'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Package, Truck, MapPin, Save, Plus, Trash2, Bike, Box } from 'lucide-react';
import {
  getFulfillmentSettings,
  setFulfillmentSettings,
  VEHICLE_LABELS,
  type VehicleType,
  type FulfillmentSettings,
  type DeliveryZone,
  type PickupOption,
} from '@/lib/fulfillment';
import { toast } from '@/hooks/use-toast';

function generateId() {
  return 'zone-' + Math.random().toString(36).slice(2, 11);
}

export default function AdminFulfillmentPage() {
  const [settings, setSettings] = useState<FulfillmentSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getFulfillmentSettings());
  }, []);

  const updateDeliveryZones = (zones: DeliveryZone[]) => {
    if (!settings) return;
    setSettings({ ...settings, deliveryZones: zones });
  };

  const addZone = () => {
    if (!settings) return;
    updateDeliveryZones([
      ...settings.deliveryZones,
      {
        id: generateId(),
        name: '',
        description: '',
        rates: { motorcycle: 15, mini_truck: 40, truck: 80 },
        currency: 'GHS',
        estimatedDaysMin: 1,
        estimatedDaysMax: 3,
      },
    ]);
  };

  const updateZoneRates = (id: string, vehicle: VehicleType, value: number) => {
    if (!settings) return;
    updateDeliveryZones(
      settings.deliveryZones.map((z) =>
        z.id === id ? { ...z, rates: { ...z.rates, [vehicle]: value } } : z
      )
    );
  };

  const removeZone = (id: string) => {
    if (!settings) return;
    updateDeliveryZones(settings.deliveryZones.filter((z) => z.id !== id));
  };

  const updateZone = (id: string, updates: Partial<DeliveryZone>) => {
    if (!settings) return;
    updateDeliveryZones(
      settings.deliveryZones.map((z) => (z.id === id ? { ...z, ...updates } : z))
    );
  };

  const updatePickup = (updates: Partial<PickupOption>) => {
    if (!settings) return;
    setSettings({ ...settings, pickup: { ...settings.pickup, ...updates } });
  };

  const handleSave = () => {
    if (!settings) return;
    setFulfillmentSettings(settings);
    setSaved(true);
    toast({ title: 'Saved', description: 'Fulfillment settings have been updated.' });
    setTimeout(() => setSaved(false), 2000);
  };

  if (settings === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Delivery &amp; Pickup</h2>
        <p className="text-slate-500 text-sm mt-1">
          Set delivery zones and <strong>rates per vehicle</strong>. Order size (from items) decides vehicle: small orders (e.g. nails) → motor bike, medium → mini truck, large (e.g. iron rods) → truck.
        </p>
      </div>

      <Card className="border border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5 text-slate-600" />
            Delivery zones (rates by vehicle)
          </CardTitle>
          <CardDescription>
            Each zone has a fee for Motor bike (small orders), Mini truck (medium), and Truck (large). Customers pick zone; vehicle is chosen automatically from cart contents.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {settings.deliveryZones.map((zone) => {
            const rates = zone.rates || { motorcycle: 15, mini_truck: 40, truck: 80 };
            return (
              <div
                key={zone.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <Label className="text-xs text-slate-600">Zone name</Label>
                      <Input
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        placeholder="e.g. Within Accra"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Description (optional)</Label>
                      <Input
                        value={zone.description || ''}
                        onChange={(e) => updateZone(zone.id, { description: e.target.value })}
                        placeholder="e.g. Central Accra and environs"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                    onClick={() => removeZone(zone.id)}
                    aria-label="Remove zone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-slate-600 flex items-center gap-1.5"><Bike className="h-3.5 w-3" /> Motor bike (small)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={rates.motorcycle}
                      onChange={(e) => updateZoneRates(zone.id, 'motorcycle', Number(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 flex items-center gap-1.5"><Box className="h-3.5 w-3" /> Mini truck (medium)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={rates.mini_truck}
                      onChange={(e) => updateZoneRates(zone.id, 'mini_truck', Number(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 flex items-center gap-1.5"><Truck className="h-3.5 w-3" /> Truck (large)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={rates.truck}
                      onChange={(e) => updateZoneRates(zone.id, 'truck', Number(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <Label className="text-xs text-slate-600">Est. days (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={zone.estimatedDaysMin ?? ''}
                      onChange={(e) => updateZone(zone.id, { estimatedDaysMin: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="1"
                      className="mt-1 w-20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Est. days (max)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={zone.estimatedDaysMax ?? ''}
                      onChange={(e) => updateZone(zone.id, { estimatedDaysMax: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="3"
                      className="mt-1 w-20"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <Button type="button" variant="outline" onClick={addZone} className="w-full rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add delivery zone
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-slate-600" />
            Pickup option
          </CardTitle>
          <CardDescription>
            Allow customers to pick up their order at your location. Set fee to 0 for free pickup.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="pickup-enabled" className="font-medium">Enable pickup</Label>
            <Switch
              id="pickup-enabled"
              checked={settings.pickup.enabled}
              onCheckedChange={(checked) => updatePickup({ enabled: checked })}
            />
          </div>
          {settings.pickup.enabled && (
            <>
              <div>
                <Label className="text-xs text-slate-600">Location name</Label>
                <Input
                  value={settings.pickup.locationName}
                  onChange={(e) => updatePickup({ locationName: e.target.value })}
                  placeholder="e.g. BrickFund Warehouse"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600">Address (optional)</Label>
                <Input
                  value={settings.pickup.address || ''}
                  onChange={(e) => updatePickup({ address: e.target.value })}
                  placeholder="Accra, Ghana"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600">Pickup fee (GHS)</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={settings.pickup.fee}
                  onChange={(e) => updatePickup({ fee: Number(e.target.value) || 0 })}
                  className="mt-1 w-32"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600">Instructions (optional)</Label>
                <Textarea
                  value={settings.pickup.instructions || ''}
                  onChange={(e) => updatePickup({ instructions: e.target.value })}
                  placeholder="Pickup by appointment. Contact us after order confirmation."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="rounded-xl bg-blue-600 hover:bg-blue-700" disabled={saved}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? 'Saved' : 'Save settings'}
        </Button>
      </div>
    </div>
  );
}
