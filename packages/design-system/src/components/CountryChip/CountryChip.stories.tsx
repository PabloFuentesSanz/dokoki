import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { CountryChip } from './CountryChip';

const meta = {
  title: 'Base/CountryChip',
  component: CountryChip,
  args: { code: 'JP', name: 'Japón' },
} satisfies Meta<typeof CountryChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unlocked: Story = {};
export const Pending: Story = { args: { code: 'PE', name: 'Perú', pending: true } };
export const Link: Story = { args: { code: 'PT', name: 'Portugal', onPress: () => undefined } };
