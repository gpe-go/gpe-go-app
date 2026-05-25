// Pruebas unitarias del mapper de lugares.
// Verifica la normalización de datos que vienen del backend, incluida
// la corrección del teléfono (null/"" → undefined) agregada en QA.
import { mapLugar } from '../src/mappers/lugaresMapper';

describe('mapLugar', () => {
  it('mapea los campos básicos del backend a la forma de la app', () => {
    const raw = {
      id: 123,
      nombre: 'Restaurante El Buen Sabor',
      direccion: 'Av. Hidalgo 100, Guadalupe',
      categoria_nombre: 'Restaurantes y bares',
      latitud: '25.6767',
      longitud: '-100.2566',
      telefono: '8181234567',
    };

    const lugar = mapLugar(raw);

    expect(lugar.id).toBe('123'); // el id se normaliza a string
    expect(lugar.nombre).toBe('Restaurante El Buen Sabor');
    expect(lugar.ubicacion).toBe('Av. Hidalgo 100, Guadalupe'); // direccion → ubicacion
    expect(lugar.categoria).toBe('Restaurantes y bares');
    expect(lugar.lat).toBeCloseTo(25.6767);
    expect(lugar.lng).toBeCloseTo(-100.2566);
    expect(lugar.telefono).toBe('8181234567');
  });

  it('cuando el teléfono viene null, queda undefined (no se muestra la fila)', () => {
    const lugar = mapLugar({ id: 1, nombre: 'Sin teléfono', telefono: null });
    expect(lugar.telefono).toBeUndefined();
  });

  it('cuando el teléfono viene vacío o con espacios, también queda undefined', () => {
    expect(mapLugar({ id: 2, nombre: 'X', telefono: '' }).telefono).toBeUndefined();
    expect(mapLugar({ id: 3, nombre: 'Y', telefono: '   ' }).telefono).toBeUndefined();
  });

  it('recorta espacios sobrantes del teléfono', () => {
    expect(mapLugar({ id: 4, nombre: 'Z', telefono: ' 8180001122 ' }).telefono).toBe('8180001122');
  });
});
