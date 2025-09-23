import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHTML'
})
export class StripHTMLPipe implements PipeTransform {

  transform(value: string): string {
    return this.stripHtmlTags(value);
  }

  private stripHtmlTags(html: string): string {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = html;
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }
}
