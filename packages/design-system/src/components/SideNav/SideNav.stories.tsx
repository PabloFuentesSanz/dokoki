import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { SideNav } from './SideNav';

const meta = {
  title: 'Navegación/SideNav',
  component: SideNav,
  args: { active: 'map' },
  argTypes: { active: { control: 'inline-radio', options: ['map', 'trips', 'photos', 'me'] } },
  decorators: [
    (Story) => (
      <View style={{ height: 520 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Map: Story = {};
export const Photos: Story = { args: { active: 'photos' } };
