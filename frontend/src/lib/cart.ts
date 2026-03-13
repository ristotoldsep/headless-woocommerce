import { cartToken, cartItems, cartOpen, cartTotal, cartCount } from './stores';
import type { CartItem } from './stores';

const WC = import.meta.env.PUBLIC_WC_URL;

async function storeApiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = cartToken.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Cart-Token': token } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${WC}/wp-json/wc/store/v1${path}`, {
    ...options,
    headers,
  });

  const newToken = res.headers.get('Cart-Token');
  if (newToken) cartToken.set(newToken);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Store API error: ${res.status}`);
  }

  return res.json();
}

function syncCartState(data: any) {
  const items: CartItem[] = (data.items ?? []).map((item: any) => ({
    key: item.key,
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.prices?.price ?? '0',
    image: item.images?.[0]?.thumbnail ?? item.images?.[0]?.src ?? '',
  }));

  cartItems.set(items);
  cartTotal.set(data.totals?.total_price ?? '0');
  cartCount.set(items.reduce((sum, item) => sum + item.quantity, 0));
}

export async function fetchCart(): Promise<void> {
  const data = await storeApiRequest('/cart');
  syncCartState(data);
}

export async function addToCart(productId: number, quantity: number): Promise<void> {
  const data = await storeApiRequest('/cart/add-item', {
    method: 'POST',
    body: JSON.stringify({ id: productId, quantity }),
  });
  syncCartState(data);
  cartOpen.set(true);
}

export async function updateCartItem(key: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeCartItem(key);
    return;
  }
  const data = await storeApiRequest('/cart/update-item', {
    method: 'POST',
    body: JSON.stringify({ key, quantity }),
  });
  syncCartState(data);
}

export async function removeCartItem(key: string): Promise<void> {
  const data = await storeApiRequest('/cart/remove-item', {
    method: 'POST',
    body: JSON.stringify({ key }),
  });
  syncCartState(data);
}

export function getCheckoutUrl(): string {
  const token = cartToken.get();
  const base = `${WC}/checkout/`;
  return token ? `${base}?cart_token=${token}` : base;
}
