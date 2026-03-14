import { Colors } from '@/constants/colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LugarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nombre del Lugar</Text>
      <Text>Descripción del lugar turístico.</Text>

      <Text style={styles.info}>📍 Dirección</Text>
      <Text style={styles.info}>📞 Teléfono</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Agregar a favoritos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  info: { marginTop: 10 },
  button: {
    marginTop: 20,
    backgroundColor: Colors.light.primary,
    padding: 14,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', textAlign: 'center' },
});
