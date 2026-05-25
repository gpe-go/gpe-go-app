// PRUEBA DE INTEGRACIÓN — almacenamiento seguro del token de sesión.
// Verifica el arreglo de seguridad: el token se guarda cifrado, se migra
// desde el almacén viejo (sin cifrar) y se borra de ambos al cerrar sesión.
// Simulamos (mock) el almacén seguro y el AsyncStorage para no depender
// del dispositivo.

// Estos objetos guardan el estado simulado de cada almacén. El prefijo
// "mock" es obligatorio para poder usarlos dentro de jest.mock.
const mockSecureData: Record<string, string> = {};
const mockAsyncData: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((k: string) => Promise.resolve(k in mockSecureData ? mockSecureData[k] : null)),
  setItemAsync: jest.fn((k: string, v: string) => { mockSecureData[k] = v; return Promise.resolve(); }),
  deleteItemAsync: jest.fn((k: string) => { delete mockSecureData[k]; return Promise.resolve(); }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(k in mockAsyncData ? mockAsyncData[k] : null)),
    setItem: jest.fn((k: string, v: string) => { mockAsyncData[k] = v; return Promise.resolve(); }),
    removeItem: jest.fn((k: string) => { delete mockAsyncData[k]; return Promise.resolve(); }),
  },
}));

import { getToken, setToken, removeToken } from '../src/auth/tokenStore';
import * as SecureStore from 'expo-secure-store';

beforeEach(() => {
  for (const k of Object.keys(mockSecureData)) delete mockSecureData[k];
  for (const k of Object.keys(mockAsyncData)) delete mockAsyncData[k];
  jest.clearAllMocks();
});

describe('tokenStore (integración: almacén seguro + migración)', () => {
  it('setToken guarda el token en el almacén CIFRADO', async () => {
    await setToken('jwt-123');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'jwt-123');
    expect(mockSecureData['token']).toBe('jwt-123');
    expect(await getToken()).toBe('jwt-123');
  });

  it('migra un token viejo de AsyncStorage (sin cifrar) al almacén seguro', async () => {
    // Simulamos una versión anterior de la app: token en AsyncStorage.
    mockAsyncData['token'] = 'token-viejo';

    const t = await getToken();

    expect(t).toBe('token-viejo');                       // lo devuelve igual
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'token-viejo'); // lo movió
    expect(mockAsyncData['token']).toBeUndefined();      // borró la copia insegura
  });

  it('removeToken borra el token de AMBOS almacenes (logout)', async () => {
    await setToken('jwt-xyz');
    await removeToken();
    expect(mockSecureData['token']).toBeUndefined();
    expect(mockAsyncData['token']).toBeUndefined();
    expect(await getToken()).toBeNull();
  });
});
