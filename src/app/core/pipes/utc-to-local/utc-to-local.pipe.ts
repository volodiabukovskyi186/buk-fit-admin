import { Pipe, PipeTransform } from '@angular/core';

import moment from 'moment';

@Pipe({
  name: 'HSUtcToLocal'
})
export class HSUtcToLocalPipe implements PipeTransform {
  transform(value: any, format: string = 'DD:MM:YYYY HH:mm'): any {

    const parsedDateTime =  moment('07-18-2013 12:00', 'MM-DD-YYYY HH:mm')
 
    console.log('value', moment(parsedDateTime).add(2, 'hours'));
    // console.log('value', moment.utc(value).local().format(format));
    
    // Перевірка на валідну дату
    if (!moment(value).isValid()) {
      return value;
    }

    // Конвертуємо дату з UTC в локальний час
    return moment.utc(value).local().format(format);
  } 
}
