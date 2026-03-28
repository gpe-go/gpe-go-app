import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Image, Pressable, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useLugares } from "../../src/hooks/useLugares";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritos } from '../../src/context/FavoritosContext';

export default function Categoria() {
    const { tipo, nombre } = useLocalSearchParams<{ tipo: string; nombre: string }>();
    const router = useRouter();
    const { toggleFavorito, esFavorito } = useFavoritos();

    const idCategoria = Number(tipo) || undefined;
    const { data: lugares, loading } = useLugares(idCategoria);

    const titulo = nombre || tipo;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{titulo}</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={lugares}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.scrollContent, lugares.length === 0 && { flexGrow: 1 }]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="location-outline" size={56} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>
                            Todavía no hay lugares disponibles
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            Pronto agregaremos lugares en esta categoría
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push(`/lugar/${item.id}`)}
                    >
                        <Image source={{ uri: item.imagen }} style={styles.image} />
                        <View style={styles.overlay} />

                        <View style={styles.topInfo}>
                            <View style={styles.ratingBox}>
                                <Text style={styles.stars}>
                                    {'⭐'.repeat(Math.min(Math.round(item.rating || 4), 5))}
                                </Text>
                            </View>
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
                )}
            />
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
    title: { fontSize: 20, fontWeight: "600" },
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
    precioText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    emptyTitle: {
        color: '#94a3b8',
        fontSize: 17,
        fontWeight: '600',
        marginTop: 14,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: '#cbd5e1',
        fontSize: 14,
        marginTop: 6,
        textAlign: 'center',
    },
});
