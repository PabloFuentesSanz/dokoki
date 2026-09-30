import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { DebtRow } from './DebtRow';

const meta = {
  title: 'Viaje/DebtRow',
  component: DebtRow,
  args: { from: 'Tú', to: 'Lucía', amount: 32.5, currency: 'EUR' },
  decorators: [
    (Story) => (
      <View style={{ width: 360 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof DebtRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const YouOwe: Story = {};
export const OwedToYou: Story = { args: { from: 'Carlos', to: 'Tú', amount: 18 } };
export const Settled: Story = { args: { settled: true } };
