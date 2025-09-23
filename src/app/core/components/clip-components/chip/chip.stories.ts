import { boolean, text } from '@storybook/addon-knobs';
import { ChipComponent } from './chip.component';
import { moduleMetadata } from '@storybook/angular';
import { ChipModule } from './chip.module';

export default {
  title: 'ChipComponent',
  component: ChipComponent,
  decorators: [
    moduleMetadata({ imports: [ChipModule] }),
  ],
};

export const withoutIcon = () => ({
  moduleMetadata: {
    imports: [],
  },
  props: {
    value: text('value', 'A'),
    disabled: boolean('disabled', false),
    removable: boolean('removable', false),
    selectable: boolean('selectable', false),
    selected: boolean('selected', false),
  },
  template:
    "<hs-chip-ui><span label>This is label without icon</span></hs-chip-ui>"
});
export const withIcon = () => ({
  moduleMetadata: {
    imports: [],
  },
  props: {
    value: text('value', 'A'),
    disabled: boolean('disabled', false),
    removable: boolean('removable', false),
    selectable: boolean('selectable', false),
    selected: boolean('selected', false),
  },
  template:
    "<hs-chip-ui><i icon class=\"hs-icon hs-icon-control-plan\"></i><span label>This is label with icon</span></hs-chip-ui>"
});
