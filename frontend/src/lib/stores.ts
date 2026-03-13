import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

export interface CartItem {
  key: string;
  id: number;
  name: string;
  quantity: number;
  price: string;
  image: string;
}

export const cartToken = persistentAtom<string>('cart-token', '');
export const cartItems = atom<CartItem[]>([]);
export const cartOpen = atom<boolean>(false);
export const cartTotal = atom<string>('0');
export const cartCount = atom<number>(0);
