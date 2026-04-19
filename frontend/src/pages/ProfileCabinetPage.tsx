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

type EmptyTileProps = {
  icon: ReactNode;
  title: string;
  action: string;
};

export default function ProfileCabinetPage() {
  return (
    <div className={styles.profileGrid}>
      <EmptyTile icon={<BagIcon />} title="Пока нет оформленных заказов" action="Перейти к покупкам" />
      <EmptyTile icon={<HangerIcon />} title="Пока нет купленных выкроек" action="Перейти к покупкам" />
      <EmptyTile icon={<GiftIcon />} title="Пока нет начисленных бонусов" action="Условия начисления" />
      <EmptyTile icon={<ChatIcon />} title="Пока нет оставленных отзывов" action="Приобрели выкройку? Оставьте свой отзыв" />
      <EmptyTile icon={<RulerIcon />} title="Пока нет мерок" action="Добавить мерку" />
    </div>
  );
}

function EmptyTile({ icon, title, action }: EmptyTileProps) {
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
