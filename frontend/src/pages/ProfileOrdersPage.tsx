import { useState } from 'react';

import styles from './AuthPage.module.css';
import {
  BagIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
} from './authPageData';

export default function ProfileOrdersPage() {
  const [search, setSearch] = useState('');

  return (
    <div className={styles.ordersPage}>
      <label className={styles.ordersSearchBar}>
        <SearchIcon />
        <input
          className={styles.ordersSearchInput}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск заказа"
          aria-label="Поиск заказа"
        />
      </label>

      <div className={styles.ordersFiltersBar}>
        <button type="button" className={styles.ordersFilterButton}>
          <BagIcon />
          <span>Все</span>
          <ChevronDownIcon />
        </button>
        <button type="button" className={styles.ordersFilterButton}>
          <CalendarIcon />
          <span>За все время</span>
          <ChevronDownIcon />
        </button>
      </div>

      <div className={styles.ordersPanel}>
        <div className={styles.ordersEmptyState}>
          <div className={styles.ordersEmptyIcon}>
            <BagIcon />
          </div>
          <p className={styles.ordersEmptyTitle}>Не найдено заказов</p>
          <a href="/patterns" className={styles.ordersCatalogLink}>
            <span>Перейти в каталог</span>
            <ChevronRightIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
