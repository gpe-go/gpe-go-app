// Prueba de COMPONENTE con React Native Testing Library.
// Renderiza el componente <Text> de la app y verifica que muestra
// el contenido y que aplica la tipografía Museo según el peso.
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Text } from '../Text';

describe('<Text> (wrapper de tipografía Museo)', () => {
  it('muestra el texto que recibe', () => {
    render(<Text>Hola Guadalupe</Text>);
    expect(screen.getByText('Hola Guadalupe')).toBeOnTheScreen();
  });

  it('usa la fuente Museo en negrita cuando el peso es bold/700', () => {
    render(<Text style={{ fontWeight: '700' }}>Título</Text>);
    const node = screen.getByText('Título');
    const estilo = StyleSheet.flatten(node.props.style);
    expect(estilo.fontFamily).toBe('Museo-700');
  });

  it('usa la fuente Museo light por defecto (peso normal)', () => {
    render(<Text>Cuerpo</Text>);
    const node = screen.getByText('Cuerpo');
    const estilo = StyleSheet.flatten(node.props.style);
    expect(estilo.fontFamily).toBe('Museo-300');
  });
});
