# CLAUDE.md — buk-fit-admin

## Проект
Angular 18 адмін-панель для фітнес-сервісу. Backend — Firebase (Firestore + Auth). Деплой на Heroku.

## Команди
```bash
npm start        # запуск dev-сервера (node server.js)
ng build         # production build
ng test          # unit тести (Karma/Jasmine)
```

## Стек
- **Angular 18** — standalone компоненти там де нові, модулі де старі
- **Firebase / Firestore** — `@angular/fire` v18, модульний API (`collection`, `doc`, `getDocs` і т.д.)
- **Angular Material** — datepicker, dialog, snackbar, paginator
- **Moment.js** — робота з датами у формах і фільтрах
- **Chart.js** — графіки в статистиці
- **Кастомна UI-бібліотека** — `hs-*` компоненти (`hs-select`, `hs-status`, `hs-table-grid`, `hs-form-field`, `hs-button` і т.д.) з `src/app/core/components/`

## Структура
```
src/app/
  core/
    components/      # кастомні UI компоненти (hs-*)
    enums/           # USER_STATUS_ENUM, USER_ROLES_ENUM, TRAINING_TYPE_ENUM тощо
    interfaces/      # UserInterface, ClientInterface
    services/        # auth, coaches, exercises, date тощо
  main/
    pages/
      users/         # список + деталі користувача
      statistics/    # статистика оплат
      exercises/     # вправи (зал)
      exercises-home/ # домашні вправи
      meals-names/   # назви страв
      coaches/       # тренери
      deleted-users/ # видалені користувачі
      statistics/    # графіки та список оплат (users-payments)
```

## Firebase / Дати — важливі правила

### Читання з Firestore
Firestore повертає `Timestamp` об'єкти. Перед тим як встановити в `FormControl` датпікера — конвертувати:
```ts
if (this.user?.payDate?.seconds) {
  this.formGroup.get('payDate').setValue(new Date(this.user.payDate.seconds * 1000));
}
```

### Збереження в Firestore
Перед збереженням конвертувати Date/Moment → `Timestamp`:
```ts
const payDate = value ? Timestamp.fromDate(new Date(value)) : null;
```

Поля з датами в `ClientInterface`: `createdAt`, `payDate`, `startDayFrom` — всі зберігаються як `Timestamp`.

## Компонент hs-status
- Використовувати `[type]="data?.status"` (є сеттер → викликає `setData()`)
- **НЕ** використовувати `[statusType]="data?.status"` — це звичайний `@Input()` без сеттера, компонент не оновлюється при перерендері (проблема з `trackByFn` по індексу в `hs-table-grid`)

## Компонент hs-select
- `[value]="null"` не працює для опції "Всі/скинути" — використовувати `value=""`
- Нормалізація в TS: `const val = this.formGroup.get('field').value || null`
- Подія зміни: `(selectionChange)="handler()"`, не `(valueChange)`

## hs-table-grid
- `trackByFn` відстежує рядки по **індексу** — при зміні даних компоненти перевикористовуються
- `cellData` у `ng-template` — це **весь об'єкт рядка**, не значення поля `fieldName`
- `fieldName` на колонках має бути унікальним в межах одного `hs-table-grid`
- `ng-template` з однаковою назвою (`#payDateTmpl`) в одному view конфліктують — другий перезаписує перший

## Колекції Firestore
- `clients` — користувачі (клієнти)
- `admins` — адміни, менеджери, тренери
- `users-payments` — оплати клієнтів
- `exercises` — вправи
- `calories` — калорії
- `meals` — прийоми їжі

## Ролі користувачів (USER_ROLES_ENUM)
`SUPER_ADMIN`, `MANAGER`, `TRAINER`

## Статуси клієнтів (USER_STATUS_ENUM)
`ACTIVE`, `NEW`, `BLOCKED`, `DELETED`, `DELAY_START`

`DELAY_START` — клієнт зареєстрований, але тренування починаються з `startDayFrom` дати.
