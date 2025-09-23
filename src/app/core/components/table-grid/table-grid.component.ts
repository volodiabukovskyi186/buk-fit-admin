import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { SortDirection } from './enums/sort-direction.enum';
import { TableGridDataTypeEnum } from './enums/table-grid-data-type.enum';
import { SortingColumn } from './interfaces/sorting-column.interface';
import { SortService } from './services/sort.service';
import { TableColumnDirective } from './table-column/table-column.directive';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, CdkDragStart, CdkDragPreview} from '@angular/cdk/drag-drop';

@Component({
  selector: 'hs-table-grid',
  templateUrl: './table-grid.component.html',
  styleUrls: ['./table-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SortService]
})
export class TableGridComponent<T> implements AfterViewInit, OnDestroy {
  @ViewChild(CdkDropList) cdkDropList!: CdkDropList;
  @ViewChild('preview', {read: ElementRef}) preview!: ElementRef<HTMLElement>;
  @ContentChildren(TableColumnDirective) tableColumns!: QueryList<TableColumnDirective>;
  @ViewChild(CdkVirtualScrollViewport, { static: false }) viewPort!: CdkVirtualScrollViewport;
  @ViewChild('tableElement') tableElement!: ElementRef<HTMLTableElement>;

  @Input()
  set data(value: T[]) {
    // this.sortedData = [];
    // this.initData = [];
    
    this.setOptionsRule(value);
    this.selectedIndex = this.selectedRowIndex ?? null;
    this.initData = JSON.parse(JSON.stringify(value));
    this.sortedData = JSON.parse(JSON.stringify(value));
   
    
    setTimeout(() => {
      this.setTableHeight()
      this.changeDetectorRef.detectChanges();
     
    }, 200);
   
  }

  @Input() allowMultiplySorting!: boolean;
  @Input() dataType: TableGridDataTypeEnum = TableGridDataTypeEnum.LOCAL;
  @Input() selectedRowIndex: number | undefined = undefined;
  @Input() isRowToggleEnabled = true;
  @Input() rowHeight = 40;
  @Input() options: any;
  @Input() fullHeight = false;
  @Input() isDrag = false;

  @Output() sort: EventEmitter<SortingColumn[]> = new EventEmitter<SortingColumn[]>();
  @Output() doubleClickEvent: EventEmitter<T> = new EventEmitter<T>();
  @Output() clickOnRow: EventEmitter<T> = new EventEmitter<T>();
  @Output() loadMore: EventEmitter<void> = new EventEmitter<void>();
  @Output() selectRow: EventEmitter<T> = new EventEmitter<T>();
  @Output() dragedListEvent: EventEmitter<T[]> = new EventEmitter<T[]>();

  selectedIndex: number | null = null;
  sortedData: T[] = [];
  isScrolled = false;
  showDropList = true;

  private initData: T[] = [];
  private subscription: Subscription = new Subscription();

  @HostBinding('style.--hs-table-grid-header-offset') tableGridHeaderOffset: any;
  @HostBinding('style.height.px') tableHeight = 600;

  constructor(
    private sortService: SortService<T>,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngAfterViewInit(): void {
    const stream$ = this.viewPort.renderedRangeStream.pipe(
      // debounceTime(10)
    ).subscribe(() => {
      this.viewPort.checkViewportSize();
      this.tableGridHeaderOffset = -(this.viewPort.getOffsetToRenderedContentStart() || 0) + 'px';
    });

    this.subscription.add(stream$);
  }

  trackByFn(index: number): number {
    return index;
  }

  sortByColumn(currentColumn: TableColumnDirective): void {
   
    
    if (!currentColumn.allowSorting) {
      return;
    }

    currentColumn.sortDirection = currentColumn.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;

    const sortingColumns: SortingColumn[] = [];

    if (this.allowMultiplySorting) {
      this.tableColumns.forEach((tableColumn: TableColumnDirective) => {
        if (tableColumn.allowSorting && tableColumn.sortDirection) {
          
          
          sortingColumns.push({
            prop: tableColumn.fieldName,
            dir: tableColumn.sortDirection
          });
        }
      });
    } else {
      console.log('tableColumn', currentColumn);
      sortingColumns.push({
        prop: currentColumn.fieldName,
        dir: currentColumn.sortDirection
      });
      this.tableColumns.forEach((tableColumn: TableColumnDirective) => {
        if (currentColumn.fieldName !== tableColumn.fieldName) {
          tableColumn.sortDirection = null;
        }
      });
    }


    if (this.dataType === TableGridDataTypeEnum.LOCAL) {
      this.sortedData = this.initData.sort(this.sortService.sortMultiplyColumns(sortingColumns));
    }

    this.sort.emit(sortingColumns);
  }

  changeSelectRow(row: T, index: number): void {
    if (this.isRowToggleEnabled && this.selectedIndex === index) {
      this.selectedIndex = null;
    } else {
      this.selectedIndex = index;
      this.selectRow.emit(row);
    }
  }

  rowDoubleClick(row: T): void {
    this.doubleClickEvent.next(row);
  }

  rowClick(row: T): void {
    this.clickOnRow.next(row);
  }

  clearSelectedRow(): void {
    this.selectedIndex = null;
  }

  clearRowByIndex(rowIndex: number): void {
    if (this.selectedIndex === rowIndex) {
      this.selectedIndex = null;
    }
  }

  scrolledIndexChange(index: number) {
    this.isScrolled = index > 0;
    const end = this.viewPort.getRenderedRange().end;
    const total = this.viewPort.getDataLength();

    if (end === total && this.isScrolled) {
      this.loadMore.emit();
    }
  }

  dropItem(event: CdkDragDrop<string[]> | any) {
    moveItemInArray(this.sortedData, event.previousIndex, event.currentIndex);
    
    this.sortedData = [...this.sortedData];
    this.dragedListEvent.emit(this.sortedData);
    this.changeDetectorRef.detectChanges();    
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setOptionsRule(rowList: T[] = []): void {
    if (!this.options?.length) return;

    rowList.map((item: any) => {
      const index = this.options.findIndex((option: any) => option.condition === item?.condition);

      if (index !== -1) {
        item['rule'] = this.options[index]?.rule;
      }
    });
  }

  private setTableHeight(): void {
  
    this.tableHeight = this.tableElement.nativeElement.clientHeight + 5;
    this.changeDetectorRef.markForCheck();
  }


}
