import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Toggle } from './Toggle';

const meta = {
  title: 'Formularios/Toggle',
  component: Toggle,
  args: { label: 'Subir miniaturas solo con wifi', checked: true },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {};
export const Off: Story = { args: { label: 'Seguir mi ruta', checked: false } };
