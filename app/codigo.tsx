import { View } from 'react-native';
import { Text, TextInput } from '../components/Text';

export default function Codigo() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Ingresa el código</Text>
      <TextInput placeholder="123456" />
    </View>
  );
}
