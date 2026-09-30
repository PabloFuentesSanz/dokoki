import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StatStrip } from './StatStrip';

const meta = {
  title: 'Mapa/StatStrip',
  component: StatStrip,
  args: {
    stats: [
      { value: '38 %', label: 'regiones' },
      { value: '11', label: 'ciudades' },
      { value: '2', label: 'viajes' },
      { value: '640', label: 'fotos' },
    ],
  },
} satisfies Meta<typeof StatStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Country: Story = {};
