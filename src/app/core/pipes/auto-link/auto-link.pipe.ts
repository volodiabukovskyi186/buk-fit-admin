import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'MGAutoLink'
})
export class AutoLinkPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';


    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return value.replace(urlRegex, '<a href="$1" target="_blank" class="mg-autolink" rel="noopener noreferrer">$1</a>');
  }
}
