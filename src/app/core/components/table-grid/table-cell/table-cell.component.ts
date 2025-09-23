import { Component, Input, ViewEncapsulation } from '@angular/core';

import { TableColumnDirective } from '../table-column/table-column.directive';

@Component({
  selector: 'hs-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableCellComponent {

  @Input() data: any;
  @Input() column!: TableColumnDirective;
  @Input() rowIndex!: number;
  @Input() template: any;
}
