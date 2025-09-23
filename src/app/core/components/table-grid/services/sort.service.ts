import { Injectable } from '@angular/core';
import { SortDirection } from '../enums/sort-direction.enum';
import { SortingColumn } from '../interfaces/sorting-column.interface';


@Injectable()
export class SortService<T> {

  constructor() { }

  sortMultiplyColumns(sortingColumns: SortingColumn[]) {
    return (rowA: T, rowB: T) => {
      let result = 0;

      sortingColumns.forEach((sortingColumn: SortingColumn) => {
        if (result === 0) {
          result = this.sortColumn(sortingColumn)(rowA, rowB);
        }
      });

      return result;
    };
  }

  sortColumn(sortColumn: SortingColumn): any {
    const sortOrder = sortColumn.dir === SortDirection.ASC ? 1 : -1;
    const property = sortColumn.prop;

    return (rowA: any, rowB: any) => {
      const result = (rowA[property] < rowB[property]) ? -1 : (rowA[property] > rowB[property]) ? 1 : 0;
      return result * sortOrder;
    };
  }
}
