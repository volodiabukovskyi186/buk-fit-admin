import moment from 'moment';
import {Timestamp} from '@angular/fire/firestore';
import {USER_PAYMENTS_TARIFF_ENUM} from '../enums/user-payments-tariff.enum';

/**
 * Єдине джерело правди по продукту BUK Fit.
 *
 * Актуальна модель (з 27.08.2026): супровід 60 днів за 2 920 ₴.
 * Місячної моделі (1 920 ₴/міс) більше немає.
 *
 * Історичні оплати в Firestore не мігруються — вони лишаються зі своїми
 * цінами й періодами. Тут описано лише те, як рахуються НОВІ оплати.
 */

/** Тривалість одного періоду супроводу, днів. */
export const PAYMENT_PERIOD_DAYS = 60;

/** Ціна актуального продукту (60 днів), ₴. */
export const PRODUCT_PRICE = 2920;

/**
 * Ціни по тарифах.
 * BASIC — актуальний продукт (60 днів / 2 920 ₴), дефолт у всіх формах.
 * STANDARD і PREMIUM лишені зі старими цінами лише для сумісності зі
 * старими записами; у продажах зараз не використовуються.
 */
export const TARIFF_PRICES: Record<string, number> = {
  [USER_PAYMENTS_TARIFF_ENUM.BASIC]: PRODUCT_PRICE,
  [USER_PAYMENTS_TARIFF_ENUM.STANDARD]: 2880,
  [USER_PAYMENTS_TARIFF_ENUM.PREMIUM]: 4800,
};

/** Ціна тарифу або null, якщо тариф невідомий. */
export function getTariffPrice(tariff: string): number | null {
  return TARIFF_PRICES[tariff] ?? null;
}

/** Дата завершення періоду: fromDate + PAYMENT_PERIOD_DAYS днів. */
export function calcPaymentEndDate(fromDate: moment.MomentInput): moment.Moment {
  return moment(fromDate).add(PAYMENT_PERIOD_DAYS, 'days');
}

// ─── Прогрес 60-денного циклу ────────────────────────────────────────────────

/** За скільки днів до кінця відкривається вікно продовження. */
export const RENEWAL_WINDOW_DAYS = 10;

/** За скільки днів до кінця ситуація стає критичною. */
export const FINAL_DAYS = 3;

export type CycleState = 'UNKNOWN' | 'IN_PROGRESS' | 'RENEWAL' | 'FINAL' | 'OVERDUE';

export interface CycleProgress {
  state: CycleState;
  /** Який це день циклу, 1..PAYMENT_PERIOD_DAYS. null — немає дати оплати. */
  dayOfCycle: number | null;
  /** Скільки днів лишилось; відʼємне — стільки днів прострочено. */
  daysLeft: number | null;
  /** 0..100 — для прогрес-бару. */
  progressPercent: number;
  /** «День 23 / 60» або «Прострочено». */
  label: string;
  /** «залишилось 37 дн.» / «прострочено 4 дн.». */
  sublabel: string;
}

/**
 * Прогрес циклу рахується від дати завершення (payDate), а не від createdAt:
 * payDate — єдина дата, яку оновлює оплата, тож після продовження цикл
 * коректно починається заново.
 */
export function getCycleProgress(payDate?: Timestamp | null): CycleProgress {
  if (!payDate?.seconds) {
    return {
      state: 'UNKNOWN',
      dayOfCycle: null,
      daysLeft: null,
      progressPercent: 0,
      label: '—',
      sublabel: 'немає дати оплати',
    };
  }

  const daysLeft = Math.floor((payDate.seconds * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      state: 'OVERDUE',
      dayOfCycle: PAYMENT_PERIOD_DAYS,
      daysLeft,
      progressPercent: 100,
      label: 'Прострочено',
      sublabel: `${Math.abs(daysLeft)} ${dayWord(Math.abs(daysLeft))} тому`,
    };
  }

  const dayOfCycle = Math.min(Math.max(PAYMENT_PERIOD_DAYS - daysLeft, 1), PAYMENT_PERIOD_DAYS);
  const state: CycleState =
    daysLeft <= FINAL_DAYS ? 'FINAL'
      : daysLeft <= RENEWAL_WINDOW_DAYS ? 'RENEWAL'
        : 'IN_PROGRESS';

  return {
    state,
    dayOfCycle,
    daysLeft,
    progressPercent: Math.round((dayOfCycle / PAYMENT_PERIOD_DAYS) * 100),
    label: `День ${dayOfCycle} / ${PAYMENT_PERIOD_DAYS}`,
    sublabel: `залишилось ${daysLeft} ${dayWord(daysLeft)}`,
  };
}

function dayWord(days: number): string {
  return days === 1 ? 'день' : 'дн.';
}
