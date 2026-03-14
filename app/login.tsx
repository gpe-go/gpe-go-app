import { Text, TextInput, View } from 'react-native';

export default function Login() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Ingresa tu correo</Text>
      <TextInput placeholder="email@ejemplo.com" />
    </View>
  );
}
