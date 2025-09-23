import { SortDirection } from '../enums/sort-direction.enum';

export interface SortingColumn {
  dir: SortDirection,
  prop: string
}
