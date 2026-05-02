import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  Image, Alert, ScrollView, Modal, ActivityIndicator,
  Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  getResenas, crearResena, editarResena, eliminarResena, subirFotoResena, crearReporte,
} from '../src/api/api';
import { tienePalabrasProhibidas } from '../src/utils/filtrarPalabras';

type Props = { lugarId: string };

// Foto local pendiente de subir
type FotoLocal = { uri: string; base64: string };

type ReseñaAPI = {
  id: number;
  id_usuario: number;
  usuario_nombre: string;
  comentario: string | null;
  calificacion: number;
  fecha: string;
  fotos: string[]; // URLs S3
};

// ─── Estrella individual con animación ───────────────────────────────────────
function EstrellaAnimada({
  index,
  active,
  size,
  isInteractive,
  onPress,
  // contador que aumenta cada vez que el usuario selecciona; se usa para
  // que la cascada (1, 2, 3…) reanime cuando vuelve a tocar otra estrella
  triggerKey,
  selectedValue,
}: {
  index: number;
  active: boolean;
  size: number;
  isInteractive: boolean;
  onPress?: () => void;
  triggerKey: number;
  selectedValue: number;
}) {
  // Escala de la estrella (efecto pop al activarse)
  const scale     = useRef(new Animated.Value(1)).current;
  // Rotación leve al activarse (giro pequeño)
  const rotate    = useRef(new Animated.Value(0)).current;
  // Anillo de "burst" (círculo expansivo cuando se toca)
  const burstScale   = useRef(new Animated.Value(0)).current;
  const burstOpacity = useRef(new Animated.Value(0)).current;

  // Cuando esta estrella se activa por primera vez en una nueva selección,
  // hace un pop con cascada (delay según índice)
  const wasActiveRef = useRef(active);
  useEffect(() => {
    const justActivated = active && !wasActiveRef.current;
    const justDeactivated = !active && wasActiveRef.current;
    wasActiveRef.current = active;

    if (justActivated) {
      // Cascada: cada estrella anima un poco después de la anterior
      const cascadeDelay = (index - 1) * 55;

      // POP con spring (sale grande y vuelve)
      Animated.sequence([
        Animated.delay(cascadeDelay),
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1.45,
            tension: 120,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          // Burst (anillo expansivo)
          Animated.timing(burstOpacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(burstScale, {
            toValue: 2.4,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(burstOpacity, {
            toValue: 0,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(burstScale, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (justDeactivated) {
      // Encogimiento sutil al desactivarse
      Animated.spring(scale, {
        toValue: 0.9,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }).start();
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, triggerKey]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '18deg'],
  });

  const StarInner = (
    <View style={{ width: size + 8, height: size + 8, justifyContent: 'center', alignItems: 'center' }}>
      {/* Burst expansivo (anillo) */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: '#FFD700',
          opacity: burstOpacity,
          transform: [{ scale: burstScale }],
        }}
      />
      <Animated.View
        style={{
          transform: [
            { scale },
            { rotate: rotateInterpolate },
          ],
        }}
      >
        <Ionicons
          name={active ? 'star' : 'star-outline'}
          size={size}
          color={active ? '#FFD700' : (isInteractive ? '#D1D5DB' : '#FFD700')}
        />
      </Animated.View>
    </View>
  );

  if (!isInteractive) return StarInner;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {StarInner}
    </Pressable>
  );
}

function Estrellas({ valor, onSelect }: { valor: number; onSelect?: (n: number) => void }) {
  const [triggerKey, setTriggerKey] = useState(0);
  const isInteractive = !!onSelect;
  const size = isInteractive ? 32 : 16;

  const handlePress = (n: number) => {
    if (!onSelect) return;
    // Vibración táctil — varía la intensidad según el rating
    const styleMap = {
      1: Haptics.ImpactFeedbackStyle.Light,
      2: Haptics.ImpactFeedbackStyle.Light,
      3: Haptics.ImpactFeedbackStyle.Medium,
      4: Haptics.ImpactFeedbackStyle.Medium,
      5: Haptics.ImpactFeedbackStyle.Heavy,
    } as const;
    Haptics.impactAsync(styleMap[n as 1 | 2 | 3 | 4 | 5]).catch(() => {});

    // Notificación de éxito al llegar a 5 estrellas (vibración doble)
    if (n === 5) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }, 280);
    }

    onSelect(n);
    // Forzamos re-trigger para que las estrellas ya activas también puedan reanimarse
    setTriggerKey(k => k + 1);
  };

  return (
    <View style={{ flexDirection: 'row', gap: isInteractive ? 6 : 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <EstrellaAnimada
          key={n}
          index={n}
          active={n <= valor}
          size={size}
          isInteractive={isInteractive}
          onPress={() => handlePress(n)}
          triggerKey={triggerKey}
          selectedValue={valor}
        />
      ))}
    </View>
  );
}

// ── Modal: solicitud de login ────────────────────────────────
function LoginRequiredModal({
  visible, onClose, onGoLogin,
}: { visible: boolean; onClose: () => void; onGoLogin: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={m.backdrop}>
        <View style={m.sheet}>
          <View style={m.iconWrap}>
            <Ionicons name="lock-closed" size={32} color="#E96928" />
          </View>
          <Text style={m.title}>Inicia sesión</Text>
          <Text style={m.body}>
            Para escribir una reseña necesitas tener una cuenta en GuadalupeGO.
          </Text>
          <Pressable style={m.primaryBtn} onPress={onGoLogin}>
            <Text style={m.primaryBtnText}>Iniciar sesión</Text>
          </Pressable>
          <Pressable style={m.cancelBtn} onPress={onClose}>
            <Text style={m.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  backdrop:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center', gap: 12 },
  iconWrap:      { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(233,105,40,0.1)', justifyContent: 'center', alignItems: 'center' },
  title:         { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  body:          { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  primaryBtn:    { width: '100%', height: 52, borderRadius: 16, backgroundColor: '#E96928', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText:{ color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn:     { width: '100%', height: 44, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
});

export default function Reseñas({ lugarId }: Props) {
  const { colors, fonts } = useTheme();
  const { t } = useTranslation();
  const s = makeStyles(colors, fonts);
  const { isAuthenticated, usuario } = useAuth();
  const router = useRouter();

  const [lista,      setLista]      = useState<ReseñaAPI[]>([]);
  const [cargando,   setCargando]   = useState(true);
  const [promedio,   setPromedio]   = useState<number | null>(null);

  // ── Formulario nuevo ──
  const [texto,      setTexto]      = useState('');
  const [estrellas,  setEstrellas]  = useState(0);
  const [fotos,      setFotos]      = useState<FotoLocal[]>([]);
  const [enviando,   setEnviando]   = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [errorTexto, setErrorTexto] = useState<string | null>(null);

  // ── Edición ──
  const [editandoId,       setEditandoId]       = useState<number | null>(null);
  const [editTexto,        setEditTexto]        = useState('');
  const [editEstrellas,    setEditEstrellas]    = useState(0);
  const [editFotos,        setEditFotos]        = useState<FotoLocal[]>([]);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion,     setErrorEdicion]     = useState<string | null>(null);

  // ── Reporte ──
  const [reporteModal,    setReporteModal]    = useState(false);
  const [reportandoId,    setReportandoId]    = useState<number | null>(null);
  const [enviandoReporte, setEnviandoReporte] = useState(false);

  // ── Cargar reseñas ──────────────────────────────────────
  const cargarResenas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await getResenas(Number(lugarId));
      if (res?.success) {
        setLista(res.data?.resenas ?? []);
        setPromedio(res.data?.promedio ?? null);
      }
    } catch (e) {
      if (__DEV__) console.warn('[Reseñas] error al cargar:', e);
    } finally {
      setCargando(false);
    }
  }, [lugarId]);

  useEffect(() => { cargarResenas(); }, [cargarResenas]);

  // ── Seleccionar foto (base64) ───────────────────────────
  const seleccionarFoto = (fotosActuales: FotoLocal[], setFn: (f: FotoLocal[]) => void) => {
    if (fotosActuales.length >= 3) {
      Alert.alert('Máximo 3 fotos', 'Solo puedes agregar hasta 3 fotos por reseña.');
      return;
    }
    Alert.alert('Agregar foto', '', [
      {
        text: '📷 Cámara',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar fotos.'); return; }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true,
          });
          if (!result.canceled && result.assets[0].base64) {
            const a = result.assets[0];
            setFn([...fotosActuales, { uri: a.uri, base64: `data:image/jpeg;base64,${a.base64}` }]);
          }
        },
      },
      {
        text: '🖼️ Galería',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert(t('profile_permission_gallery')); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true,
          });
          if (!result.canceled && result.assets[0].base64) {
            const a = result.assets[0];
            setFn([...fotosActuales, { uri: a.uri, base64: `data:image/jpeg;base64,${a.base64}` }]);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // ── Enviar reseña ────────────────────────────────────────
  const enviarReseña = async () => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    if (!texto.trim())   { Alert.alert(t('review_write'));  return; }
    if (estrellas === 0) { Alert.alert(t('review_rating')); return; }
    if (tienePalabrasProhibidas(texto)) {
      setErrorTexto(t('review_profanity_warning'));
      return;
    }
    setErrorTexto(null);
    setEnviando(true);
    try {
      const res = await crearResena({
        id_lugar: Number(lugarId),
        calificacion: estrellas,
        comentario: texto.trim(),
      });
      if (res?.success) {
        const idResena: number = res.data?.id;
        // Subir fotos a S3 en secuencia
        let fotosFallidas = 0;
        for (const foto of fotos) {
          try {
            await subirFotoResena(idResena, foto.base64);
          } catch (e) {
            if (__DEV__) console.warn('[Reseñas] error subiendo foto:', e);
            fotosFallidas++;
          }
        }
        setTexto(''); setEstrellas(0); setFotos([]);
        if (fotosFallidas > 0 && fotosFallidas === fotos.length) {
          Alert.alert('Reseña publicada', 'Tu reseña se publicó pero las fotos no pudieron subirse (servidor de imágenes no disponible).');
        } else {
          Alert.alert('¡Gracias!', t('review_publish'));
        }
        cargarResenas();
      } else {
        Alert.alert('Error', res?.error?.mensaje || 'No se pudo publicar la reseña');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error?.mensaje || 'Error de conexión. Intenta de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setEnviando(false);
    }
  };

  // ── Abrir edición ────────────────────────────────────────
  const abrirEdicion = (r: ReseñaAPI) => {
    setEditandoId(r.id);
    setEditTexto(r.comentario ?? '');
    setEditEstrellas(r.calificacion);
    setEditFotos([]);
    setErrorEdicion(null);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditTexto(''); setEditEstrellas(0); setEditFotos([]);
    setErrorEdicion(null);
  };

  const guardarEdicion = async () => {
    if (!editTexto.trim())   { Alert.alert(t('review_write'));  return; }
    if (editEstrellas === 0) { Alert.alert(t('review_rating')); return; }
    if (tienePalabrasProhibidas(editTexto)) {
      setErrorEdicion(t('review_profanity_warning'));
      return;
    }
    setErrorEdicion(null);
    setGuardandoEdicion(true);
    try {
      const res = await editarResena(editandoId!, {
        calificacion: editEstrellas,
        comentario: editTexto.trim(),
      });
      if (res?.success) {
        // Subir nuevas fotos si las hay
        for (const foto of editFotos) {
          try {
            await subirFotoResena(editandoId!, foto.base64);
          } catch (e) {
            if (__DEV__) console.warn('[Reseñas] error subiendo foto edición:', e);
          }
        }
        cancelarEdicion();
        Alert.alert('¡Listo!', t('review_save'));
        cargarResenas();
      } else {
        Alert.alert('Error', res?.error?.mensaje || 'No se pudo guardar la edición');
      }
    } catch {
      Alert.alert('Error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const confirmarEliminar = (id: number) => {
    Alert.alert(
      t('review_delete'),
      t('review_delete_confirm'),
      [
        { text: t('profile_cancel'), style: 'cancel' },
        {
          text: t('review_delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarResena(id);
              cargarResenas();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la reseña.');
            }
          },
        },
      ]
    );
  };

  // ── Reportar reseña ─────────────────────────────────────
  const abrirReporte = (id: number) => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    setReportandoId(id);
    setReporteModal(true);
  };

  const enviarReporte = async (motivo: string) => {
    if (!reportandoId) return;
    setEnviandoReporte(true);
    try {
      await crearReporte({ tipo_entidad: 'resena', id_entidad: reportandoId, motivo });
      setReporteModal(false);
      setReportandoId(null);
      Alert.alert('Reporte enviado', 'Gracias. Un moderador revisará el contenido.');
    } catch (e: any) {
      const codigo = e?.response?.data?.error?.codigo;
      if (codigo === 'REPORTE_DUPLICADO') {
        Alert.alert('Ya reportado', 'Ya habías reportado esta reseña anteriormente.');
      } else {
        Alert.alert('Error', 'No se pudo enviar el reporte. Intenta de nuevo.');
      }
      setReporteModal(false);
      setReportandoId(null);
    } finally {
      setEnviandoReporte(false);
    }
  };

  const FotosRow = ({ fotosActuales, setFn }: { fotosActuales: FotoLocal[]; setFn: (f: FotoLocal[]) => void }) => (
    <View style={s.fotosRow}>
      {fotosActuales.map((foto, index) => (
        <View key={index} style={s.fotoWrapper}>
          <Image source={{ uri: foto.uri }} style={s.fotoPreview} />
          <Pressable style={s.eliminarFoto} onPress={() => setFn(fotosActuales.filter((_, i) => i !== index))}>
            <Ionicons name="close-circle" size={20} color="#E11D48" />
          </Pressable>
        </View>
      ))}
      {fotosActuales.length < 3 && (
        <Pressable style={s.addFotoBtn} onPress={() => seleccionarFoto(fotosActuales, setFn)}>
          <Ionicons name="camera-outline" size={24} color="#E96928" />
          <Text style={s.addFotoText}>{t('review_photo')}</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={s.container}>
      <LoginRequiredModal
        visible={loginModal}
        onClose={() => setLoginModal(false)}
        onGoLogin={() => { setLoginModal(false); router.push('/perfil'); }}
      />

      {/* ── MODAL REPORTE ── */}
      <Modal visible={reporteModal} transparent animationType="fade">
        <View style={m.backdrop}>
          <View style={m.sheet}>
            <View style={[m.iconWrap, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Ionicons name="flag" size={28} color="#EF4444" />
            </View>
            <Text style={m.title}>Reportar reseña</Text>
            <Text style={m.body}>¿Por qué quieres reportar este contenido?</Text>
            {[
              'Contenido inapropiado',
              'Información falsa',
              'Spam o publicidad',
              'Lenguaje ofensivo',
              'Otro',
            ].map(motivo => (
              <Pressable
                key={motivo}
                style={[m.primaryBtn, { backgroundColor: '#F3F4F6', marginBottom: 0 }]}
                onPress={() => enviarReporte(motivo)}
                disabled={enviandoReporte}
              >
                {enviandoReporte
                  ? <ActivityIndicator color="#E96928" size="small" />
                  : <Text style={[m.primaryBtnText, { color: '#1A1A1A' }]}>{motivo}</Text>
                }
              </Pressable>
            ))}
            <Pressable style={m.cancelBtn} onPress={() => { setReporteModal(false); setReportandoId(null); }}>
              <Text style={m.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={s.headerRow}>
        <Text style={s.sectionTitle}>
          {t('review_count')} ({lista.length})
        </Text>
        {promedio !== null && (
          <View style={s.promedioWrap}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={s.promedioText}>{promedio.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* ══ FORMULARIO ══ */}
      {isAuthenticated ? (
        <View style={s.form}>
          <Text style={s.formTitle}>{t('review_write')}</Text>

          <View style={s.starsRow}>
            <Text style={s.starsLabel}>{t('review_rating')}:</Text>
            <Estrellas valor={estrellas} onSelect={setEstrellas} />
          </View>

          <TextInput
            style={[s.textArea, errorTexto ? s.textAreaError : null]}
            placeholder={t('review_experience')}
            placeholderTextColor={colors.subtext}
            value={texto}
            onChangeText={(v) => { setTexto(v); if (errorTexto) setErrorTexto(null); }}
            multiline
            numberOfLines={4}
          />
          {errorTexto ? (
            <View style={s.errorRow}>
              <Ionicons name="warning-outline" size={14} color="#E11D48" />
              <Text style={s.errorText}>{errorTexto}</Text>
            </View>
          ) : null}

          <FotosRow fotosActuales={fotos} setFn={setFotos} />

          <Pressable style={s.submitBtn} onPress={enviarReseña} disabled={enviando}>
            {enviando ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={18} color="#fff" />}
            <Text style={s.submitText}>
              {enviando ? t('loading') : t('review_publish')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={s.loginPrompt} onPress={() => setLoginModal(true)}>
          <Ionicons name="pencil-outline" size={22} color="#E96928" />
          <View style={{ flex: 1 }}>
            <Text style={s.loginPromptTitle}>¿Quieres dejar una reseña?</Text>
            <Text style={s.loginPromptSub}>Inicia sesión para compartir tu experiencia</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
        </Pressable>
      )}

      {/* ══ LISTA ══ */}
      {cargando ? (
        <View style={s.empty}>
          <ActivityIndicator color="#E96928" />
        </View>
      ) : lista.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="chatbubble-outline" size={40} color={colors.subtext} />
          <Text style={s.emptyText}>{t('review_first')}</Text>
        </View>
      ) : (
        lista.map(reseña => (
          <View key={reseña.id} style={s.reseñaCard}>

            {editandoId === reseña.id ? (
              <View>
                <Text style={s.editTitle}>{t('review_edit_title')}</Text>

                <View style={s.starsRow}>
                  <Text style={s.starsLabel}>{t('review_rating')}:</Text>
                  <Estrellas valor={editEstrellas} onSelect={setEditEstrellas} />
                </View>

                <TextInput
                  style={[s.textArea, errorEdicion ? s.textAreaError : null]}
                  placeholder={t('review_experience')}
                  placeholderTextColor={colors.subtext}
                  value={editTexto}
                  onChangeText={(v) => { setEditTexto(v); if (errorEdicion) setErrorEdicion(null); }}
                  multiline
                  numberOfLines={4}
                />
                {errorEdicion ? (
                  <View style={s.errorRow}>
                    <Ionicons name="warning-outline" size={14} color="#E11D48" />
                    <Text style={s.errorText}>{errorEdicion}</Text>
                  </View>
                ) : null}

                <FotosRow fotosActuales={editFotos} setFn={setEditFotos} />

                <View style={s.editBtns}>
                  <Pressable style={s.cancelBtn} onPress={cancelarEdicion}>
                    <Ionicons name="close" size={18} color={colors.text} />
                    <Text style={[s.submitText, { color: colors.text }]}>{t('profile_cancel')}</Text>
                  </Pressable>
                  <Pressable style={[s.submitBtn, { flex: 1 }]} onPress={guardarEdicion} disabled={guardandoEdicion}>
                    {guardandoEdicion
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Ionicons name="checkmark" size={18} color="#fff" />
                    }
                    <Text style={s.submitText}>
                      {guardandoEdicion ? t('loading') : t('review_save')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={s.reseñaHeader}>
                  <View style={s.avatarCircle}>
                    <Text style={s.avatarLetter}>{(reseña.usuario_nombre || '?').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.autorText}>{reseña.usuario_nombre}</Text>
                    <Text style={s.fechaText}>{reseña.fecha}</Text>
                  </View>
                  <Estrellas valor={reseña.calificacion} />
                </View>

                {!!reseña.comentario && (
                  <Text style={s.reseñaTexto}>{reseña.comentario}</Text>
                )}

                {reseña.fotos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {reseña.fotos.map((uri, i) => (
                      <Image key={i} source={{ uri }} style={s.reseñaFoto} />
                    ))}
                  </ScrollView>
                )}

                {/* Acciones: editar/eliminar si es propia, reportar si es ajena */}
                {isAuthenticated && usuario?.id && String(reseña.id_usuario) === String(usuario.id) ? (
                  <View style={s.accionesRow}>
                    <Pressable style={s.editarBtn} onPress={() => abrirEdicion(reseña)}>
                      <Ionicons name="pencil-outline" size={15} color="#E96928" />
                      <Text style={s.editarBtnText}>{t('review_edit')}</Text>
                    </Pressable>
                    <Pressable style={s.eliminarBtn} onPress={() => confirmarEliminar(reseña.id)}>
                      <Ionicons name="trash-outline" size={15} color="#E11D48" />
                      <Text style={s.eliminarBtnText}>{t('review_delete')}</Text>
                    </Pressable>
                  </View>
                ) : isAuthenticated ? (
                  <View style={[s.accionesRow, { justifyContent: 'flex-end' }]}>
                    <Pressable style={s.reportarBtn} onPress={() => abrirReporte(reseña.id)}>
                      <Ionicons name="flag-outline" size={13} color="#9CA3AF" />
                      <Text style={s.reportarBtnText}>Reportar</Text>
                    </Pressable>
                  </View>
                ) : null}
              </>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const makeStyles = (c: any, f: any) => StyleSheet.create({
  container:    { paddingHorizontal: 16, paddingBottom: 20 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 10 },
  sectionTitle: { fontSize: f.lg, fontWeight: 'bold', color: c.text },
  promedioWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,215,0,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  promedioText: { fontWeight: '700', color: c.text, fontSize: f.sm },
  form:      { backgroundColor: c.card, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: c.border },
  formTitle: { fontSize: f.md, fontWeight: 'bold', color: c.text, marginBottom: 14 },
  editTitle: { fontSize: f.md, fontWeight: 'bold', color: '#E96928', marginBottom: 14 },
  loginPrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: c.card, borderRadius: 20, padding: 18,
    marginBottom: 20, borderWidth: 1, borderColor: c.border,
  },
  loginPromptTitle: { fontWeight: '700', color: c.text, fontSize: f.sm },
  loginPromptSub:   { color: c.subtext, fontSize: f.xs, marginTop: 2 },
  starsRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  starsLabel: { fontSize: f.sm, color: c.text, fontWeight: '600' },
  textArea:      { backgroundColor: c.inputBackground, borderRadius: 12, padding: 14, fontSize: f.base, color: c.text, borderWidth: 1, borderColor: c.border, minHeight: 100, textAlignVertical: 'top', marginBottom: 4 },
  textAreaError: { borderColor: '#E11D48', borderWidth: 1.5 },
  errorRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 10, paddingHorizontal: 2 },
  errorText:     { color: '#E11D48', fontSize: f.xs, fontWeight: '600', flex: 1, lineHeight: f.xs * 1.5 },
  fotosRow:    { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  fotoWrapper: { position: 'relative' },
  fotoPreview: { width: 80, height: 80, borderRadius: 10 },
  eliminarFoto:{ position: 'absolute', top: -6, right: -6 },
  addFotoBtn:  { width: 80, height: 80, borderRadius: 10, borderWidth: 2, borderColor: '#E96928', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addFotoText: { color: '#E96928', fontSize: f.xs, marginTop: 2 },
  submitBtn:  { backgroundColor: '#E96928', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: f.base },
  editBtns:   { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn:  { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: c.border, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, backgroundColor: c.card },
  empty:      { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyText:  { color: c.subtext, fontSize: f.sm },
  reseñaCard:   { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  reseñaHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E96928', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#fff', fontWeight: 'bold', fontSize: f.md },
  autorText:    { fontWeight: 'bold', color: c.text, fontSize: f.sm },
  fechaText:    { color: c.subtext, fontSize: f.xs },
  reseñaTexto:  { color: c.text, fontSize: f.sm, lineHeight: f.sm * 1.6 },
  reseñaFoto:   { width: 120, height: 90, borderRadius: 10, marginRight: 8 },
  accionesRow:     { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 },
  editarBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E96928' },
  editarBtnText:   { color: '#E96928', fontSize: f.xs, fontWeight: '600' },
  eliminarBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E11D48' },
  eliminarBtnText: { color: '#E11D48', fontSize: f.xs, fontWeight: '600' },
  reportarBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  reportarBtnText: { color: '#9CA3AF', fontSize: f.xs, fontWeight: '500' },
});
