import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { colors } from '../../tokens';
import { Ticket } from './Ticket';

describe('Ticket', () => {
  it('se anuncia por tipo y ruta, con proveedor, código y hora', () => {
    render(
      <Ticket
        title="MAD → NRT"
        provider="Iberia"
        meta="10.04.2024, 13:25, 14 h 5 min"
        code="X7K2PQ"
        time="13:25"
      />,
    );
    const ticket = screen.getByRole('group', { name: 'Vuelo: MAD → NRT' });
    expect(ticket).toHaveTextContent('Vuelo, Iberia');
    expect(ticket).toHaveTextContent('X7K2PQ');
    expect(ticket).toHaveTextContent('Código');
  });

  it('cada tipo de reserva tiene su nombre', () => {
    render(<Ticket kind="hotel" title="Ryokan Yachiyo" code="88213" stubLabel="Reserva" />);
    expect(screen.getByRole('group', { name: 'Alojamiento: Ryokan Yachiyo' })).toHaveTextContent(
      'Reserva',
    );
  });

  it('sin confirmar: borde discontinuo azul', () => {
    render(<Ticket kind="train" title="Kioto → Nara" code="—" planned />);
    expect(screen.getByRole('group')).toHaveStyle({
      borderStyle: 'dashed',
      borderColor: colors.stampBlue,
    });
  });
});
