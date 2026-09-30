import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { CaptureButton } from './CaptureButton';

const meta = {
  title: 'Acciones/CaptureButton',
  component: CaptureButton,
} satisfies Meta<typeof CaptureButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
