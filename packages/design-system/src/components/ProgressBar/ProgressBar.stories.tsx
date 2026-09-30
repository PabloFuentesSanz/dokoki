import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Mapa/ProgressBar',
  component: ProgressBar,
  args: { label: 'Japón', value: 38, detail: '18 de 47 regiones' },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } } },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Country: Story = {};
export const World: Story = { args: { label: 'Mundo', value: 12, detail: '24 de 195 países' } };
