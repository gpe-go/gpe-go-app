import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...rest }: ThemedViewProps) {
  return <View style={[{ backgroundColor: '#fff' }, style]} {...rest} />;
}
