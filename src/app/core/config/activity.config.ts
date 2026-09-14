import moment from 'moment';
import {Timestamp} from '@angular/fire/firestore';

/**
 * Активність клієнта в клієнтському застосунку.
 *
 * Джерело — поле `lastSeenAt` у документі `clients/{uid}`: його пише сам
 * клієнтський застосунок (buk-fit-client) при відкритті, не частіше
 * ніж раз на 30 хв. У клієнтів, які не заходили після впровадження цього
 * поля, воно порожнє — це не помилка, а «немає даних».
 */

/** До скількох днів включно клієнт вважається активним. */
export const ACTIVITY_ACTIVE_DAYS = 1;

/** До скількох днів включно — «підстигає», далі вважаємо, що злився. */
export const ACTIVITY_IDLE_DAYS = 4;

export type ActivityState = 'ACTIVE' | 'IDLE' | 'LOST' | 'NEVER';

export interface ClientActivity {
  state: ActivityState;
  /** Скільки повних днів тому був останній вхід; null — не заходив жодного разу. */
  daysAgo: number | null;
  /** Короткий підпис для таблиці: «сьогодні», «вчора», «3 дн. тому», «12.09.2026». */
  label: string;
  /** Розгорнутий підпис для тултипа. */
  title: string;
}

export function getClientActivity(lastSeenAt?: Timestamp | null): ClientActivity {
  if (!lastSeenAt?.seconds) {
    return {
      state: 'NEVER',
      daysAgo: null,
      label: 'не заходив',
      title: 'Жодного входу в застосунок не зафіксовано',
    };
  }

  const last = moment(lastSeenAt.seconds * 1000);
  const daysAgo = moment().startOf('day').diff(last.clone().startOf('day'), 'days');

  const state: ActivityState =
    daysAgo <= ACTIVITY_ACTIVE_DAYS ? 'ACTIVE'
      : daysAgo <= ACTIVITY_IDLE_DAYS ? 'IDLE'
        : 'LOST';

  return {
    state,
    daysAgo,
    label: formatDaysAgo(daysAgo, last),
    title: `Останній вхід: ${last.format('DD.MM.YYYY HH:mm')}`,
  };
}

function formatDaysAgo(daysAgo: number, last: moment.Moment): string {
  if (daysAgo <= 0) return 'сьогодні';
  if (daysAgo === 1) return 'вчора';
  if (daysAgo <= 13) return `${daysAgo} дн. тому`;
  return last.format('DD.MM.YYYY');
}
