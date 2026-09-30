import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Formularios/Checkbox',
  component: Checkbox,
  args: { label: 'Pasaporte', checked: false },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { label: 'Seguro de viaje', checked: true } };
