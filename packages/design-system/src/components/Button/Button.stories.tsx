import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { spacing } from '../../tokens';
import { Button } from './Button';

const meta = {
  title: 'Acciones/Button',
  component: Button,
  args: { children: 'Planificar viaje', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', children: 'Ver fotos' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ahora no' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Borrar cuenta' } };
export const WithIcon: Story = { args: { icon: 'share', children: 'Compartir' } };
export const Loading: Story = { args: { loading: true, children: 'Guardando' } };
export const Disabled: Story = { args: { disabled: true, children: 'Guardar gasto' } };
export const Variants: Story = {
  render: () => (
    <View style={{ gap: spacing[3] }}>
      <Button>Planificar viaje</Button>
      <Button variant="secondary">Ver fotos</Button>
      <Button variant="ghost">Ahora no</Button>
      <Button variant="danger">Borrar cuenta</Button>
      <Button size="sm" variant="secondary">
        Saldar
      </Button>
    </View>
  ),
};
