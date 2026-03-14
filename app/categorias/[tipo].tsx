import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LUGARES } from "../../src/data/lugares";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritos } from '../../src/context/FavoritosContext';

export default function Categoria() {
    const { tipo } = useLocalSearchParams();
    const router = useRouter();
    const { toggleFavorito, esFavorito } = useFavoritos();

    const lugares = LUGARES.filter((item) => item.categoria === tipo);

    return (
        <View style={styles.container}>
            {/* Header con botón de regresar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{tipo}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {lugares.map((item: any) => (
                    <Pressable
                        key={item.id}
                        style={styles.card}
                        onPress={() => router.push(`/lugar/${item.id}`)}
                    >
                        <Image source={{ uri: item.imagen }} style={styles.image} />

                        <View style={styles.overlay} />

                        <View style={styles.topInfo}>
                            <View style={styles.ratingBox}>
                                <Text style={styles.stars}>⭐⭐⭐⭐<Text style={{ color: '#666' }}>⭐</Text></Text>
                            </View>

                            {/* Corazón Sincronizado */}
                            <TouchableOpacity
                                onPress={() => toggleFavorito(item)}
                                style={styles.heartBtn}
                            >
                                <Ionicons
                                    name={esFavorito(item.id) ? "heart" : "heart-outline"}
                                    size={26}
                                    color={esFavorito(item.id) ? "#e63946" : "#fff"}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomInfo}>
                            <View>
                                <Text style={styles.nombreText}>{item.nombre}</Text>
                                <Text style={styles.categoriaText}>{item.categoria}</Text>
                            </View>
                            <Text style={styles.precioText}>{item.costo || item.precio}</Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    backButton: { padding: 5 },
    title: { fontSize: 20, fontWeight: "600", textTransform: 'capitalize' },
    scrollContent: { padding: 15 },
    card: {
        height: 200,
        marginBottom: 15,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#000",
        elevation: 4,
    },
    image: { width: "100%", height: "100%", position: 'absolute', opacity: 0.8 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
    topInfo: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
    ratingBox: { flexDirection: 'row' },
    stars: { fontSize: 14 },
    heartBtn: { padding: 5 },
    bottomInfo: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 15,
    },
    nombreText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    categoriaText: { color: '#ccc', fontSize: 12 },
    precioText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});