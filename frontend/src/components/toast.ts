export const TOAST_EVENT = 'litiy:toast';

export type ToastAction = {
  label: string;
  href: string;
};

export type ToastPayload = {
  id: number;
  message: string;
  action?: ToastAction;
};

export function showToast(message: string, action?: ToastAction): void {
  const detail: ToastPayload = { id: Date.now() + Math.random(), message, action };
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail }));
}
