import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { spacing } from '../../tokens';
import { Tag } from './Tag';

const meta = {
  title: 'Base/Tag',
  component: Tag,
  args: { tone: 'visited', children: 'Visitado' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'visited', 'planned', 'settled', 'warning', 'unexplored'],
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllTones: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
      <Tag>Kioto</Tag>
      <Tag tone="visited">Visitado</Tag>
      <Tag tone="planned">Próximo</Tag>
      <Tag tone="settled">Saldado</Tag>
      <Tag tone="warning">Pendiente de subir</Tag>
      <Tag tone="unexplored">Por descubrir</Tag>
    </View>
  ),
};
