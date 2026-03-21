import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Componentes y Contextos
import CustomDrawer from '../../components/CustomDrawer';
import { ConfigProvider, useConfig } from '../../src/context/ConfigContext';

const { width } = Dimensions.get('window');

function InnerLayout() {
  const router = useRouter();
  const { t } = useConfig();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: true,
          // --- EFECTO DE ANIMACIÓN TIPO VIDEO ---
          drawerType: 'slide', // El contenido se desplaza con el menú
          drawerStyle: {
            width: width * 0.70, // Ancho de la barra lateral (75% de la pantalla)
            backgroundColor: '#ffffff',
          },
          overlayColor: 'rgba(0,0,0,0.5)', // Oscurece el fondo al abrir

          // --- ESTILOS DE LOS ITEMS (UNIFORMES) ---
          drawerActiveBackgroundColor: '#f8f9fa',
          drawerActiveTintColor: '#E96928',
          drawerInactiveTintColor: '#40454c',
          drawerItemStyle: {
            borderRadius: 12,
            marginVertical: 2,
            marginHorizontal: 8,
            paddingHorizontal: 10,
          },
          drawerLabelStyle: {
            fontWeight: '600',
            fontSize: 15,
            marginLeft: -10, // Acerca el texto al icono
          },

          // --- HEADER PERSONALIZADO ---
          header: ({ navigation }) => (
            <View style={styles.headerContainer}>
              <Pressable onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                <Ionicons name="menu-outline" size={28} color="#E96928" />
              </Pressable>

              <View style={styles.logoWrapper}>
                <View style={styles.orangeIconBg}>
                  <Ionicons name="location" size={12} color="white" />
                </View>
                <Text style={styles.logoText}>
                  Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => router.push('/configuracion')}
                >
                  <Ionicons name="settings-outline" size={24} color="#E96928" />
                </Pressable>

                <Pressable
                  style={styles.iconButton}
                  onPress={() => router.push('/perfil')}
                >
                  <Ionicons name="person-outline" size={26} color="#E96928" />
                </Pressable>
              </View>
            </View>
          ),
        }}
      >
        {/* ÍCONOS UNIFORMES: Todos usan la versión "-outline" para consistencia visual */}

        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: t.inicio,
            drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />
          }}
        />

        <Drawer.Screen
          name="noticias"
          options={{
            drawerLabel: t.noticias,
            drawerIcon: ({ color }) => <Ionicons name="newspaper-outline" size={22} color={color} />
          }}
        />

        <Drawer.Screen
          name="eventos"
          options={{
            drawerLabel: t.eventos,
            drawerIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />
          }}
        />

        <Drawer.Screen
          name="directorio"
          options={{
            drawerLabel: t.directorio,
            drawerIcon: ({ color }) => <Ionicons name="business-outline" size={22} color={color} />
          }}
        />

        <Drawer.Screen
          name="explorar"
          options={{
            drawerLabel: t.explorar,
            drawerIcon: ({ color }) => <Ionicons name="compass-outline" size={22} color={color} />
          }}
        />

        <Drawer.Screen
          name="favoritos"
          options={{
            drawerLabel: t.favoritos,
            drawerIcon: ({ color }) => <Ionicons name="heart-outline" size={22} color={color} />
          }}
        />

        <Drawer.Screen
          name="contacto"
          options={{
            drawerLabel: 'Contacto',
            drawerIcon: ({ color }) => <Ionicons name="mail-outline" size={22} color={color} />
          }}
        />

        {/* Pantallas ocultas */}
        <Drawer.Screen
          name="perfil"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false
          }}
        />

        <Drawer.Screen
          name="configuracion"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false
          }}
        />

        <Drawer.Screen
          name="detalleNoticia"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function Layout() {
  return (
    <ConfigProvider>
      <InnerLayout />
    </ConfigProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: Platform.OS === 'android' ? 90 : 100,
    paddingTop: Platform.OS === 'android' ? 30 : 45,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  orangeIconBg: {
    backgroundColor: '#E96928',
    padding: 5,
    borderRadius: 8,
    marginRight: 8
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B'
  },
  iconButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
});