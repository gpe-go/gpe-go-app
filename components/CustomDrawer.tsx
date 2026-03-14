import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
// IMPORTANTE: Importamos DrawerContentScrollView
import {
  DrawerContentComponentProps,
  DrawerItemList,
  DrawerContentScrollView
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawer(props: DrawerContentComponentProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#E96928' }}>
      {/* Envolvemos todo lo que queremos que se deslice dentro de DrawerContentScrollView.
          contentContainerStyle se asegura de que el fondo naranja cubra todo el espacio.
      */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: '#E96928', paddingTop: 0 }}
      >
        {/* CABECERA (Se deslizará junto con los botones) */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000&auto=format&fit=crop' }}
          style={styles.headerBackground}
        >
          <View style={styles.overlay}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
              style={styles.userPhoto}
            />
            <Text style={styles.userName}>Usuario Guadalupe</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#fff" />
              <Text style={styles.userLocation}>Nuevo León, MX</Text>
            </View>
          </View>
        </ImageBackground>

        {/* LISTA DE BOTONES (Ahora tienen espacio para respirar) */}
        <View style={styles.drawerListWrapper}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* FOOTER (Este se queda fijo abajo, fuera del scroll para que siempre se vea) */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión 1.0.2 - 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    height: 200,
    justifyContent: 'flex-end'
  },
  overlay: {
    backgroundColor: 'rgba(233, 105, 40, 0.8)',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4
  },
  userLocation: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9
  },
  drawerListWrapper: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20 // Espacio extra al final de la lista
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#E96928' // Asegura que el footer tape lo de atrás si llega hasta abajo
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center'
  },
});