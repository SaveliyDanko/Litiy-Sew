import { createElement, type ReactNode } from 'react';

export type Mode = 'login' | 'register';
export type Step = 'credentials' | 'code';

export type CodeContext = {
  email: string;
  expiresInSeconds: number;
};

export type EmptyTileProps = {
  icon: ReactNode;
  title: string;
  action: string;
};

export const ICON_SIZE = 22;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const CODE_LENGTH = 6;

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type SvgProps = {
  width: number;
  height: number;
  strokeWidth?: number;
  children?: ReactNode;
};

function Svg({ width, height, strokeWidth = 1.5, children }: SvgProps) {
  return createElement(
    'svg',
    {
      width,
      height,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
    },
    children,
  );
}

const el = createElement;

export function CameraIcon() {
  return el(Svg, { width: 28, height: 28 }, [
    el('path', { key: 'p', d: 'M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z' }),
    el('circle', { key: 'c', cx: 12, cy: 13, r: 3.5 }),
  ]);
}

export function GearIcon() {
  return el(Svg, { width: 16, height: 16 }, [
    el('circle', { key: 'c', cx: 12, cy: 12, r: 3 }),
    el('path', { key: 'p', d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.9l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z' }),
  ]);
}

export function LifebuoyIcon() {
  return el(Svg, { width: 28, height: 28 }, [
    el('circle', { key: 'c1', cx: 12, cy: 12, r: 9 }),
    el('circle', { key: 'c2', cx: 12, cy: 12, r: 3.5 }),
    el('path', { key: 'p', d: 'M4.9 4.9 9.5 9.5M14.5 14.5l4.6 4.6M4.9 19.1l4.6-4.6M14.5 9.5l4.6-4.6' }),
  ]);
}

export function WhatsAppIcon() {
  return el(Svg, { width: 18, height: 18 }, [
    el('path', { key: 'p1', d: 'M3 21l1.7-5.1A8 8 0 1 1 8.1 19.3L3 21Z' }),
    el('path', { key: 'p2', d: 'M9 10c.3 1 1 2 2 3s2 1.7 3 2l1.2-1.2a1 1 0 0 1 1-.2l2 .7a1 1 0 0 1 .7 1v1.7a1 1 0 0 1-1 1A9 9 0 0 1 8 9a1 1 0 0 1 1-1h1.7a1 1 0 0 1 1 .7l.7 2a1 1 0 0 1-.2 1L11 13' }),
  ]);
}

export function MailIcon() {
  return el(Svg, { width: 18, height: 18 }, [
    el('rect', { key: 'r', x: 3, y: 5, width: 18, height: 14, rx: 1.5 }),
    el('path', { key: 'p', d: 'm4 7 8 6 8-6' }),
  ]);
}

export function TelegramIcon() {
  return el(Svg, { width: 18, height: 18 }, el('path', { d: 'm3 11 17-7-3 16-5-4-3 3v-4l8-7-10 6-4-3Z' }));
}

export function VkIcon() {
  return el(Svg, { width: 18, height: 18 }, el('path', { d: 'M3 8h3c.5 3 1.8 5.5 3.5 6.5V8h3v4c1.3-.5 2.4-2 3-4h3c-.5 2.2-1.8 4.3-3.5 5.5 1.8 1 3.2 2.8 4 4.5h-3.3c-.7-1.5-2-2.8-3.2-3.2V18H9.5c-4-.5-6-5.3-6.5-10Z' }));
}

export function UserIcon() {
  return el(Svg, { width: ICON_SIZE - 4, height: ICON_SIZE - 4 }, [
    el('circle', { key: 'c1', cx: 12, cy: 12, r: 9 }),
    el('circle', { key: 'c2', cx: 12, cy: 10, r: 3 }),
    el('path', { key: 'p', d: 'M6 18c1.2-2 3.4-3 6-3s4.8 1 6 3' }),
  ]);
}

export function BagIcon() {
  return el(Svg, { width: ICON_SIZE, height: ICON_SIZE }, [
    el('path', { key: 'p1', d: 'M6 8h12l-1 12H7L6 8Z' }),
    el('path', { key: 'p2', d: 'M9 8a3 3 0 0 1 6 0' }),
  ]);
}

export function HangerIcon() {
  return el(Svg, { width: ICON_SIZE, height: ICON_SIZE }, [
    el('path', { key: 'p1', d: 'M12 10a2 2 0 1 1 2-2' }),
    el('path', { key: 'p2', d: 'M12 10 3 17a1 1 0 0 0 .6 1.8h16.8A1 1 0 0 0 21 17l-9-7Z' }),
  ]);
}

export function GiftIcon() {
  return el(Svg, { width: ICON_SIZE, height: ICON_SIZE }, [
    el('rect', { key: 'r', x: 4, y: 9, width: 16, height: 4, rx: 0.5 }),
    el('path', { key: 'p1', d: 'M5 13v7h14v-7M12 9v11' }),
    el('path', { key: 'p2', d: 'M12 9c-1.5-3-5-3-5-1s2 2 5 1Zm0 0c1.5-3 5-3 5-1s-2 2-5 1Z' }),
  ]);
}

export function ChatIcon() {
  return el(Svg, { width: ICON_SIZE, height: ICON_SIZE }, [
    el('path', { key: 'p1', d: 'M4 6h16v10H8l-4 4V6Z' }),
    el('path', { key: 'p2', d: 'M8 10h8M8 13h5' }),
  ]);
}

export function RulerIcon() {
  return el(Svg, { width: ICON_SIZE, height: ICON_SIZE }, [
    el('rect', { key: 'r', x: 3, y: 8, width: 18, height: 8, rx: 1 }),
    el('path', { key: 'p', d: 'M7 8v3M11 8v4M15 8v3M19 8v4' }),
  ]);
}

export function LogoutIcon() {
  return el(Svg, { width: 16, height: 16 }, [
    el('path', { key: 'p1', d: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4' }),
    el('path', { key: 'p2', d: 'M10 8l-4 4 4 4' }),
    el('path', { key: 'p3', d: 'M6 12h12' }),
  ]);
}

export function ChevronRightIcon() {
  return el(Svg, { width: 12, height: 12, strokeWidth: 2 }, el('path', { d: 'm9 6 6 6-6 6' }));
}

export function CloseIcon() {
  return el(Svg, { width: 22, height: 22 }, el('path', { d: 'M6 6l12 12M18 6 6 18' }));
}

export function LockIcon() {
  return el(Svg, { width: 18, height: 18 }, [
    el('rect', { key: 'r', x: 5, y: 11, width: 14, height: 9, rx: 1 }),
    el('path', { key: 'p', d: 'M8 11V8a4 4 0 0 1 8 0v3' }),
  ]);
}

export function SearchIcon() {
  return el(Svg, { width: 18, height: 18 }, [
    el('circle', { key: 'c', cx: 11, cy: 11, r: 6 }),
    el('path', { key: 'p', d: 'm20 20-4.35-4.35' }),
  ]);
}

export function CalendarIcon() {
  return el(Svg, { width: 18, height: 18 }, [
    el('rect', { key: 'r', x: 3, y: 5, width: 18, height: 16, rx: 1.5 }),
    el('path', { key: 'p1', d: 'M16 3v4M8 3v4M3 10h18' }),
  ]);
}

export function PlusIcon() {
  return el(Svg, { width: 22, height: 22, strokeWidth: 1.5 }, [
    el('circle', { key: 'c', cx: 12, cy: 12, r: 9 }),
    el('path', { key: 'p', d: 'M12 8v8M8 12h8' }),
  ]);
}

export function ChevronDownIcon() {
  return el(Svg, { width: 14, height: 14, strokeWidth: 2 }, el('path', { d: 'm6 9 6 6 6-6', transform: 'translate(-3 -5)' }));
}
