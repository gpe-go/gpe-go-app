import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawer(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header del drawer */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.orangeIconBg}>
            <Ionicons name="location" size={18} color="white" />
          </View>
          <Text style={styles.logoText}>
            Guadalupe<Text style={{ color: '#E96928' }}>GO</Text>
          </Text>
        </View>
        <Text style={styles.subtitle}>Descubre tu ciudad</Text>
      </View>

      {/* Items del menú */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orangeIconBg: {
    backgroundColor: '#E96928',
    padding: 7,
    borderRadius: 10,
    marginRight: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 2,
  },
});
