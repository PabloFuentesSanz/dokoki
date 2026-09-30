import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { spacing } from '../../tokens';
import { RouteLine } from './RouteLine';

const meta = {
  title: 'Mapa/RouteLine',
  component: RouteLine,
  args: { kind: 'traveled', length: 56 },
  argTypes: { kind: { control: 'inline-radio', options: ['traveled', 'planned', 'unexplored'] } },
} satisfies Meta<typeof RouteLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Traveled: Story = {};
export const AllKinds: Story = {
  render: () => (
    <View style={{ gap: spacing[3] }}>
      <RouteLine kind="traveled" />
      <RouteLine kind="planned" />
      <RouteLine kind="unexplored" />
    </View>
  ),
};
