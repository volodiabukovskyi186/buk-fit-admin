import { InjectionToken, QueryList } from '@angular/core';
import { NgControl } from '@angular/forms';

import { HSSelectOptionComponent } from './text-select-option/text-select-option.component';

export interface HSSelectParentComponent {
  multiple: boolean;
  options: QueryList<HSSelectOptionComponent>,
  ngControl?: NgControl,
  value: any
}

export const HS_SELECT_PARENT_COMPONENT = new InjectionToken<HSSelectParentComponent>('HS_SELECT_OPTION_PARENT_COMPONENT');
