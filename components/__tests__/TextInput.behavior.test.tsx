// PRUEBA DE COMPORTAMIENTO — el campo de texto reacciona al usuario.
// Simula que la persona escribe en el buscador y verifica que se notifica
// el cambio. Usa fireEvent de React Native Testing Library.
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../Text';

describe('<TextInput> (comportamiento del usuario)', () => {
  it('avisa el texto escrito mediante onChangeText', () => {
    const onChangeText = jest.fn();
    render(<TextInput placeholder="Buscar" onChangeText={onChangeText} />);

    const input = screen.getByPlaceholderText('Buscar');
    fireEvent.changeText(input, 'Restaurantes');

    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('Restaurantes');
  });

  it('refleja el valor controlado que recibe por props', () => {
    render(<TextInput placeholder="Buscar" value="Hoteles" onChangeText={() => {}} />);
    expect(screen.getByDisplayValue('Hoteles')).toBeOnTheScreen();
  });
});
