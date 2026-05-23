import type { CSSProperties } from 'react';

type PhotoLike = {
  positionX: number;
  positionY: number;
  scale: number;
  positionXMobile?: number;
  positionYMobile?: number;
  scaleMobile?: number;
  positionXTablet?: number;
  positionYTablet?: number;
  scaleTablet?: number;
};

export function responsivePhotoStyle(p: PhotoLike): CSSProperties {
  const sM = (p.scaleMobile ?? p.scale ?? 100) / 100;
  const sT = (p.scaleTablet ?? p.scale ?? 100) / 100;
  const sD = (p.scale ?? 100) / 100;
  return {
    '--ph-pos-x-mobile': `${p.positionXMobile ?? p.positionX}%`,
    '--ph-pos-y-mobile': `${p.positionYMobile ?? p.positionY}%`,
    '--ph-pos-x-tablet': `${p.positionXTablet ?? p.positionX}%`,
    '--ph-pos-y-tablet': `${p.positionYTablet ?? p.positionY}%`,
    '--ph-pos-x-desktop': `${p.positionX}%`,
    '--ph-pos-y-desktop': `${p.positionY}%`,
    '--ph-scale-mobile': sM,
    '--ph-scale-tablet': sT,
    '--ph-scale-desktop': sD,
  } as CSSProperties;
}
