import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Mapa/Breadcrumbs',
  component: Breadcrumbs,
  args: { items: ['Mundo', 'Asia', 'Japón', 'Kioto'] },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const City: Story = {};
export const Country: Story = { args: { items: ['Mundo', 'Europa', 'Portugal'] } };
