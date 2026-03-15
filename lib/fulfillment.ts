/**
 * Fulfillment settings: delivery by vehicle type (based on order size) + pickup.
 * Order size is derived from items: small (e.g. nails) → motor bike, medium → mini truck, large (e.g. iron rods) → truck.
 * Stored in localStorage until backend provides GET/PUT /admin/fulfillment.
 */

export type VehicleType = 'motorcycle' | 'mini_truck' | 'truck';
export type OrderSize = 'small' | 'medium' | 'large';

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  motorcycle: 'Motor bike',
  mini_truck: 'Mini truck',
  truck: 'Truck',
};

export const ORDER_SIZE_LABELS: Record<OrderSize, string> = {
  small: 'Small (e.g. nails, fittings)',
  medium: 'Medium',
  large: 'Large (e.g. iron rods, lumber)',
};

/** Order size → vehicle used for delivery */
export function getVehicleForOrderSize(size: OrderSize): VehicleType {
  switch (size) {
    case 'large': return 'truck';
    case 'medium': return 'mini_truck';
    default: return 'motorcycle';
  }
}

export interface DeliveryZoneRates {
  motorcycle: number;
  mini_truck: number;
  truck: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  /** Legacy single amount; if present and rates missing, used as truck rate */
  amount?: number;
  /** Per-vehicle delivery fee (GHS) */
  rates: DeliveryZoneRates;
  currency: string;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
}

export interface PickupOption {
  enabled: boolean;
  locationName: string;
  address?: string;
  fee: number;
  currency: string;
  instructions?: string;
}

export interface FulfillmentSettings {
  deliveryZones: DeliveryZone[];
  pickup: PickupOption;
}

const STORAGE_KEY = 'brickfund_fulfillment_settings';

function defaultRates(legacyAmount?: number): DeliveryZoneRates {
  const t = legacyAmount ?? 80;
  return {
    motorcycle: Math.round(t * 0.2) || 15,
    mini_truck: Math.round(t * 0.5) || 40,
    truck: t,
  };
}

const defaultSettings: FulfillmentSettings = {
  deliveryZones: [
    { id: 'accra-within', name: 'Within Accra', description: 'Central Accra and immediate environs', rates: { motorcycle: 15, mini_truck: 35, truck: 80 }, currency: 'GHS', estimatedDaysMin: 1, estimatedDaysMax: 2 },
    { id: 'accra-greater', name: 'Greater Accra', description: 'Tema, Dodowa, etc.', rates: { motorcycle: 25, mini_truck: 50, truck: 120 }, currency: 'GHS', estimatedDaysMin: 2, estimatedDaysMax: 3 },
    { id: 'outside-accra', name: 'Outside Accra', description: 'Other regions', rates: { motorcycle: 45, mini_truck: 90, truck: 200 }, currency: 'GHS', estimatedDaysMin: 3, estimatedDaysMax: 5 },
  ],
  pickup: {
    enabled: true,
    locationName: 'BrickFund Warehouse',
    address: 'Accra, Ghana',
    fee: 0,
    currency: 'GHS',
    instructions: 'Pickup by appointment. Contact us after order confirmation.',
  },
};

function normalizeZone(z: DeliveryZone): DeliveryZone {
  const rates = z.rates || defaultRates(z.amount);
  return {
    ...z,
    currency: z.currency || 'GHS',
    rates: {
      motorcycle: rates.motorcycle ?? defaultRates().motorcycle,
      mini_truck: rates.mini_truck ?? defaultRates().mini_truck,
      truck: rates.truck ?? defaultRates(z.amount).truck,
    },
  };
}

export function getFulfillmentSettings(): FulfillmentSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as FulfillmentSettings;
    return {
      deliveryZones: Array.isArray(parsed.deliveryZones)
        ? parsed.deliveryZones.map(normalizeZone)
        : defaultSettings.deliveryZones,
      pickup: parsed.pickup && typeof parsed.pickup === 'object'
        ? { ...defaultSettings.pickup, ...parsed.pickup }
        : defaultSettings.pickup,
    };
  } catch {
    return defaultSettings;
  }
}

export function setFulfillmentSettings(settings: FulfillmentSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function getDeliveryZoneById(id: string): DeliveryZone | undefined {
  return getFulfillmentSettings().deliveryZones.find((z) => z.id === id);
}

export function getDeliveryFeeForVehicle(zoneId: string, vehicle: VehicleType): number {
  const zone = getDeliveryZoneById(zoneId);
  if (!zone || !zone.rates) return 0;
  return zone.rates[vehicle] ?? zone.rates.truck ?? 0;
}
