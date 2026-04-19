import type { Product } from './product';

export type CartItem = Product & {
  lineId: string;
  itemId: number;
  height: string;
  size: string;
  quantity: number;
};
