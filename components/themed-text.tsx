import { Text, type TextProps, StyleSheet } from 'react-native';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'link' | 'defaultSemiBold';
};

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: { fontSize: 16, color: '#1E293B' },
  defaultSemiBold: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 20, fontWeight: '600', color: '#475569' },
  link: { fontSize: 16, color: '#E96928' },
});
