import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { colors, spacing, typography } from '../../tokens';
import { Reveal } from './Reveal';

function Stagger() {
  return (
    <View style={{ gap: spacing[3], width: 320 }}>
      {['Japón', 'Italia', 'México', 'Perú'].map((name, i) => (
        <Reveal key={name} delay={i * 80}>
          <Text style={{ ...typography.heading, color: colors.ink }}>{name}</Text>
        </Reveal>
      ))}
    </View>
  );
}

const meta = { title: 'Base/Reveal', component: Stagger } satisfies Meta<typeof Stagger>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Recarga la story para ver la aparición escalonada. */
export const Staggered: Story = {};
