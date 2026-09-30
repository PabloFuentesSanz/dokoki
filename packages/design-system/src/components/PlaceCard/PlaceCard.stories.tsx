import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { PlaceCard } from './PlaceCard';

const meta = {
  title: 'Viaje/PlaceCard',
  component: PlaceCard,
  args: { name: 'Fushimi Inari', area: 'Fushimi, Kioto', status: 'visited', photos: 48 },
  argTypes: { status: { control: 'inline-radio', options: ['visited', 'planned', 'wish'] } },
} satisfies Meta<typeof PlaceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visited: Story = {};
export const Planned: Story = {
  args: {
    name: 'Kinkaku-ji',
    area: 'Kita, Kioto',
    status: 'planned',
    day: 'Día 3',
    photos: undefined,
  },
};
export const Wish: Story = {
  args: {
    name: 'Machu Picchu',
    area: 'Cusco, Perú',
    status: 'wish',
    photos: undefined,
    lat: -13.1631,
    lng: -72.545,
    icon: 'compass',
  },
};
