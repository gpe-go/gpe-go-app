// PRUEBA DE INTEGRACIÓN — buscador dinámico (useSearchHints).
// Verifica que las "pistas" del buscador se arman juntando:
//   • categorías que vienen del backend (mockeadas),
//   • nombres de lugares pasados por la pantalla,
//   • y respetando el alcance (directorio = no turístico, explorar = turístico).
// Mockeamos las categorías y las traducciones para no depender de la red ni
// de la inicialización de i18n.

jest.mock('react-i18next', () => ({
  // t identidad: devuelve la clave tal cual, para poder verificarla.
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('../src/hooks/useCategorias', () => ({
  useCategorias: () => ({
    data: [
      { id: 1, nombre: 'Restaurantes y bares' }, // directorio
      { id: 5, nombre: 'Sitios turísticos' },     // turístico (explorar)
    ],
  }),
  useCategoriasEventos: () => ({ data: [{ id: 2, nombre: 'Cultural' }] }),
}));

import { renderHook } from '@testing-library/react-native';
import { useSearchHints } from '../src/hooks/useSearchHints';

describe('useSearchHints (integración: categorías + nombres + alcance)', () => {
  it('alcance "directorio": incluye nombres y categorías NO turísticas', () => {
    const { result } = renderHook(() =>
      useSearchHints({ nombres: ['Soriana Santa María'], scope: 'directorio' }),
    );
    const texto = result.current.join(' | ');

    expect(texto).toContain('Soriana Santa María');   // nombre pasado por la pantalla
    expect(texto).toContain('cat_restaurantes');       // categoría de directorio
    expect(texto).not.toContain('cat_turisticos');     // turístico NO debe salir aquí
  });

  it('alcance "explorar": solo categorías turísticas', () => {
    const { result } = renderHook(() => useSearchHints({ scope: 'explorar' }));
    const texto = result.current.join(' | ');

    expect(texto).toContain('cat_turisticos');         // sí: turístico
    expect(texto).not.toContain('cat_restaurantes');   // no: comercio
  });

  it('siempre devuelve al menos una pista (nunca vacío)', () => {
    const { result } = renderHook(() => useSearchHints({ scope: 'all' }));
    expect(result.current.length).toBeGreaterThan(0);
  });
});
