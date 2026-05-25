// Configuración de Jest para GuadalupeGO.
// Usa el preset oficial de Expo (jest-expo), que ya sabe transformar
// React Native / Expo. `setupFilesAfterEnv` carga los matchers de
// React Native Testing Library (toBeOnTheScreen, toHaveTextContent, etc.).
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/react-native/build/matchers/extend-expect'],
  // Carpetas que NO son código a testear.
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/dist/'],
};
