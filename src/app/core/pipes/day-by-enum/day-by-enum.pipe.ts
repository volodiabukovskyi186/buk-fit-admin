import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'HSdayByEnum'
})
export class DayByEnumPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {

      case 'MONDAY':
        return 'GENERAL.WEEK_DAY.MONDAY';

      case 'TUESDAY':
        return 'GENERAL.WEEK_DAY.TUESDAY';

      case 'WEDNESDAY':
        return 'GENERAL.WEEK_DAY.WEDNESDAY';

      case 'THURSDAY':
        return 'GENERAL.WEEK_DAY.THURSDAY';

      case 'FRIDAY':
        return 'GENERAL.WEEK_DAY.FRIDAY';

      case 'SATURDAY':
        return 'GENERAL.WEEK_DAY.SATURDAY';

      case 'SUNDAY':
        return 'GENERAL.WEEK_DAY.SUNDAY';
    }

    return value;
  }

}
