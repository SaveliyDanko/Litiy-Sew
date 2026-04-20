import type { ReactNode } from 'react';

import styles from './AuthPage.module.css';
import {
  BagIcon,
  ChatIcon,
  ChevronRightIcon,
  GiftIcon,
  HangerIcon,
  RulerIcon,
} from './authPageData';

type ProfileView = 'cabinet' | 'orders' | 'patterns' | 'reviews' | 'measurements';

type Props = {
  onNavigate?: (view: ProfileView) => void;
};

type EmptyTileProps = {
  icon: ReactNode;
  title: string;
  action: string;
  onClick?: () => void;
};

export default function ProfileCabinetPage({ onNavigate }: Props) {
  const go = (view: ProfileView) => () => onNavigate?.(view);

  return (
    <div className={styles.profileGrid}>
      <EmptyTile
        icon={<BagIcon />}
        title="Пока нет оформленных заказов"
        action="Перейти к покупкам"
        onClick={go('orders')}
      />
      <EmptyTile
        icon={<HangerIcon />}
        title="Пока нет купленных выкроек"
        action="Перейти к покупкам"
        onClick={go('patterns')}
      />
      <EmptyTile
        icon={<GiftIcon />}
        title="Пока нет начисленных бонусов"
        action="Условия начисления"
      />
      <EmptyTile
        icon={<ChatIcon />}
        title="Пока нет оставленных отзывов"
        action="Приобрели выкройку? Оставьте свой отзыв"
        onClick={go('reviews')}
      />
      <EmptyTile
        icon={<RulerIcon />}
        title="Пока нет мерок"
        action="Добавить мерку"
        onClick={go('measurements')}
      />
    </div>
  );
}

function EmptyTile({ icon, title, action, onClick }: EmptyTileProps) {
  if (onClick) {
    return (
      <button type="button" className={styles.tile} onClick={onClick}>
        <div className={styles.tileIcon}>{icon}</div>
        <p className={styles.tileTitle}>{title}</p>
        <span className={styles.tileAction}>
          <span>{action}</span>
          <ChevronRightIcon />
        </span>
      </button>
    );
  }

  return (
    <div className={styles.tile}>
      <div className={styles.tileIcon}>{icon}</div>
      <p className={styles.tileTitle}>{title}</p>
      <button type="button" className={styles.tileAction}>
        <span>{action}</span>
        <ChevronRightIcon />
      </button>
    </div>
  );
}
