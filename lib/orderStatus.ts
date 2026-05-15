/** Canonical marketplace order tracking statuses (matches backend Order.orderStatus). */
export type OrderStatus =
  | 'pending'
  | 'quote_shared'
  | 'confirmed'
  | 'processing'
  | 'dispatching'
  | 'out_for_delivery'
  | 'delivered'
  | 'paid'
  | 'shipped'
  | 'failed'
  | 'cancelled';

/** Customer-facing tracking steps in order. */
export const ORDER_TRACKING_STEPS: OrderStatus[] = [
  'pending',
  'quote_shared',
  'confirmed',
  'processing',
  'dispatching',
  'out_for_delivery',
  'delivered',
];

/** Map legacy backend values to the canonical step for progress UI. */
export function normalizeOrderStatus(status?: string | null): OrderStatus {
  const s = (status || 'pending').toLowerCase();
  if (s === 'completed') return 'delivered';
  if (s === 'paid') return 'quote_shared';
  if (s === 'shipped') return 'dispatching';
  return s as OrderStatus;
}

export function getOrderStatusLabel(status?: string | null): string {
  const s = normalizeOrderStatus(status);
  const labels: Record<OrderStatus, string> = {
    pending: 'Order request received',
    quote_shared: 'Quote shared',
    confirmed: 'Order confirmation',
    processing: 'Order processing',
    dispatching: 'Order dispatching',
    out_for_delivery: 'Delivering order',
    delivered: 'Order delivered',
    paid: 'Quote shared',
    shipped: 'Order dispatching',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return labels[s] || status || 'Unknown';
}

/** 0-based index for timeline progress (0 .. ORDER_TRACKING_STEPS.length - 1). */
export function getOrderTrackingStepIndex(status?: string | null): number {
  const normalized = normalizeOrderStatus(status);
  const idx = ORDER_TRACKING_STEPS.indexOf(normalized);
  return idx >= 0 ? idx : 0;
}

/** Admin: next status in the fulfillment pipeline (null = terminal or unknown). */
export function getAdminNextStatus(status?: string | null): OrderStatus | null {
  const s = normalizeOrderStatus(status);
  const next: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'quote_shared',
    quote_shared: 'confirmed',
    confirmed: 'processing',
    processing: 'dispatching',
    dispatching: 'out_for_delivery',
    out_for_delivery: 'delivered',
  };
  return next[s] ?? null;
}

export function getAdminNextStatusButtonLabel(status?: string | null): string | null {
  const next = getAdminNextStatus(status);
  if (!next) return null;
  return getOrderStatusLabel(next);
}

export type AdminPipelineStage =
  | 'new_request'
  | 'quote_sent'
  | 'confirmed'
  | 'processing'
  | 'dispatching'
  | 'delivering'
  | 'completed'
  | 'cancelled'
  | 'failed';

export function getAdminPipelineStage(
  status?: string | null,
  hasQuoteAmount?: boolean
): AdminPipelineStage {
  const s = normalizeOrderStatus(status);
  if (s === 'cancelled') return 'cancelled';
  if (s === 'failed') return 'failed';
  if (s === 'delivered') return 'completed';
  if (s === 'out_for_delivery') return 'delivering';
  if (s === 'dispatching') return 'dispatching';
  if (s === 'processing') return 'processing';
  if (s === 'confirmed') return 'confirmed';
  if (s === 'quote_shared') return 'quote_sent';
  if (s === 'pending' && hasQuoteAmount) return 'quote_sent';
  return 'new_request';
}

export const ADMIN_PIPELINE_LABELS: Record<AdminPipelineStage, string> = {
  new_request: 'New request',
  quote_sent: 'Quote shared',
  confirmed: 'Order confirmation',
  processing: 'Order processing',
  dispatching: 'Order dispatching',
  delivering: 'Delivering',
  completed: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
};
