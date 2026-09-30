import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RouteMarker } from './RouteMarker';

const meta = {
  title: 'Firma/RouteMarker',
  component: RouteMarker,
  args: { n: 1, tone: 'red' },
} satisfies Meta<typeof RouteMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Done: Story = {};
export const Planned: Story = { args: { n: 3, tone: 'blue' } };
