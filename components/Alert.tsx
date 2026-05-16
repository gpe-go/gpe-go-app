// ============================================================
//  Alert con tipografía Museo.
//
//  Alert.alert() de react-native es un diálogo NATIVO del SO
//  (iOS/Android), por lo que NO respeta las fuentes registradas
//  por la app — siempre se ve con la tipografía del sistema.
//
//  Para que TODOS los avisos de la app usen Museo, sustituimos
//  Alert.alert por este wrapper, que renderiza un <Modal> en JS
//  usando nuestros Text wrappers (que aplican Museo según peso).
//
//  La API es idéntica a la nativa, así que reemplazar imports
//  es transparente:
//
//    Alert.alert(title, message?, buttons?, options?)
//
//  Reemplazo automático de imports: scripts/rewrite-alert-imports.js
// ============================================================

import * as React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';

export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
};

export type AlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
};

type AlertConfig = {
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
};

// ── Mini-store ──────────────────────────────────────────────
let listener: ((cfg: AlertConfig | null) => void) | null = null;

function show(cfg: AlertConfig) {
  // Si no hay AlertHost montado (caso raro), no rompemos: solo log.
  if (!listener) {
    if (__DEV__) console.warn('[AppAlert] AlertHost no está montado');
    return;
  }
  listener(cfg);
}

// ── API pública compatible con Alert.alert() ────────────────
export const Alert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) {
    show({
      title,
      message,
      buttons: buttons?.length ? buttons : [{ text: 'OK' }],
      options,
    });
  },
};

// ── Componente que renderiza el modal ───────────────────────
export function AlertHost() {
  const [cfg, setCfg] = React.useState<AlertConfig | null>(null);

  React.useEffect(() => {
    listener = setCfg;
    return () => {
      listener = null;
    };
  }, []);

  if (!cfg) return null;

  const dismiss = (btn?: AlertButton) => {
    setCfg(null);
    btn?.onPress?.();
    if (!btn) cfg.options?.onDismiss?.();
  };

  const onBackdropPress = () => {
    if (cfg.options?.cancelable !== false) {
      dismiss();
    }
  };

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={() => dismiss()}
    >
      <Pressable style={styles.backdrop} onPress={onBackdropPress}>
        <Pressable style={styles.card} onPress={() => { /* swallow */ }}>
          <Text style={styles.title} numberOfLines={3}>
            {cfg.title}
          </Text>
          {!!cfg.message && (
            <Text style={styles.message}>{cfg.message}</Text>
          )}
          <View style={styles.btnsRow}>
            {cfg.buttons.map((b, i) => (
              <Pressable
                key={`${b.text}-${i}`}
                onPress={() => dismiss(b)}
                style={({ pressed }) => [
                  styles.btn,
                  i > 0 && styles.btnDivider,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    b.style === 'destructive' && styles.btnTextDestructive,
                    b.style === 'cancel' && styles.btnTextCancel,
                  ]}
                >
                  {b.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingTop: 22,
    overflow: 'hidden',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  message: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 18,
    lineHeight: 19,
  },
  btnsRow: {
    flexDirection: 'row',
    marginTop: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.15)',
  },
  btnPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  btnText: {
    color: '#F97613',
    fontSize: 16,
    fontWeight: '600',
  },
  btnTextDestructive: {
    color: '#FF453A',
  },
  btnTextCancel: {
    fontWeight: '700',
  },
});
