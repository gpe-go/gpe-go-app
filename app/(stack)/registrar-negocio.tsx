import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCategoriasAPI, registrarComercio, subirFotoLugar } from '../../src/api/api';
import { useTheme } from '../../src/context/ThemeContext';

type Categoria = { id: number; nombre: string };

const CAT_KEY_MAP: Record<string, string> = {
  'Restaurantes':    'cat_restaurantes',
  'Hoteles':         'cat_hoteles',
  'Entretenimiento': 'cat_entretenimiento',
  'Tiendas':         'cat_tiendas',
  'Servicios':       'cat_servicios',
  'Plazas':          'cat_plazas',
  'Hospitales':      'cat_hospitales',
  'Farmacias':       'cat_farmacias',
  'Supermercados':   'cat_supermercados',
  'Gasolineras':     'cat_gasolineras',
  'Parques':         'cat_parques',
  'Museos':          'cat_museos',
  'Cerros':          'cat_cerros',
  'Deporte':         'cat_deporte',
  'Cultural':        'cat_cultural',
  'Gastronomía':       'cat_gastronomia',
  'Sociales':          'cat_sociales',
  'Salón de Belleza':    'cat_salon_belleza',
  'Salones de belleza':  'cat_salon_belleza',
  'Sitios Turísticos':   'cat_sitios_turisticos',
  'Sitios turísticos':   'cat_sitios_turisticos',
  'Pueblos Mágicos':   'cat_pueblos_magicos',
};

/**
 * Input con borde animado naranja al enfocar y botón X para limpiar.
 */
function FocusInput({
  icon,
  placeholder,
  value,
  onChangeText,
  onClear,
  colors,
  fonts,
  multiline = false,
  numberOfLines,
  keyboardType = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onClear: () => void;
  colors: any;
  fonts: any;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: any;
}) {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const handleFocus = () =>
    Animated.timing(focusAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start();
  const handleBlur = () =>
    Animated.timing(focusAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start();

  const borderColor = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.border, '#E96928'],
  });
  const shadowOpacity = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.18],
  });

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        minHeight: multiline ? 90 : 50,
        marginBottom: 14,
        paddingTop: multiline ? 14 : 0,
        paddingBottom: multiline ? 10 : 0,
        borderColor,
        shadowColor: '#E96928',
        shadowOpacity,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        elevation: 0,
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={colors.subtext}
        style={{ marginRight: 8, marginTop: multiline ? 2 : 0 }}
      />
      <TextInput
        style={{
          flex: 1,
          color: colors.text,
          fontSize: fonts.base,
          ...(multiline ? { minHeight: 70, textAlignVertical: 'top' } : null),
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {value.length > 0 && (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          style={{
            paddingHorizontal: 6,
            paddingVertical: 4,
            marginLeft: 4,
            ...(multiline ? { alignSelf: 'flex-start', marginTop: 2 } : null),
          }}
        >
          <Ionicons name="close-circle" size={18} color={colors.subtext} />
        </Pressable>
      )}
    </Animated.View>
  );
}

export default function RegistrarNegocioScreen() {
  const { colors, fonts, isDark } = useTheme();
  const { t } = useTranslation();
  const s = makeStyles(colors, fonts, isDark);
  const router = useRouter();

  // StatusBar — la zona del status bar es la SafeAreaView (fondo del tema),
  // no el header naranja. Por eso usamos iconos del tema, NO siempre claros.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(colors.background);
      }
    }, [isDark, colors.background])
  );

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fotos, setFotos] = useState<{ uri: string; base64: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(bannerAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();

    getCategoriasAPI()
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setCategorias(res.data);
          if (res.data.length > 0) setCategoriaId(res.data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, [bannerAnim, formAnim, btnAnim]);

  const agregarFoto = async () => {
    if (fotos.length >= 4) {
      Alert.alert(t('biz_photos_max_title'), t('biz_photos_max_body'));
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('biz_permission_title'), t('biz_permission_body'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setFotos(prev => [
        ...prev,
        { uri: result.assets[0].uri, base64: `data:image/jpeg;base64,${result.assets[0].base64}` },
      ]);
    }
  };

  const quitarFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegistrar = async () => {
    if (!nombre.trim()) {
      Alert.alert(t('required_fields'), t('biz_name_required'));
      return;
    }
    if (!categoriaId) {
      Alert.alert(t('required_fields'), t('biz_category_required'));
      return;
    }

    setLoading(true);
    try {
      const res = await registrarComercio({
        nombre: nombre.trim(),
        id_categoria: categoriaId,
        descripcion: descripcion.trim() || undefined,
        direccion: direccion.trim() || undefined,
        telefono: telefono.trim() || undefined,
      });

      if (res?.success && res.data?.id && fotos.length > 0) {
        const id_lugar = res.data.id;
        for (let i = 0; i < fotos.length; i++) {
          try {
            await subirFotoLugar(id_lugar, fotos[i].base64, i);
          } catch {
            // Si falla una foto, continuamos con las demás
          }
        }
      }

      Alert.alert(
        t('biz_success_title'),
        t('biz_success_body'),
        [{ text: t('biz_success_btn'), onPress: () => router.back() }]
      );
    } catch (e: any) {
      const msg = e?.response?.data?.error?.mensaje || 'No se pudo registrar el negocio. Intenta de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── BANNER ── */}
      <Animated.View
        style={{
          opacity: bannerAnim,
          transform: [{ translateY: bannerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }}
      >
        <LinearGradient
          colors={['#E96928', '#C4511A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />
          <Pressable
            style={({ pressed }) => [s.closeBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
          <View style={s.bannerIconWrap}>
            <Ionicons name="storefront" size={26} color="#E96928" />
          </View>
          <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>{t('biz_title')}</Text>
          <Text style={[s.bannerSub, { fontSize: fonts.sm }]}>{t('biz_subtitle')}</Text>
        </LinearGradient>
      </Animated.View>

      {/* ── FORMULARIO ── */}
      <Animated.View
        style={{
          opacity: formAnim,
          transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }}
      >
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>{t('biz_section_data')}</Text>
          </View>

          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Nombre */}
            <Text style={[s.label, { color: colors.subtext, fontSize: fonts.xs }]}>
              {t('biz_name_label')}
            </Text>
            <FocusInput
              icon="storefront-outline"
              placeholder={t('biz_name_placeholder')}
              value={nombre}
              onChangeText={setNombre}
              onClear={() => setNombre('')}
              colors={colors}
              fonts={fonts}
            />

            {/* Categoría */}
            <Text style={[s.label, { color: colors.subtext, fontSize: fonts.xs }]}>
              {t('biz_category_label')}
            </Text>
            {loadingCats ? (
              <ActivityIndicator color="#E96928" style={{ marginBottom: 12 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContent}>
                {categorias.map(cat => (
                  <Pressable
                    key={cat.id}
                    style={({ pressed }) => [
                      s.catChip,
                      {
                        backgroundColor: categoriaId === cat.id ? '#E96928' : colors.inputBackground,
                        borderColor: categoriaId === cat.id ? '#E96928' : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                    onPress={() => setCategoriaId(cat.id)}
                  >
                    <Text style={[s.catChipText, { color: categoriaId === cat.id ? '#fff' : colors.text, fontSize: fonts.xs }]}>
                      {t(CAT_KEY_MAP[cat.nombre] ?? cat.nombre)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Descripción */}
            <Text style={[s.label, { color: colors.subtext, fontSize: fonts.xs }]}>
              {t('biz_desc_label')}
            </Text>
            <FocusInput
              icon="document-text-outline"
              placeholder={t('biz_desc_placeholder')}
              value={descripcion}
              onChangeText={setDescripcion}
              onClear={() => setDescripcion('')}
              colors={colors}
              fonts={fonts}
              multiline
              numberOfLines={3}
            />

            {/* Dirección */}
            <Text style={[s.label, { color: colors.subtext, fontSize: fonts.xs }]}>
              {t('address')}
            </Text>
            <FocusInput
              icon="location-outline"
              placeholder={t('biz_address_placeholder')}
              value={direccion}
              onChangeText={setDireccion}
              onClear={() => setDireccion('')}
              colors={colors}
              fonts={fonts}
            />

            {/* Teléfono */}
            <Text style={[s.label, { color: colors.subtext, fontSize: fonts.xs }]}>
              {t('phone')}
            </Text>
            <FocusInput
              icon="call-outline"
              placeholder={t('biz_phone_placeholder')}
              value={telefono}
              onChangeText={setTelefono}
              onClear={() => setTelefono('')}
              colors={colors}
              fonts={fonts}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ── FOTOS ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={[s.sectionTitle, { fontSize: fonts.md }]}>
              {t('biz_photos_label')} ({fotos.length}/4)
            </Text>
          </View>

          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.photoHint, { color: colors.subtext, fontSize: fonts.xs }]}>
              {t('biz_photos_hint')}
            </Text>

            <View style={s.fotosGrid}>
              {fotos.map((foto, i) => (
                <View key={i} style={s.fotoWrap}>
                  <Image source={{ uri: foto.uri }} style={s.fotoImg} />
                  <Pressable
                    style={s.fotoRemove}
                    onPress={() => quitarFoto(i)}
                  >
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  </Pressable>
                </View>
              ))}

              {fotos.length < 4 && (
                <Pressable
                  style={({ pressed }) => [
                    s.fotoAdd,
                    { backgroundColor: colors.inputBackground, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={agregarFoto}
                >
                  <Ionicons name="camera-outline" size={28} color="#E96928" />
                  <Text style={[s.fotoAddText, { color: colors.subtext, fontSize: fonts.xs }]}>
                    {t('biz_photos_add')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ── BOTÓN REGISTRAR ── */}
      <Animated.View
        style={{
          opacity: btnAnim,
          transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          paddingHorizontal: 20,
          marginTop: 8,
        }}
      >
        <Pressable
          style={({ pressed }) => [
            s.submitBtn,
            { opacity: pressed || loading ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={handleRegistrar}
          disabled={loading}
        >
          <LinearGradient
            colors={['#E96928', '#C4511A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.submitGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={[s.submitText, { fontSize: fonts.md }]}>{t('biz_submit')}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={[s.pendingNote, { color: colors.subtext, fontSize: fonts.xs }]}>
          {t('biz_pending_note')}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },

  banner: {
    paddingHorizontal: 22, paddingTop: 56, paddingBottom: 30,
    overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -50 },
  circle2: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -30 },
  closeBtn: { position: 'absolute', top: 52, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  bannerIconWrap: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  bannerTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '500' },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot: { width: 4, height: 20, borderRadius: 2, backgroundColor: '#E96928' },
  sectionTitle: { fontWeight: '800', color: c.text },

  card: { borderRadius: 22, padding: 18, borderWidth: 1, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 6 },

  label: { fontWeight: '600', marginBottom: 6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, minHeight: 50, marginBottom: 14 },
  textAreaWrap: { alignItems: 'flex-start', paddingTop: 12, paddingBottom: 10 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1 },
  textArea: { minHeight: 72, textAlignVertical: 'top' },

  catScroll: { marginBottom: 14 },
  catContent: { gap: 8, paddingBottom: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontWeight: '600' },

  photoHint: { marginBottom: 14 },
  fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fotoWrap: { width: 80, height: 80, borderRadius: 12, overflow: 'visible' },
  fotoImg: { width: 80, height: 80, borderRadius: 12 },
  fotoRemove: { position: 'absolute', top: -8, right: -8 },
  fotoAdd: { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 4 },
  fotoAddText: { fontWeight: '600' },

  submitBtn: { borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#E96928', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  submitText: { color: '#fff', fontWeight: '800' },

  pendingNote: { textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
