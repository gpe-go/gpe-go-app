import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppLanguage, LANGUAGE_LIST } from '../src/i18n/i18n';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentLang: AppLanguage;
  onSelect: (code: AppLanguage) => void;
  colors: any;
  fonts: any;
  isDark: boolean;
};

export default function LanguageSheet({
  visible,
  onClose,
  currentLang,
  onSelect,
  colors,
  fonts,
  isDark,
}: Props) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
        onPress={onClose}
      />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View
          style={[
            styles.handle,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)' },
          ]}
        />

        {/* Header row */}
        <View
          style={[
            styles.sheetHeader,
            { borderBottomColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.sheetIconBg,
              { backgroundColor: 'rgba(233,105,40,0.12)' },
            ]}
          >
            <Ionicons name="globe-outline" size={20} color="#E96928" />
          </View>

          <Text
            style={[
              styles.sheetTitle,
              { fontSize: fonts.lg, color: colors.text },
            ]}
          >
            {t('select_language')}
          </Text>

          <TouchableOpacity onPress={onClose} hitSlop={14} activeOpacity={0.7}>
            <View
              style={[
                styles.closeBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <Ionicons name="close" size={18} color={colors.subtext} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Language list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {LANGUAGE_LIST.map((item) => {
            const selected = currentLang === item.code;
            return (
              <Pressable
                key={item.code}
                onPress={() => onSelect(item.code)}
                style={({ pressed }) => [
                  styles.langRow,
                  selected && {
                    backgroundColor: isDark
                      ? 'rgba(233,105,40,0.15)'
                      : 'rgba(233,105,40,0.08)',
                  },
                  { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
                ]}
              >
                <Text style={styles.flag}>{item.flag}</Text>

                <Text
                  style={[
                    styles.langLabel,
                    {
                      fontSize: fonts.base,
                      color: selected ? '#E96928' : colors.text,
                      fontWeight: selected ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>

                {selected && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
          <View style={{ height: Platform.OS === 'ios' ? 32 : 18 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sheetTitle: {
    flex: 1,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  flag: {
    fontSize: 26,
    marginRight: 14,
    lineHeight: 32,
  },
  langLabel: {
    flex: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E96928',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
