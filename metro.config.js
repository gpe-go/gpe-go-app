// Configuración base de Metro para Expo.
// Extiende la config por defecto de Expo (getDefaultConfig) sin
// cambiar comportamiento — es el baseline recomendado por Expo y deja
// el proyecto listo por si en el futuro se necesita personalizar Metro.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
