import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { AmountInput } from './AmountInput';

const meta = {
  title: 'Formularios/AmountInput',
  component: AmountInput,
  args: { currency: 'EUR', value: '42,50' },
} satisfies Meta<typeof AmountInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithConversion: Story = {
  args: { currency: 'JPY', value: '4200', hint: '≈ 25,40 EUR al cambio del 12.04.2024' },
};
