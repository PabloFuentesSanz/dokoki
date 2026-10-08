import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TextField } from './TextField';

const meta = {
  title: 'Formularios/TextField',
  component: TextField,
  args: { label: 'Nombre del viaje', placeholder: 'Kioto, Nara y Osaka' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = {
  args: { label: 'Email', type: 'email', hint: 'Te enviaremos un enlace para entrar.' },
};
export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    defaultValue: 'marta.correo.es',
    error: 'Falta la @: revisa el email.',
  },
};
export const Disabled: Story = {
  args: { label: 'Tu base', defaultValue: 'Madrid', disabled: true },
};
/** Notas a mano: varias líneas. */
export const Multiline: Story = {
  args: { label: 'Nota del viaje', multiline: true, placeholder: 'Volver en otoño…' },
};
