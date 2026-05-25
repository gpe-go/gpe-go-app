// Pruebas unitarias de la presentación de categorías.
// Verifica el mapeo nombre de categoría → clave de traducción/ícono/color,
// incluida la corrección que tradujo las categorías de eventos.
import { resolverPresentacion } from '../src/utils/categoriaPresentacion';

describe('resolverPresentacion', () => {
  it('resuelve categorías de lugares conocidas (insensible a mayúsculas/acentos)', () => {
    expect(resolverPresentacion('Restaurantes y bares').labelKey).toBe('cat_restaurantes');
    expect(resolverPresentacion('SITIOS TURISTICOS').labelKey).toBe('cat_turisticos');
  });

  it('resuelve las categorías de eventos (fix de traducción)', () => {
    expect(resolverPresentacion('Cultural').labelKey).toBe('cat_cultural');
    expect(resolverPresentacion('Deporte').labelKey).toBe('cat_deporte');
    expect(resolverPresentacion('Gastronomia').labelKey).toBe('cat_gastronomia');
    expect(resolverPresentacion('Sociales').labelKey).toBe('cat_sociales');
  });

  it('para categorías desconocidas devuelve el default sin clave de traducción', () => {
    const p = resolverPresentacion('Categoría Nueva Que No Existe');
    expect(p.labelKey).toBeNull();
    expect(typeof p.icon).toBe('string');
    expect(p.color).toMatch(/^#?[0-9A-Fa-f]{6}$/);
  });
});
