import { Text, TextInput, View } from 'react-native';

export default function Codigo() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Ingresa el código</Text>
      <TextInput placeholder="123456" />
    </View>
  );
}
