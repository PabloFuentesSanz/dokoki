import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { iconNames } from '../Icon/Icon';
import { IconButton } from './IconButton';

const meta = {
  title: 'Acciones/IconButton',
  component: IconButton,
  args: { icon: 'back', label: 'Volver' },
  argTypes: { icon: { control: 'select', options: iconNames } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OverMap: Story = { args: { icon: 'layers', label: 'Capas del mapa', outline: true } };
export const Disabled: Story = { args: { icon: 'share', label: 'Compartir', disabled: true } };
