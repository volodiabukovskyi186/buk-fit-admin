import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getFirstsLetters'
})
export class GetFirstsLettersPipe implements PipeTransform {

  transform(value: string): string {
    if( !value || value === '') return value;
     
    const arrWords = value.split(' ');
    
    if (arrWords.length === 1) {
      return arrWords[0].split('')[0];
    } else if (arrWords.length >= 2) {
      return `${arrWords[0].split('')[0]}${arrWords[1].split('')[1]}`;
    }

    return value;
  }

}
