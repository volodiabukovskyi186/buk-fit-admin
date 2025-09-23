import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'hs-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaginationComponent implements OnInit {
  @Input() set totalElements(value) {
    this.elements = value;

    this.initPagination();
  };

  @Input() set currentPage(value: number) {
    if (this.page === 0) {
      this.page = value;
    }
  };

  @Input() limit!: number;
  @Input() isRowsSelect = false;

  @Output() pageSelected: EventEmitter<number> = new EventEmitter<number>();
  @Output() changeRowsCount: EventEmitter<number> = new EventEmitter<number>();

  elements = 0;
  page = 0;
  totalPages!: number;
  pages: number[] = [];
  rowPerPage: number[] = [5, 10, 15, 20];

  ngOnInit(): void {
    if (!this.page) {
      this.page = 1;
    }
  }

  changeRowCount(count: number): void {
    this.limit = count;
    this.changeRowsCount.emit(count);
    this.initPagination();
  }

  nextPage(): void {
    this.page += 1;
    this.pageSelected.emit(this.page);
  }

  prePage(): void {
    this.page -= 1;
    this.pageSelected.emit(this.page);
  }

  private initPagination(): void {
    this.totalPages = Math.ceil(this.elements / this.limit);
  }

  // getPages(): number[] {
  //   const pages: number[] = [];
  //   let startPage = 1;
  //   let endPage = this.totalPages;
  //   let countStartPages = 1;
  //   let countTotalPages = 2;
  //   let countEndPages = 3;

  //   if(this.page > this.totalPages - 3) {
  //     countStartPages = 2;

  //     countTotalPages = 3;
  //     countEndPages = 4;
  //   }

  //   if (this.totalPages > 3) {
  //     if (this.page <= 2) {
  //       endPage = countEndPages;
  //     } else if (this.page >= this.totalPages - 2) {
  //       startPage = this.totalPages - countTotalPages;
  //     } else {
  //       startPage = this.page - 1;
  //       endPage = this.page + countStartPages;
  //     }

  //   }

  //   for (let i = startPage; i <= endPage; i++) {
  //     pages.push(i);
  //   }

  //   return pages;
  // }

  // selectPage(page: number): void {    
  //   this.page = page; 
  //   this.pages = this.getPages();
  //   this.pageSelected.emit(page);
  // }
}
