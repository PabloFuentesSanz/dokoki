import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { BottomNav } from './BottomNav';

const meta = {
  title: 'Navegación/BottomNav',
  component: BottomNav,
  args: { active: 'map' },
  argTypes: { active: { control: 'inline-radio', options: ['map', 'trips', 'photos', 'me'] } },
  decorators: [
    (Story) => (
      <View style={{ width: 390 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Map: Story = {};
export const Trips: Story = { args: { active: 'trips' } };
/** iPhone con barra de inicio: la zona segura (34 px) sustituye al margen inferior. */
export const WithHomeIndicator: Story = { args: { bottomInset: 34 } };
