import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MapLegend } from './MapLegend';

const meta = {
  title: 'Mapa/MapLegend',
  component: MapLegend,
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
