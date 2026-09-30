import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Avatar } from './Avatar';

const meta = {
  title: 'Base/Avatar',
  component: Avatar,
  args: { name: 'Marta Gil', size: 36 },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { name: 'Lucía Fuente', size: 56 } };
