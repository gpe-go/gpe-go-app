import { Text, type TextProps, StyleSheet } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E293B',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#1E293B',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#E96928',
  },
});
