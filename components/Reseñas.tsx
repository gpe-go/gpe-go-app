import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  Image, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useReseñas } from '../src/context/ReseñasContext';
import { useTheme } from '../src/context/ThemeContext';

type Props = {
  lugarId: string;
};

export default function Reseñas({ lugarId }: Props) {
  const { colors, fonts } = useTheme();
  const s = makeStyles(colors, fonts);
  const { agregarReseña, obtenerReseñas } = useReseñas();

  const [autor, setAutor]       = useState('');
  const [texto, setTexto]       = useState('');
  const [estrellas, setEstrellas] = useState(0);
  const [fotos, setFotos]       = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  const listaReseñas = obtenerReseñas(lugarId);

  // ─── Seleccionar foto ──────────────────────────────────
  const seleccionarFoto = async () => {
    if (fotos.length >= 3) {
      Alert.alert('Máximo 3 fotos', 'Solo puedes agregar hasta 3 fotos por reseña.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setFotos([...fotos, result.assets[0].uri]);
    }
  };

  const eliminarFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  // ─── Enviar reseña ─────────────────────────────────────
  const enviarReseña = async () => {
    if (!autor.trim()) { Alert.alert('Falta tu nombre'); return; }
    if (!texto.trim()) { Alert.alert('Escribe tu reseña'); return; }
    if (estrellas === 0) { Alert.alert('Elige una calificación'); return; }

    setEnviando(true);
    await agregarReseña({ lugarId, autor, texto, estrellas, fotos });
    setAutor('');
    setTexto('');
    setEstrellas(0);
    setFotos([]);
    setEnviando(false);
    Alert.alert('¡Gracias!', 'Tu reseña fue publicada.');
  };

  // ─── Estrellas interactivas ────────────────────────────
  const Estrellas = ({ valor, onSelect }: { valor: number; onSelect?: (n: number) => void }) => (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Pressable key={n} onPress={() => onSelect?.(n)}>
          <Ionicons
            name={n <= valor ? 'star' : 'star-outline'}
            size={onSelect ? 28 : 16}
            color="#FFD700"
          />
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Reseñas ({listaReseñas.length})</Text>

      {/* ── FORMULARIO ── */}
      <View style={s.form}>
        <Text style={s.formTitle}>Escribe tu reseña</Text>

        {/* Nombre */}
        <View style={s.inputWrapper}>
          <Ionicons name="person-outline" size={18} color={colors.subtext} />
          <TextInput
            style={s.input}
            placeholder="Tu nombre"
            placeholderTextColor={colors.subtext}
            value={autor}
            onChangeText={setAutor}
          />
        </View>

        {/* Calificación */}
        <View style={s.starsRow}>
          <Text style={s.starsLabel}>Calificación:</Text>
          <Estrellas valor={estrellas} onSelect={setEstrellas} />
        </View>

        {/* Texto */}
        <TextInput
          style={s.textArea}
          placeholder="Cuéntanos tu experiencia..."
          placeholderTextColor={colors.subtext}
          value={texto}
          onChangeText={setTexto}
          multiline
          numberOfLines={4}
        />

        {/* Fotos */}
        <View style={s.fotosRow}>
          {fotos.map((uri, index) => (
            <View key={index} style={s.fotoWrapper}>
              <Image source={{ uri }} style={s.fotoPreview} />
              <Pressable style={s.eliminarFoto} onPress={() => eliminarFoto(index)}>
                <Ionicons name="close-circle" size={20} color="#E11D48" />
              </Pressable>
            </View>
          ))}
          {fotos.length < 3 && (
            <Pressable style={s.addFotoBtn} onPress={seleccionarFoto}>
              <Ionicons name="camera-outline" size={24} color="#E96928" />
              <Text style={s.addFotoText}>Foto</Text>
            </Pressable>
          )}
        </View>

        {/* Botón enviar */}
        <Pressable style={s.submitBtn} onPress={enviarReseña} disabled={enviando}>
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={s.submitText}>{enviando ? 'Publicando...' : 'Publicar reseña'}</Text>
        </Pressable>
      </View>

      {/* ── LISTA DE RESEÑAS ── */}
      {listaReseñas.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="chatbubble-outline" size={40} color={colors.subtext} />
          <Text style={s.emptyText}>Sé el primero en dejar una reseña</Text>
        </View>
      ) : (
        listaReseñas.slice().reverse().map(reseña => (
          <View key={reseña.id} style={s.reseñaCard}>
            <View style={s.reseñaHeader}>
              <View style={s.avatarCircle}>
                <Text style={s.avatarLetter}>
                  {reseña.autor.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.autorText}>{reseña.autor}</Text>
                <Text style={s.fechaText}>{reseña.fecha}</Text>
              </View>
              <Estrellas valor={reseña.estrellas} />
            </View>

            <Text style={s.reseñaTexto}>{reseña.texto}</Text>

            {/* Fotos de la reseña */}
            {reseña.fotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {reseña.fotos.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={s.reseñaFoto} />
                ))}
              </ScrollView>
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

  // Formulario
  form:      { backgroundColor: c.card, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: c.border },
  formTitle: { fontSize: f.md, fontWeight: 'bold', color: c.text, marginBottom: 14 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.inputBackground, borderRadius: 12,
    paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: c.border, marginBottom: 12,
  },
  input: { flex: 1, marginLeft: 10, fontSize: f.base, color: c.text },

  starsRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  starsLabel: { fontSize: f.sm, color: c.text, fontWeight: '600' },

  textArea: {
    backgroundColor: c.inputBackground, borderRadius: 12,
    padding: 14, fontSize: f.base, color: c.text,
    borderWidth: 1, borderColor: c.border,
    minHeight: 100, textAlignVertical: 'top', marginBottom: 12,
  },

  // Fotos
  fotosRow:    { flexDirection: 'row', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  fotoWrapper: { position: 'relative' },
  fotoPreview: { width: 80, height: 80, borderRadius: 10 },
  eliminarFoto: { position: 'absolute', top: -6, right: -6 },
  addFotoBtn: {
    width: 80, height: 80, borderRadius: 10,
    borderWidth: 2, borderColor: '#E96928', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  addFotoText: { color: '#E96928', fontSize: f.xs, marginTop: 2 },

  submitBtn: {
    backgroundColor: '#E96928', borderRadius: 12,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8, paddingVertical: 14,
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: f.base },

  // Lista
  empty:     { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyText: { color: c.subtext, fontSize: f.sm },

  reseñaCard: {
    backgroundColor: c.card, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: c.border,
  },
  reseñaHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E96928', justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: { color: '#fff', fontWeight: 'bold', fontSize: f.md },
  autorText:    { fontWeight: 'bold', color: c.text, fontSize: f.sm },
  fechaText:    { color: c.subtext, fontSize: f.xs },
  reseñaTexto:  { color: c.text, fontSize: f.sm, lineHeight: f.sm * 1.6 },
  reseñaFoto:   { width: 120, height: 90, borderRadius: 10, marginRight: 8 },
});