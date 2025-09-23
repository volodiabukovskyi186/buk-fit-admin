import { Directive, Input, TemplateRef } from '@angular/core';
import { SortDirection } from '../enums/sort-direction.enum';

@Directive({
  selector: '[hsTableColumn]'
})
export class TableColumnDirective {
  @Input() fieldName = '';
  @Input() caption = '';
  @Input() cellTemplate!: TemplateRef<any>;
  @Input() cellAlternativeTemplate!: TemplateRef<any>;
  @Input() headerTemplate!: TemplateRef<any>;
  @Input() width!: string;
  @Input() sortDirection!: SortDirection | null;
  @Input() allowSorting!: boolean;
  @Input() allowResize!: boolean;
  @Input() cellClass = '';
  @Input() headerCellClass = '';
  @Input() contentAlign = 'left';
}
