import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { Timestamp } from 'firebase/firestore';

@Pipe({
  name: 'dateFirebase',
  standalone: true,
})
export class DateFirebasePipe implements PipeTransform {
  transform(value: any, format: string = 'DD-MM-YYYY'): string | null {
    if (!value) return null;


    if (value instanceof Timestamp) {
      return moment(value.toDate()).format(format);
    }

    if (value instanceof Date) {
      return moment(value).format(format);
    }

    if (moment.isMoment(value)) {
      return value.format(format);
    }

    // 👇 Додай цей блок для plain object { seconds, nanoseconds }
    if (value?.seconds !== undefined && value?.nanoseconds !== undefined) {
      const date = new Date(value.seconds * 1000);
      return moment(date).format(format);
    }

    return null;
  }
}
