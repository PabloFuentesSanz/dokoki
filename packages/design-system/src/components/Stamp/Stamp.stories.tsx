import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { spacing } from '../../tokens';
import { Stamp } from './Stamp';

const meta = {
  title: 'Firma/Stamp',
  component: Stamp,
  args: { kind: 'country', label: 'Japón', date: '10.04.2024', tone: 'red', size: 104 },
  argTypes: {
    kind: { control: 'inline-radio', options: ['country', 'city', 'achievement'] },
    tone: { control: 'inline-radio', options: ['red', 'blue', 'olive'] },
  },
} satisfies Meta<typeof Stamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Country: Story = {};
export const City: Story = { args: { kind: 'city', label: 'Kioto', date: '11.04.2024' } };
export const Achievement: Story = {
  args: { kind: 'achievement', label: '5 continentes', tone: 'olive', date: '2024' },
};
export const Planned: Story = { args: { label: 'Perú', tone: 'blue', date: 'oct. 2026' } };
export const PassportGrid: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] }}>
      <Stamp label="Portugal" date="02.07.2019" straight />
      <Stamp kind="city" label="Lisboa" date="02.07.2019" straight />
      <Stamp label="Japón" date="10.04.2024" straight />
      <Stamp kind="city" label="Kioto" date="10.04.2024" straight />
    </View>
  ),
};
/** Desbloqueo: el sello cae y golpea el papel (recarga la story para verlo). */
export const StampIn: Story = { args: { label: 'Japón', date: '12.04.2024', stampIn: true } };
