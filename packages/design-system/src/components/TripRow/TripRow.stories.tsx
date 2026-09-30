import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { TripRow } from './TripRow';

const meta = {
  title: 'Viaje/TripRow',
  component: TripRow,
  args: { n: 2, title: 'Kioto, Nara y Osaka', meta: 'abril 2024, 9 días, 312 fotos' },
} satisfies Meta<typeof TripRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Past: Story = {};
export const Upcoming: Story = {
  args: { n: 3, title: 'Lima y Cusco', meta: 'octubre 2026, 14 días', planned: true },
};
export const List: Story = {
  render: () => (
    <View style={{ width: 360 }}>
      <TripRow n={3} title="Lima y Cusco" meta="octubre 2026, 14 días" planned />
      <TripRow n={2} title="Kioto, Nara y Osaka" meta="abril 2024, 9 días, 312 fotos" />
      <TripRow n={1} title="Lisboa y Sintra" meta="julio 2019, 5 días, 140 fotos" />
    </View>
  ),
};
