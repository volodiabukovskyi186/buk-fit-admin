import { moduleMetadata } from '@storybook/angular';

import { LoaderComponent } from './loader.component';
import { LoaderModule } from './loader.module';

export default {
  title: 'LoaderComponent',
  component: LoaderComponent,
  decorators: [
    moduleMetadata({ imports: [LoaderModule] })
  ],
}

export const primary = () => ({
  props: {},
  template: `
  <hs-loader-ui></hs-loader-ui>
  `
})
