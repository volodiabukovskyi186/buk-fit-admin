import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'titleByEnum' })
export class TitleByEnumPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'NEW':
        return 'GENERAL.STATUS.NEW';

      case 'SENT':
        return 'GENERAL.STATUS.SENT';

      case 'WAIT_SENDING':
        return 'GENERAL.STATUS.WAIT_SENDING';

      case 'ADDED_TO_QUEUE':
        return 'GENERAL.STATUS.ADDED_TO_QUEUE';

      case 'IN_PROGRESS':
        return 'GENERAL.STATUS.IN_PROGRESS';

      case 'ANSWERED':
        return 'GENERAL.STATUS.ANSWERED';

      case 'CLIENT_REPLY':
        return 'GENERAL.STATUS.CLIENT_REPLY';

      case 'CLOSED':
        return 'GENERAL.STATUS.CLOSED';

      case 'ON_HOLD':
        return 'GENERAL.STATUS.ON_HOLD';

      case 'LEGAL_ENTITY':
        return 'GENERAL.STATUS.LEGAL_ENTITY';

      case 'INDIVIDUAL_ENTREPRENEUR':
        return 'GENERAL.STATUS.INDIVIDUAL_ENTREPRENEUR';

      case 'EXTERNAL':
        return 'GENERAL.STATUS.EXTERNAL';

      case 'INTERNAL':
        return 'GENERAL.STATUS.INTERNAL';

      case 'SUBSIDIARY':
        return 'GENERAL.STATUS.SUBSIDIARY';

      case 'MAIN':
        return 'GENERAL.STATUS.MAIN';

      case 'PRIVATE':
        return 'GENERAL.STATUS.PRIVATE';

      case 'PUBLIC':
        return 'GENERAL.STATUS.PUBLIC';

      case 'LOW':
        return 'GENERAL.STATUS.LOW';

      case 'IN_PROGRESS':
        return 'GENERAL.STATUS.IN_PROGRESS';

      case 'URGENT':
        return 'GENERAL.STATUS.URGENT';

      case 'MEDIUM':
        return 'GENERAL.STATUS.MEDIUM';

      case 'HIGH':
        return 'GENERAL.STATUS.HIGH'
        
      case 'ACTIVE':
        return 'GENERAL.STATUS.ACTIVE';

      case 'BLOCKED':
        return 'GENERAL.STATUS.BLOCKED';
    }

    return value;
  }
}