import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFavoritos, Lugar } from '../../src/context/FavoritosContext';
import { useLugares } from '../../src/hooks/useLugares';

const CATEGORIAS = [
  { id: '1', nombre: 'Cerros', icon: 'image-filter-hdr', color: '#E96928' },
  { id: '2', nombre: 'Parques', icon: 'pine-tree', color: '#4CAF50' },
  { id: '3', nombre: 'Pueblos Mágicos', icon: 'church', color: '#9C27B0' },
  { id: '4', nombre: 'Museos', icon: 'domain', color: '#4A90E2' },
];

export default function ExplorarScreen() {
  const { toggleFavorito, esFavorito } = useFavoritos();
  const { data: sitios } = useLugares();
  const mapRef = useRef<MapView>(null);

  const [search, setSearch] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<Lugar[]>(sitios);
  const [region, setRegion] = useState<Region | null>(null);

  // Sync filteredData when hook data loads
  useEffect(() => {
    setFilteredData(sitios);
  }, [sitios]);

  /* ================= GEO ================= */

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Activa la ubicación');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const nuevaRegion = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    setRegion(nuevaRegion);
    mapRef.current?.animateToRegion(nuevaRegion, 1000);
  };

  /* ================= FILTROS ================= */

  const filtrarCategoria = (cat: string) => {
    const nueva = cat === categoriaActiva ? null : cat;
    setCategoriaActiva(nueva);
    setSearch('');
    setFilteredData(
      nueva
        ? sitios.filter((l) => l.categoria === nueva)
        : sitios
    );
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setCategoriaActiva(null);
    setFilteredData(
      sitios.filter((l) =>
        l.nombre.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const openInMaps = (nombre: string, ubicacion: string) => {
    const query = encodeURIComponent(`${nombre} ${ubicacion}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  /* ================= HEADER ================= */

  const Header = () => (
    <View>
      {/* ===== BANNER ===== */}
      <View style={styles.orangeBanner}>
        <Text style={styles.bannerTitle}>Sitios Turísticos</Text>
        <Text style={styles.bannerSub}>
          Explora los lugares más emblemáticos
        </Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Buscar lugares"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>
        {/* ===== RESULTADOS DE BÚSQUEDA ===== */}
        {search.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={styles.searchTitle}>Resultados de búsqueda</Text>

            {filteredData.length === 0 ? (
              <Text style={styles.noResults}>No se encontraron lugares</Text>
            ) : (
              filteredData.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.searchItem}
                  onPress={() => openInMaps(item.nombre, item.ubicacion)}
                >
                  <Ionicons name="location-outline" size={18} color="#E96928" />
                  <Text style={styles.searchItemText}>{item.nombre}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>

      {/* ===== MAPA ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mapa del Estado</Text>

        <View style={styles.mapBox}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={
              region ?? {
                latitude: 25.676,
                longitude: -100.256,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }
            }
          >
            {region && <Marker coordinate={region} />}
          </MapView>

          <Pressable style={styles.locationBtn} onPress={obtenerUbicacion}>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color="#E96928"
            />
          </Pressable>
        </View>

        {/* ===== CATEGORÍAS ===== */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
          Categorías
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }} // 👈 ESPACIO EXTRA
        >
          {CATEGORIAS.map((cat) => {
            const activa = categoriaActiva === cat.nombre;
            return (
              <Pressable
                key={cat.id}
                onPress={() => filtrarCategoria(cat.nombre)}
                style={[
                  styles.categoryCard,
                  activa && { borderColor: cat.color, borderWidth: 2 },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: cat.color + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={26}
                    color={cat.color}
                  />
                </View>
                <Text style={styles.catName}>{cat.nombre}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitleAlt}>
        {categoriaActiva ?? 'Descubre Nuevos Lugares'}
      </Text>
    </View>
  );

  /* ================= RENDER ================= */

  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      numColumns={2}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Ionicons name="compass-outline" size={48} color="#cbd5e1" />
          <Text style={{ color: '#94a3b8', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
            Todavía no hay lugares disponibles
          </Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      style={{ backgroundColor: '#F8FAFC' }}
      renderItem={({ item }) => (
        <View style={styles.placeCard}>
          <Image source={{ uri: item.imagen }} style={styles.placeImg} />

          <Pressable
            style={styles.heartBadge}
            onPress={() => toggleFavorito(item)}
          >
            <Ionicons
              name={esFavorito(item.id) ? 'heart' : 'heart-outline'}
              size={18}
              color={esFavorito(item.id) ? '#E11D48' : '#fff'}
            />
          </Pressable>

          <View style={styles.cardInfo}>
            <Text style={styles.placeName} numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text style={styles.placeSub}>{item.ubicacion}</Text>
            <Text style={styles.placeCost}>{item.costo}</Text>

            <Pressable
              style={styles.mapBtn}
              onPress={() => openInMaps(item.nombre, item.ubicacion)}
            >
              <Ionicons name="navigate" size={14} color="#fff" />
              <Text style={styles.mapBtnText}>Ver mapa</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  orangeBanner: {
    backgroundColor: '#E96928',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  bannerSub: { color: '#fff', fontSize: 14, opacity: 0.9, marginBottom: 10 },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#1E293B' },

  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  sectionTitleAlt: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 16, // 👈 ESPACIO ENTRE CATEGORÍAS Y TÍTULO
    marginBottom: 10,
    color: '#1E293B',
  },

  mapBox: {
    height: 170,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#E96928',
    backgroundColor: '#fff',
  },
  locationBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryCard: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 105,
    marginTop: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catName: {
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    color: '#1E293B',
  },

  placeCard: {
    width: '44%',
    backgroundColor: '#fff',
    margin: '3%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  placeImg: { width: '100%', height: 120 },
  heartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 5,
  },
  cardInfo: { padding: 12 },
  placeName: { fontWeight: 'bold', fontSize: 14 },
  placeSub: { fontSize: 11, color: '#64748B' },
  placeCost: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#E96928',
  },

  mapBtn: {
    backgroundColor: '#E96928',
    marginTop: 8,
    padding: 7,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 8,
  },

  searchTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1E293B',
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  searchItemText: {
    color: '#1E293B',
    fontSize: 13,
  },

  noResults: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#64748B',
    fontSize: 13,
  },
  mapBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});
