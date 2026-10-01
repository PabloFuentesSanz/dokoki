import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';
import { SegmentedTabs } from './SegmentedTabs';

type Mode = 'upcoming' | 'current' | 'past';
const OPTIONS: readonly { value: Mode; label: string }[] = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'current', label: 'En curso' },
  { value: 'past', label: 'Pasados' },
];

function Demo() {
  const [value, setValue] = useState<Mode>('past');
  return (
    <View style={{ width: 350 }}>
      <SegmentedTabs label="Viajes" options={OPTIONS} value={value} onChange={setValue} />
    </View>
  );
}

const meta = { title: 'Navegación/SegmentedTabs', component: Demo } satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Trips: Story = {};
