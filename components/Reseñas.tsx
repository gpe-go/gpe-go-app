import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  Image, Alert, ScrollView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useReseñas, Reseña } from '../src/context/ReseñasContext';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

type Props = { lugarId: string };

function Estrellas({ valor, onSelect }: { valor: number; onSelect?: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Pressable key={n} onPress={() => onSelect?.(n)} disabled={!onSelect}>
          <Ionicons name={n <= valor ? 'star' : 'star-outline'} size={onSelect ? 28 : 16} color="#FFD700" />
        </Pressable>
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
  const { agregarReseña, editarReseña, eliminarReseña, obtenerReseñas } = useReseñas();
  const { isAuthenticated, usuario } = useAuth();
  const router = useRouter();

  const [autor,     setAutor]     = useState('');
  const [texto,     setTexto]     = useState('');
  const [estrellas, setEstrellas] = useState(0);
  const [fotos,     setFotos]     = useState<string[]>([]);
  const [enviando,  setEnviando]  = useState(false);
  const [loginModal, setLoginModal] = useState(false);

  const [editandoId,       setEditandoId]       = useState<string | null>(null);
  const [editAutor,        setEditAutor]        = useState('');
  const [editTexto,        setEditTexto]        = useState('');
  const [editEstrellas,    setEditEstrellas]    = useState(0);
  const [editFotos,        setEditFotos]        = useState<string[]>([]);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const listaReseñas = obtenerReseñas(lugarId);

  const seleccionarFoto = async (fotosActuales: string[], setFn: (f: string[]) => void) => {
    if (fotosActuales.length >= 3) {
      Alert.alert('Máximo 3 fotos', 'Solo puedes agregar hasta 3 fotos por reseña.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('profile_permission_gallery'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.7,
    });
    if (!result.canceled) setFn([...fotosActuales, result.assets[0].uri]);
  };

  const enviarReseña = async () => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    const nombreAutor = autor.trim() || usuario?.nombre || 'Anónimo';
    if (!texto.trim())   { Alert.alert(t('review_write'));   return; }
    if (estrellas === 0) { Alert.alert(t('review_rating'));  return; }
    setEnviando(true);
    await agregarReseña({ lugarId, autor: nombreAutor, texto, estrellas, fotos });
    setAutor(''); setTexto(''); setEstrellas(0); setFotos([]);
    setEnviando(false);
    Alert.alert('¡Gracias!', t('review_publish'));
  };

  const abrirEdicion = (r: Reseña) => {
    setEditandoId(r.id); setEditAutor(r.autor);
    setEditTexto(r.texto); setEditEstrellas(r.estrellas);
    setEditFotos([...r.fotos]);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditAutor(''); setEditTexto(''); setEditEstrellas(0); setEditFotos([]);
  };

  const guardarEdicion = async () => {
    if (!editAutor.trim())   { Alert.alert(t('review_name'));   return; }
    if (!editTexto.trim())   { Alert.alert(t('review_write'));  return; }
    if (editEstrellas === 0) { Alert.alert(t('review_rating')); return; }
    setGuardandoEdicion(true);
    await editarReseña(editandoId!, { autor: editAutor, texto: editTexto, estrellas: editEstrellas, fotos: editFotos });
    cancelarEdicion();
    setGuardandoEdicion(false);
    Alert.alert('¡Listo!', t('review_save'));
  };

  const confirmarEliminar = (id: string) => {
    Alert.alert(
      t('review_delete'),
      t('review_delete_confirm'),
      [
        { text: t('profile_cancel'), style: 'cancel' },
        { text: t('review_delete'), style: 'destructive', onPress: () => eliminarReseña(id) },
      ]
    );
  };

  const FotosRow = ({ fotosActuales, setFn }: { fotosActuales: string[]; setFn: (f: string[]) => void }) => (
    <View style={s.fotosRow}>
      {fotosActuales.map((uri, index) => (
        <View key={index} style={s.fotoWrapper}>
          <Image source={{ uri }} style={s.fotoPreview} />
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

      <Text style={s.sectionTitle}>
        {t('review_count')} ({listaReseñas.length})
      </Text>

      {/* ══ FORMULARIO ══ */}
      {isAuthenticated ? (
        <View style={s.form}>
          <Text style={s.formTitle}>{t('review_write')}</Text>

          <View style={s.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={colors.subtext} />
            <TextInput
              style={s.input}
              placeholder={usuario?.nombre || t('review_name')}
              placeholderTextColor={colors.subtext}
              value={autor}
              onChangeText={setAutor}
            />
          </View>

          <View style={s.starsRow}>
            <Text style={s.starsLabel}>{t('review_rating')}:</Text>
            <Estrellas valor={estrellas} onSelect={setEstrellas} />
          </View>

          <TextInput
            style={s.textArea}
            placeholder={t('review_experience')}
            placeholderTextColor={colors.subtext}
            value={texto}
            onChangeText={setTexto}
            multiline
            numberOfLines={4}
          />

          <FotosRow fotosActuales={fotos} setFn={setFotos} />

          <Pressable style={s.submitBtn} onPress={enviarReseña} disabled={enviando}>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={s.submitText}>
              {enviando ? t('loading') : t('review_publish')}
            </Text>
          </Pressable>
        </View>
      ) : (
        /* Invitación a iniciar sesión */
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
      {listaReseñas.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="chatbubble-outline" size={40} color={colors.subtext} />
          <Text style={s.emptyText}>{t('review_first')}</Text>
        </View>
      ) : (
        listaReseñas.slice().reverse().map(reseña => (
          <View key={reseña.id} style={s.reseñaCard}>

            {editandoId === reseña.id ? (
              <View>
                <Text style={s.editTitle}>{t('review_edit_title')}</Text>

                <View style={s.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={colors.subtext} />
                  <TextInput
                    style={s.input}
                    placeholder={t('review_name')}
                    placeholderTextColor={colors.subtext}
                    value={editAutor}
                    onChangeText={setEditAutor}
                  />
                </View>

                <View style={s.starsRow}>
                  <Text style={s.starsLabel}>{t('review_rating')}:</Text>
                  <Estrellas valor={editEstrellas} onSelect={setEditEstrellas} />
                </View>

                <TextInput
                  style={s.textArea}
                  placeholder={t('review_experience')}
                  placeholderTextColor={colors.subtext}
                  value={editTexto}
                  onChangeText={setEditTexto}
                  multiline
                  numberOfLines={4}
                />

                <FotosRow fotosActuales={editFotos} setFn={setEditFotos} />

                <View style={s.editBtns}>
                  <Pressable style={s.cancelBtn} onPress={cancelarEdicion}>
                    <Ionicons name="close" size={18} color={colors.text} />
                    <Text style={[s.submitText, { color: colors.text }]}>{t('profile_cancel')}</Text>
                  </Pressable>
                  <Pressable style={[s.submitBtn, { flex: 1 }]} onPress={guardarEdicion} disabled={guardandoEdicion}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
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
                    <Text style={s.avatarLetter}>{reseña.autor.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.autorText}>{reseña.autor}</Text>
                    <Text style={s.fechaText}>{reseña.fecha}</Text>
                  </View>
                  <Estrellas valor={reseña.estrellas} />
                </View>

                <Text style={s.reseñaTexto}>{reseña.texto}</Text>

                {reseña.fotos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {reseña.fotos.map((uri, i) => (
                      <Image key={i} source={{ uri }} style={s.reseñaFoto} />
                    ))}
                  </ScrollView>
                )}

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
  sectionTitle: { fontSize: f.lg, fontWeight: 'bold', color: c.text, marginBottom: 16, marginTop: 10 },
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
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBackground, borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: c.border, marginBottom: 12 },
  input:      { flex: 1, marginLeft: 10, fontSize: f.base, color: c.text },
  starsRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  starsLabel: { fontSize: f.sm, color: c.text, fontWeight: '600' },
  textArea:   { backgroundColor: c.inputBackground, borderRadius: 12, padding: 14, fontSize: f.base, color: c.text, borderWidth: 1, borderColor: c.border, minHeight: 100, textAlignVertical: 'top', marginBottom: 12 },
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
});
