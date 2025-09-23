export enum PAYMENT_DATE_ENUM {
  ON_TIME = 'ON_TIME', // Ще є час до оплати
  WARNING = 'WARNING', // Залишилося 3 дні до оплати
  OVERDUE = 'OVERDUE'  // Час оплати вже сплив
}
