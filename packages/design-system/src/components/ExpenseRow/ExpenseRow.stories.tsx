import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { ExpenseRow } from './ExpenseRow';

const meta = {
  title: 'Viaje/ExpenseRow',
  component: ExpenseRow,
  args: {
    title: 'Ramen Ichiran',
    payer: 'Lucía',
    amount: 4200,
    currency: 'JPY',
    converted: '≈ 25,40 EUR',
    category: 'food',
    date: '12 abr.',
    split: 'a partes iguales',
  },
  argTypes: {
    category: { control: 'select', options: ['food', 'transport', 'stay', 'activity', 'other'] },
  },
  decorators: [
    (Story) => (
      <View style={{ width: 360 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ExpenseRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Food: Story = {};
export const Stay: Story = {
  args: {
    title: 'Ryokan Yachiyo',
    payer: 'Tú',
    amount: 480,
    currency: 'EUR',
    converted: undefined,
    category: 'stay',
    split: 'entre 2',
  },
};
