import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../tokens';
import { Icon, iconNames } from './Icon';

const meta = {
  title: 'Base/Icon',
  component: Icon,
  args: { name: 'map', size: 22 },
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Labelled: Story = { args: { name: 'share', label: 'Compartir' } };
export const AllIcons: Story = {
  render: () => (
    <View style={styles.grid}>
      {iconNames.map((name) => (
        <View key={name} style={styles.cell}>
          <Icon name={name} />
          <Text style={styles.name}>{name}</Text>
        </View>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] },
  cell: { width: 72, alignItems: 'center', gap: spacing[1] },
  name: { ...typography.dataS, color: colors.inkMuted },
});
