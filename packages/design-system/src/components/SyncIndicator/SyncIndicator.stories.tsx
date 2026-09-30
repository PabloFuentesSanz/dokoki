import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { SyncIndicator } from './SyncIndicator';

const meta = {
  title: 'Base/SyncIndicator',
  component: SyncIndicator,
  args: { state: 'synced' },
  argTypes: { state: { control: 'inline-radio', options: ['synced', 'pending', 'offline'] } },
} satisfies Meta<typeof SyncIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Synced: Story = {};
export const Pending: Story = { args: { state: 'pending' } };
export const Offline: Story = { args: { state: 'offline' } };
