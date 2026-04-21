const readFlag = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true';
};

export const SHOP_ENABLED = readFlag(import.meta.env.VITE_SHOP_ENABLED, false);
