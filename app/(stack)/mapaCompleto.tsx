import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';

const DEFAULT_REGION = {
  latitude: 25.676,
  longitude: -100.256,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapaCompletoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    from?: string;
  }>();

  const initialLat = params.latitude ? parseFloat(params.latitude) : null;
  const initialLng = params.longitude ? parseFloat(params.longitude) : null;

  const [region, setRegion] = useState(
    initialLat && initialLng
      ? { latitude: initialLat, longitude: initialLng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
      : DEFAULT_REGION
  );

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialLat && initialLng ? { latitude: initialLat, longitude: initialLng } : null
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserLocation(coords);

      if (!initialLat) {
        const newRegion = { ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 600);
      }
    })();
  }, []);

  const centerOnUser = useCallback(() => {
    if (!userLocation) return;
    const r = { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    mapRef.current?.animateToRegion(r, 600);
  }, [userLocation]);

  const openExternalMaps = useCallback(() => {
    if (!userLocation) return;
    const { latitude, longitude } = userLocation;

    if (Platform.OS === 'ios') {
      Alert.alert(
        t('open_in_maps', { defaultValue: 'Abrir en Mapas' }),
        t('choose_maps_app', { defaultValue: 'Elige la aplicación de mapas' }),
        [
          {
            text: 'Apple Maps',
            onPress: () =>
              Linking.openURL(`maps:?ll=${latitude},${longitude}&z=15`),
          },
          {
            text: 'Google Maps',
            onPress: () =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
              ),
          },
          { text: t('cancel', { defaultValue: 'Cancelar' }), style: 'cancel' },
        ]
      );
    } else {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      );
    }
  }, [userLocation, t]);

  const isDark = colors.background !== '#fafafa' && colors.background !== '#ffffff';

  return (
    <View style={ms.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={ms.markerOuter}>
              <View style={ms.markerInner} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Top bar */}
      <View style={[ms.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [
            ms.topBtn,
            { backgroundColor: isDark ? '#1e1e1e' : '#fff', opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? '#e5e5e5' : '#222'} />
        </Pressable>

        <View style={[ms.titlePill, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Ionicons name="map" size={16} color="#E96928" />
          <Text style={[ms.titleText, { color: isDark ? '#e5e5e5' : '#222', fontSize: fonts.base }]}>
            {t('map', { defaultValue: 'Mapa' })}
          </Text>
        </View>

        <View style={{ width: 46 }} />
      </View>

      {/* Bottom buttons */}
      <View style={[ms.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Center on user */}
        <Pressable
          style={({ pressed }) => [
            ms.fabBtn,
            { backgroundColor: isDark ? '#1e1e1e' : '#fff', opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={centerOnUser}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#E96928" />
        </Pressable>

        {/* Open external maps */}
        <Pressable
          style={({ pressed }) => [
            ms.externalBtn,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={openExternalMaps}
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={[ms.externalBtnText, { fontSize: fonts.sm }]}>
            {Platform.OS === 'ios'
              ? t('open_in_maps', { defaultValue: 'Abrir en Mapas' })
              : 'Google Maps'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const ms = StyleSheet.create({
  container: {
    flex: 1,
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },

  topBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  titleText: {
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },

  fabBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },

  externalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E96928',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#E96928',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  externalBtnText: {
    color: '#fff',
    fontWeight: '700',
  },

  markerOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(233,105,40,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  markerInner: {
    width: 16,
    height: 16,
    backgroundColor: '#E96928',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
});
