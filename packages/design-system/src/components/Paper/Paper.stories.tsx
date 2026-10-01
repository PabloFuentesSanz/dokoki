import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from 'react-native';
import { colors, spacing, typography } from '../../tokens';
import { Paper } from './Paper';

const meta = {
  title: 'Base/Paper',
  component: Paper,
  args: {
    style: { width: 390, height: 240, padding: spacing[5] },
    children: <Text style={{ ...typography.title, color: colors.ink }}>Viajes</Text>,
  },
  argTypes: { tone: { control: 'inline-radio', options: ['paper', 'raised'] } },
} satisfies Meta<typeof Paper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Raised: Story = { args: { tone: 'raised' } };
