import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BKExercisesHelperService {

  private readonly restTimeOptions = [
    { text: 'Без відпочинку' },
    { text: 'До 30 секунд' },
    { text: '30 секунд' },
    { text: '45 секунд' },
    { text: '1 хв' },
    { text: '1 хв 30 сек' },
    { text: '1 хв - 2хв' },
    { text: '2 хв' },
    { text: '2 хв 30 сек' },
    { text: '2 хв - 3хв' },
    { text: '3 хв' },
    { text: '4 хв' },
    { text: '5 хв' }
  ];

  private readonly repeatAndCountOptions = [
    { text: '1 x 10' },
    { text: '2 x 10' },
    { text: '3 x 10' },
    { text: '4 x 10' },
    { text: '1 x 12' },
    { text: '2 x 12' },
    { text: '3 x 12' },
    { text: '4 x 12' },
    { text: '1 x 15' },
    { text: '2 x 15' },
    { text: '3 x 15' },
    { text: '4 x 15' },
    { text: '1 x 18' },
    { text: '2 x 18' },
    { text: '3 x 18' },
    { text: '4 x 18' },
    { text: '1 x 20' },
    { text: '2 x 20' },
    { text: '3 x 20' },
    { text: '4 x 20' },
    { text: '1 x 20 секунд' },
    { text: '1 x 30 секунд' },
    { text: '1 x 40 секунд' },
    { text: '1 x 50 секунд' },
    { text: '1 x 60 секунд' },
    { text: '2 x 20 секунд' },
    { text: '2 x 30 секунд' },
    { text: '2 x 40 секунд' },
    { text: '2 x 50 секунд' },
    { text: '2 x 60 секунд' },
    { text: '3 x 20 секунд' },
    { text: '3 x 30 секунд' },
    { text: '3 x 40 секунд' },
    { text: '3 x 50 секунд' },
    { text: '3 x 60 секунд' },
    { text: '4 x 20 секунд' },
    { text: '4 x 30 секунд' },
    { text: '4 x 40 секунд' },
    { text: '4 x 50 секунд' },
    { text: '4 x 60 секунд' },

  ];

  private readonly weightOptions = [
    { text: 'Власна вага' },
    { text: 'Без ваги' },
    { text: '1 кг' },
    { text: '2 кг' },
    { text: '3 кг' },
    { text: '4 кг' },
    { text: '5 кг' },
    { text: '6 кг' },
    { text: '7 кг' },
    { text: '8 кг' },
    { text: '9 кг' },
    { text: '10 кг' },
    { text: '11 кг' },
    { text: '12 кг' },
    { text: '13 кг' },
    { text: '14 кг' },
    { text: '15 кг' },
    { text: '16 кг' },
    { text: '17 кг' },
    { text: '18 кг' },
    { text: '19 кг' },
    { text: '20 кг' },
    { text: '21 кг' },
    { text: '22 кг' },
    { text: '23 кг' },
    { text: '24 кг' },
    { text: '25 кг' },
    { text: '26 кг' },
    { text: '27 кг' },
    { text: '28 кг' },
    { text: '29 кг' },
    { text: '30 кг' },
  ];

  constructor() { }

  getRestsTime(): any[] {
    return this.restTimeOptions;
  }

  getWeights(): any[] {
    return this.weightOptions;
  }

  getRepeatCounts(): any[] {
    return this.repeatAndCountOptions;
  }
}
