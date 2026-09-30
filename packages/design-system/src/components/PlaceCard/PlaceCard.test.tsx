import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlaceCard } from './PlaceCard';

describe('PlaceCard', () => {
  it('visitado: etiqueta Visitado y número de fotos', () => {
    render(<PlaceCard name="Fushimi Inari" area="Fushimi, Kioto" photos={48} />);
    const card = screen.getByRole('link', { name: 'Fushimi Inari, Fushimi, Kioto' });
    expect(card).toHaveTextContent('Visitado');
    expect(card).toHaveTextContent('48 fotos');
  });

  it('planificado: muestra el día del plan y borde discontinuo', () => {
    render(<PlaceCard name="Kinkaku-ji" area="Kita, Kioto" status="planned" day="Día 3" />);
    const card = screen.getByRole('link');
    expect(card).toHaveTextContent('Día 3');
    expect(card).toHaveStyle({ borderStyle: 'dashed' });
  });

  it('deseo sin fotos: muestra coordenadas si las hay', () => {
    const { container } = render(
      <PlaceCard name="Machu Picchu" area="Cusco" status="wish" lat={-13.1631} lng={-72.545} />,
    );
    expect(container).toHaveTextContent('Quiero ir');
    expect(container).toHaveTextContent('13,16° S');
  });

  it('abre la ficha al pulsar', () => {
    const onPress = vi.fn();
    render(<PlaceCard name="Nara-koen" area="Nara" onPress={onPress} />);
    fireEvent.click(screen.getByRole('link'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
