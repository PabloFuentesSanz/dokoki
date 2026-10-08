import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from './TextField';

describe('TextField', () => {
  it('la etiqueta da nombre al campo', () => {
    render(<TextField label="Nombre del viaje" defaultValue="Kioto, Nara y Osaka" />);
    expect(screen.getByRole('textbox', { name: 'Nombre del viaje' })).toHaveValue(
      'Kioto, Nara y Osaka',
    );
    expect(screen.getByText('Nombre del viaje')).toBeInTheDocument();
  });

  it('avisa de cada cambio', () => {
    const onChangeText = vi.fn();
    render(<TextField label="Email" type="email" onChangeText={onChangeText} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
      target: { value: 'marta@correo.es' },
    });
    expect(onChangeText).toHaveBeenCalledWith('marta@correo.es');
  });

  it('el error sustituye a la ayuda', () => {
    render(
      <TextField
        label="Email"
        hint="Te enviaremos un enlace"
        error="Falta la @: revisa el email"
      />,
    );
    expect(screen.getByText('Falta la @: revisa el email')).toBeInTheDocument();
    expect(screen.queryByText('Te enviaremos un enlace')).not.toBeInTheDocument();
  });

  it('deshabilitado no se puede editar', () => {
    render(<TextField label="Base" defaultValue="Madrid" disabled />);
    expect(screen.getByRole('textbox', { name: 'Base' })).toHaveAttribute('readonly');
  });

  it('admite varias líneas para notas', () => {
    render(<TextField label="Nota" multiline defaultValue={'Una\nDos'} />);
    const field = screen.getByLabelText('Nota');
    expect(field.tagName).toBe('TEXTAREA');
  });
});
