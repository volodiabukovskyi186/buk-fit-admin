export interface UserPaymentTemplate {
  tariff: string | null;
  updatedAt: Date | null;
  comment: string;
  price: number | null;
  fromDate: Date | null;
  toDate: Date | null;
  payedDate: Date | null;
  id: string;
  userId: string;
  status: string
  isPayed: boolean;
}
