import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawer(props: any) {
  return (
    <View style={styles.container}>
      {/* Header del Drawer */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.orangeIconBg}>
            <Ionicons name="location" size={18} color="white" />
          </View>
          <Text style={styles.logoText}>
            Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
          </Text>
        </View>
        <Text style={styles.subtitle}>Tu guia en Guadalupe</Text>
      </View>

      {/* Items de navegacion */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>GuadalupeGO v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#E96928',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeIconBg: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});
