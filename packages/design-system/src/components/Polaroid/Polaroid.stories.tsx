import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Polaroid } from './Polaroid';

const meta = {
  title: 'Firma/Polaroid',
  component: Polaroid,
  args: { caption: 'Fushimi Inari', lat: 34.9671, lng: 135.7727 },
  argTypes: { tilt: { control: 'inline-radio', options: ['none', 'left', 'right'] } },
} satisfies Meta<typeof Polaroid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {};
export const Featured: Story = { args: { tape: true, tilt: 'left', width: 220 } };
export const FeaturedRight: Story = { args: { caption: 'Arashiyama', tape: true, tilt: 'right' } };
