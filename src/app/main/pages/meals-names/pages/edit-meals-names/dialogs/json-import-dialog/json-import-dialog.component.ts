import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard';
import { HSButtonModule } from 'src/app/core/components/button';
import { MealTypeEnum } from '../../../../enums/meal-type.enum';

const JSON_EXAMPLE = [
  {
    type: MealTypeEnum.BREAKFAST,
    calories: 400,
    protein: 27,
    fat: 10,
    carbs: 50,
    content: 'Вуглеводи (обери 1):\n* гречка 50 г\n* вівсянка 55 г\n\nБілок (обери 1–2):\n* яйця 2 шт\n* сир 5% 130 г\n\nЖири (обери 1):\n* горіхи 12 г',
  },
  {
    type: MealTypeEnum.LUNCH,
    calories: 430,
    protein: 32,
    fat: 12,
    carbs: 45,
    content: 'Вуглеводи (обери 1):\n* гречка 55 г\n* рис 55 г\n\nБілок (обери 1):\n* куряче філе 130 г\n* лосось 110 г\n\nОвочі:\n* будь-які свіжі 200–300 г',
  },
  {
    type: MealTypeEnum.DINNER,
    calories: 590,
    protein: 37,
    fat: 14,
    carbs: 50,
    content: 'Вуглеводи (обери 1):\n* картопля сира 180–220 г\n* батат 200 г\n\nБілок (обери 1):\n* риба 160 г\n* яйця 3 шт\n\nЖири (обери 1):\n* авокадо 70 г',
  },
];

@Component({
  selector: 'bk-json-import-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, HSButtonModule, ClipboardModule],
  templateUrl: './json-import-dialog.component.html',
  styleUrl: './json-import-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class JsonImportDialogComponent {
  jsonText = '';
  errorMessage = '';
  copied = false;

  readonly exampleJson = JSON.stringify(JSON_EXAMPLE, null, 2);

  constructor(
    private dialogRef: MatDialogRef<JsonImportDialogComponent>,
    private clipboard: Clipboard,
  ) {}

  copyExample(): void {
    this.clipboard.copy(this.exampleJson);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  apply(): void {
    this.errorMessage = '';
    const raw = this.jsonText.trim();

    if (!raw) {
      this.errorMessage = 'Вставте JSON у поле нижче.';
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const meals = Array.isArray(parsed) ? parsed : parsed.meals;

      if (!meals || !Array.isArray(meals) || meals.length === 0) {
        this.errorMessage = 'Невірний формат: очікується масив прийомів їжі.';
        return;
      }

      this.dialogRef.close(meals);
    } catch {
      this.errorMessage = 'Помилка парсингу JSON. Перевірте синтаксис.';
    }
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
