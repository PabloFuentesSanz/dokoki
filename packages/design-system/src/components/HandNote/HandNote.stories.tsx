import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { HandNote } from './HandNote';

const meta = {
  title: 'Firma/HandNote',
  component: HandNote,
  args: { children: 'Volver en otoño, sin falta', meta: 'Kioto, 11.04.2024' },
} satisfies Meta<typeof HandNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutMeta: Story = {
  args: { children: 'El mejor ramen de la estación, planta 10', meta: undefined },
};
