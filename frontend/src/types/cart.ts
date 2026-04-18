import type { Product } from './product';

export type CartItem = Product & {
  lineId: string;
  height: string;
  size: string;
  quantity: number;
};
