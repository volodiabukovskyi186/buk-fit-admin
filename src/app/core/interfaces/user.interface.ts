import {USER_ROLES_ENUM} from "../enums/users-roles.enum";
import {USER_STATUS_ENUM} from "../enums/users-status.enum";
import {Timestamp} from "@angular/fire/firestore";
import {TRAINING_TYPE_ENUM} from '../enums/training-type.enum';
import {PAYMENT_DATE_ENUM} from '../enums/payment-date/payment-date.enum';
import {CycleProgress} from '../config/payment.config';
import {ClientActivity} from '../config/activity.config';

export interface UserInterface {
  createdAt: Timestamp;
  id: string;
  status: USER_STATUS_ENUM;
  role: USER_ROLES_ENUM;
  email: string;
  phone: string;
  name: string;
  secondName: string;
}

export interface TgUser {
  username: string;
  id?: number | string;
}

export interface ClientInterface {
  createdAt: Timestamp;
  payDate: Timestamp;
  id: string;
  coachId: string | null;
  status: USER_STATUS_ENUM;
  role: USER_ROLES_ENUM;
  trainingType: TRAINING_TYPE_ENUM;
  email: string;
  phone: string;
  name: string;
  secondName: string;
  tgUser: TgUser | null;
  tgChatId: string | number | null;
  programUpdatedAt?: string;
  startDayFrom?: Timestamp | null;
  /** Останнє відкриття клієнтського застосунку. Пише buk-fit-client. */
  lastSeenAt?: Timestamp | null;
}

export interface EnrichedClientInterface extends ClientInterface {
  paymentStatus: PAYMENT_DATE_ENUM;
  programUpdateStatus: 'NORMAL' | 'WARNING' | 'DANGER';
  /** Прогрес поточного 60-денного циклу. */
  cycle: CycleProgress;
  /** Активність у клієнтському застосунку. */
  activity: ClientActivity;
  /** Скільки днів клієнт загалом у сервісі (для тултипа). */
  daysTotal?: number;
}
