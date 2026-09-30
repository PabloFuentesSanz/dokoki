import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Coordinate } from './Coordinate';

const meta = {
  title: 'Base/Coordinate',
  component: Coordinate,
  args: { lat: 34.9671, lng: 135.7727 },
} satisfies Meta<typeof Coordinate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Kioto: Story = {};
export const Santiago: Story = { args: { lat: -33.45, lng: -70.66 } };
