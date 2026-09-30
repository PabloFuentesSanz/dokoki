import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Base/EmptyState',
  component: EmptyState,
  args: {
    icon: 'photos',
    title: 'Aún no hay fotos de Perú',
    body: 'Cuando viajes, aparecerán aquí solas.',
    action: 'Marcar a mano',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAction: Story = {};
export const WithoutAction: Story = {
  args: {
    icon: 'trips',
    title: 'Aún sin viajes',
    body: 'Los viajes se detectan solos con tus fotos.',
    action: undefined,
  },
};
