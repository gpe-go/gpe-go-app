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
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
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
//
// Arquitectura: mantenemos el <Modal> SIEMPRE montado (con `visible`
// controlado por estado). Cuando el usuario presiona un botón:
//   1. visible=false → Modal inicia su animación de cierre.
//   2. Esperamos a que la animación termine:
//        - iOS: vía `onDismiss` (callback nativo, súper preciso).
//        - Android: vía setTimeout (~250ms) porque allí no hay onDismiss.
//   3. Recién entonces invocamos `onPress` y limpiamos `cfg`.
//
// ¿Por qué? Si llamábamos `onPress` antes de que el Modal terminara su
// animación, en iOS el ImagePicker (otro modal NATIVO) intentaba
// presentarse desde el view controller del Modal aún en transición y
// fallaba silenciosamente — galería/cámara no abrían. Con este flujo
// la presentación ya tiene el stack de view controllers limpio.
const ANIM_HIDE_MS = 220;

export function AlertHost() {
  const [cfg, setCfg]         = React.useState<AlertConfig | null>(null);
  const [visible, setVisible] = React.useState(false);
  const pendingCbRef          = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    listener = (newCfg) => {
      if (newCfg) {
        setCfg(newCfg);
        setVisible(true);
      }
    };
    return () => { listener = null; };
  }, []);

  const finalizar = React.useCallback(() => {
    setCfg(null);
    const cb = pendingCbRef.current;
    pendingCbRef.current = null;
    // Diferimos el cb una tick adicional para asegurar que el unmount
    // del Modal ya terminó de procesarse antes de que el cb intente
    // abrir otra superficie nativa (ImagePicker, mapas, etc.).
    if (cb) requestAnimationFrame(cb);
  }, []);

  const dismiss = (btn?: AlertButton) => {
    pendingCbRef.current = btn?.onPress ?? (!btn ? (cfg?.options?.onDismiss ?? null) : null);
    setVisible(false);
    // En Android, Modal NO expone `onDismiss`. Esperamos manualmente la
    // duración de la animación. En iOS el callback `onDismiss` se hace
    // cargo (ver prop más abajo) y este setTimeout actúa como fallback.
    if (Platform.OS !== 'ios') {
      setTimeout(finalizar, ANIM_HIDE_MS);
    }
  };

  const onBackdropPress = () => {
    if (cfg?.options?.cancelable !== false) {
      dismiss();
    }
  };

  if (!cfg) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => dismiss()}
      onDismiss={Platform.OS === 'ios' ? finalizar : undefined}
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
