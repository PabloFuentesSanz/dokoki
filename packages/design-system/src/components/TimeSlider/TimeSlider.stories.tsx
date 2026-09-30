import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TimeSlider } from './TimeSlider';

const meta = {
  title: 'Mapa/TimeSlider',
  component: TimeSlider,
  args: { min: 2018, max: 2026, value: 2024 },
} satisfies Meta<typeof TimeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
