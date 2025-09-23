import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TableColumnDirective } from './table-column/table-column.directive';
import { TableGridComponent } from './table-grid.component';
import { TableCellComponent } from './table-cell/table-cell.component';
import { ColumnResizableDirective } from './column-resizable/column-resizable.directive';
import { CdkDrag, CdkDragHandle, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';


@NgModule({
  imports: [
    CdkDragHandle,
    CdkDragPreview,
    CdkDropList,
    CdkDrag,
    CommonModule,
    ScrollingModule, 
  ],
  declarations: [
    TableGridComponent,
    TableColumnDirective,
    TableCellComponent,
    ColumnResizableDirective
  ],
  exports: [
    TableGridComponent,
    TableColumnDirective,
    TableCellComponent
  ]
})
export class TableGridModule {}
