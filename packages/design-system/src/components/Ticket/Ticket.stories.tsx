import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Ticket } from './Ticket';

const meta = {
  title: 'Firma/Ticket',
  component: Ticket,
  args: {
    kind: 'flight',
    title: 'MAD → NRT',
    provider: 'Iberia',
    meta: '10.04.2024, 13:25, 14 h 5 min',
    code: 'X7K2PQ',
    stubLabel: 'Localizador',
    time: '13:25',
  },
  argTypes: { kind: { control: 'inline-radio', options: ['flight', 'train', 'hotel', 'entry'] } },
} satisfies Meta<typeof Ticket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Flight: Story = {};
export const Hotel: Story = {
  args: {
    kind: 'hotel',
    title: 'Ryokan Yachiyo',
    provider: 'Booking',
    meta: '10 → 14 abril, 4 noches',
    code: '88213',
    stubLabel: 'Reserva',
    time: undefined,
  },
};
export const Unconfirmed: Story = {
  args: {
    kind: 'train',
    title: 'Kioto → Nara',
    provider: 'JR West',
    meta: '12.04.2024, 45 min',
    code: 'POR REVISAR',
    planned: true,
  },
};
