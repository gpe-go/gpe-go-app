import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  ImageBackground,
  Keyboard,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "../../src/context/ThemeContext";
import { useAnimatedPlaceholder } from "../../src/hooks/useAnimatedPlaceholder";
import { useLugares } from "../../src/hooks/useLugares";
import i18n, { AppLanguage, cambiarIdioma, LANGUAGE_LIST } from "../../src/i18n/i18n";
import LanguageSheet from "../../components/LanguageSheet";

// ── Hook: fecha y hora en vivo (reactivo al idioma) ──────
function useDateTime() {
  const [now, setNow] = useState(new Date());
  const [locale, setLocale] = useState(i18n.language ?? "es");

  useEffect(() => {
    const msHastaProxMinuto = (60 - new Date().getSeconds()) * 1000;
    let interval: ReturnType<typeof setInterval> | undefined;

    const t0 = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60_000);
    }, msHastaProxMinuto);

    return () => {
      clearTimeout(t0);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onLangChange = (lng: string) => setLocale(lng);
    i18n.on("languageChanged", onLangChange);
    return () => i18n.off("languageChanged", onLangChange);
  }, []);

  const fecha = now.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const hora = now.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fechaFormatted = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  return { fecha: fechaFormatted, hora };
}

function RefreshLogo({ refreshing }: { refreshing: boolean }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!refreshing) return;

    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    spin.start();
    pulse.start();

    return () => {
      spin.stop();
      pulse.stop();
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
    };
  }, [refreshing, spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!refreshing) return null;

  return (
    <View style={rl.container}>
      <Animated.View
        style={[rl.iconWrap, { transform: [{ rotate: spin }, { scale: pulseAnim }] }]}
      >
        <View style={rl.iconBg}>
          <Ionicons name="location" size={18} color="#bbb" />
        </View>
      </Animated.View>
      <Text style={rl.label}>GuadalupeGO</Text>
    </View>
  );
}

const rl = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 0.3,
  },
});

type LugarLite = {
  id?: string | number;
  nombre?: string;
  ubicacion?: string;
  imagen?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts, isDark);
  const { fecha, hora } = useDateTime();

  const mapRef = useRef<MapView>(null);
  const containerRef = useRef<View>(null);
  const searchWrapRef = useRef<View>(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);

  // ── Language chip state ─────────────────────────────────────────────────────
  const [langModal, setLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState<AppLanguage>(
    (i18n.language ?? "es") as AppLanguage
  );
  useEffect(() => {
    const onLangChange = (lng: string) => setCurrentLang(lng as AppLanguage);
    i18n.on("languageChanged", onLangChange);
    return () => i18n.off("languageChanged", onLangChange);
  }, []);
  const currentFlag = LANGUAGE_LIST.find((l) => l.code === currentLang)?.flag ?? "🌐";
  const handleSelectLang = async (code: AppLanguage) => {
    await cambiarIdioma(code);
    setCurrentLang(code);
    setLangModal(false);
  };

  // ── Wave animation for 👋 ────────────────────────────────────────────────────
  // The emoji pivots from its BOTTOM (the wrist) so fingers always wave upward.
  // We simulate a custom transform-origin with translate → rotate → translate-back.
  const waveAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const wave = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue:  1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue:  1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue:  0, duration: 150, useNativeDriver: true }),
        Animated.delay(2400),
      ])
    );
    wave.start();
    return () => wave.stop();
  }, [waveAnim]);
  // Keep rotation in the positive (right) range so fingers tilt right, never down
  const waveRotate = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-5deg", "15deg", "30deg"],
  });

  // Animated rotating placeholder hints
  const searchHints = useMemo(
    () => [
      `${t("search")} ${t("cat_hoteles")}...`,
      `${t("search")} ${t("cat_restaurantes")}...`,
      `${t("search")} ${t("cat_magic")}...`,
      `${t("search")} ${t("cat_cerros")}...`,
    ],
    [t]
  );
  const { index: hintIdx, opacity: hintOpacity } = useAnimatedPlaceholder(searchHints.length);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const row1Anim = useRef(new Animated.Value(0)).current;
  const row2Anim = useRef(new Animated.Value(0)).current;
  const row3Anim = useRef(new Animated.Value(0)).current;
  const row4Anim = useRef(new Animated.Value(0)).current;
  const mapAnim = useRef(new Animated.Value(0)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const lugaresHook = useLugares() as { data?: LugarLite[] };
  const lugares = Array.isArray(lugaresHook?.data) ? lugaresHook.data : [];

  useEffect(() => {
    let sub: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialRegion = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(initialRegion);

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (loc) =>
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })
      );
    })();

    Animated.stagger(110, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(row1Anim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(row2Anim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(row3Anim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(row4Anim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(mapAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      if (sub) sub.remove();
    };
  }, [headerAnim, row1Anim, row2Anim, row3Anim, row4Anim, mapAnim]);

  useEffect(() => {
    Animated.timing(searchFocusAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused, searchFocusAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const centerMap = () => {
    if (!region || !mapRef.current) return;
    mapRef.current.animateToRegion(region, 600);
  };

  const searchResults =
    search.length > 0
      ? lugares.filter((item) =>
          String(item?.nombre ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : [];

  const headerAnimatedStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const makeRowAnimatedStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [26, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.985, 1],
        }),
      },
    ],
  });

  const row1AnimatedStyle = makeRowAnimatedStyle(row1Anim);
  const row2AnimatedStyle = makeRowAnimatedStyle(row2Anim);
  const row3AnimatedStyle = makeRowAnimatedStyle(row3Anim);
  const row4AnimatedStyle = makeRowAnimatedStyle(row4Anim);

  const mapAnimatedStyle = {
    opacity: mapAnim,
    transform: [
      {
        translateY: mapAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const animatedSearchBoxStyle = useMemo(
    () => ({
      transform: [
        {
          scale: searchFocusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.02],
          }),
        },
      ],
      borderColor: searchFocusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
          isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
          "#E96928",
        ],
      }),
      shadowOpacity: searchFocusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [isDark ? 0.18 : 0.08, isDark ? 0.3 : 0.16],
      }),
      shadowRadius: searchFocusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 20],
      }),
      elevation: searchFocusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 8],
      }),
    }),
    [searchFocusAnim, isDark]
  );

  const headerScrollStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 140],
          outputRange: [0, -10],
          extrapolate: "clamp",
        }),
      },
      {
        scale: scrollY.interpolate({
          inputRange: [0, 140],
          outputRange: [1, 0.97],
          extrapolate: "clamp",
        }),
      },
    ],
    opacity: scrollY.interpolate({
      inputRange: [0, 160],
      outputRange: [1, 0.94],
      extrapolate: "clamp",
    }),
  };

  const glowScrollStyle = {
    opacity: scrollY.interpolate({
      inputRange: [0, 140],
      outputRange: [0.9, 0.45],
      extrapolate: "clamp",
    }),
    transform: [
      {
        scale: scrollY.interpolate({
          inputRange: [0, 140],
          outputRange: [1, 0.92],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  return (
    <View ref={containerRef} style={s.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <Animated.ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={["transparent"]}
            progressBackgroundColor="transparent"
          />
        }
      >
        <RefreshLogo refreshing={refreshing} />

        <Animated.View style={[s.headerShell, headerAnimatedStyle]}>
          <Animated.View style={headerScrollStyle}>
            <LinearGradient
              colors={isDark ? ["#0a0a0a", "#121212"] : ["#fafafa", "#f3f3f3"]}
              style={s.header}
            >
              <Animated.View style={[s.headerGlow, glowScrollStyle]} />

              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={[s.searchTitle, { fontSize: fonts["2xl"] }]}>
                  {t("welcome1")}{" "}
                </Text>
                <Animated.Text
                  style={{
                    fontSize: fonts["2xl"],
                    // Simulate pivot at wrist (bottom of emoji):
                    // 1. shift down so the wrist aligns with the rotation center
                    // 2. rotate
                    // 3. shift back up
                    transform: [
                      { translateY: 10 },
                      { rotate: waveRotate },
                      { translateY: -10 },
                    ],
                  }}
                >
                  👋
                </Animated.Text>
              </View>

              <View style={s.dateTimeRow}>
                <View style={s.dateChip}>
                  <Ionicons name="calendar-outline" size={13} color="#E96928" />
                  <Text style={[s.dateChipText, { fontSize: fonts.xs }]}>{fecha}</Text>
                </View>

                <View style={s.timeChip}>
                  <Ionicons name="time-outline" size={13} color="#E96928" />
                  <Text style={[s.timeChipText, { fontSize: fonts.xs }]}>{hora}</Text>
                </View>
              </View>

              <View
                ref={searchWrapRef}
                style={s.searchWrapper}
                onLayout={() => {
                  setTimeout(() => {
                    searchWrapRef.current?.measureLayout(
                      containerRef.current as any,
                      (_x, y, _w, h) => { setDropdownTop(y + h + 8); },
                      () => {},
                    );
                  }, 100);
                }}
              >
                <Animated.View style={[s.searchBox, animatedSearchBoxStyle]}>
                  <Ionicons name="search" size={22} color={colors.subtext} />
                  <TextInput
                    placeholder=""
                    placeholderTextColor="transparent"
                    style={[s.searchInput, { fontSize: fonts.base }]}
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  {search.length > 0 && (
                    <Pressable onPress={() => setSearch("")}>
                      <Ionicons name="close-circle" size={20} color={colors.subtext} />
                    </Pressable>
                  )}
                  {/* Animated rotating placeholder — absolute inside searchBox */}
                  {search.length === 0 && (
                    <Animated.View
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        left: 50,
                        right: 18,
                        top: 0,
                        bottom: 0,
                        justifyContent: "center",
                        opacity: hintOpacity,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.subtext,
                          fontSize: fonts.base,
                        }}
                        numberOfLines={1}
                      >
                        {searchHints[hintIdx]}
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        <Animated.View style={row1AnimatedStyle}>
          <View style={[s.gridRow, { height: 226, marginTop: 10 }]}>
            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "48%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/explorar")}
            >
              <ImageBackground
                source={{
                  uri: "https://i.pinimg.com/originals/33/b5/22/33b522650f28ec33a20eea361c08beb9.jpg",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <View style={s.cardIconWrap}>
                    <Ionicons name="map-outline" size={18} color="#fff" />
                  </View>
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_explore")}
                  </Text>
                  <Text style={[s.cardSub, { fontSize: fonts.xs }]}>Guadalupe & NL</Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "48%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/Fin de semana")}
            >
              <ImageBackground
                source={{
                  uri: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_weekend")}
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={row2AnimatedStyle}>
          <View style={[s.gridRow, { height: 164 }]}>
            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "58%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/Naturaleza & Aventura")}
            >
              <ImageBackground
                source={{
                  uri: "https://mvsnoticias.com/u/fotografias/m/2023/9/27/f768x400-565219_609122_7.jpg",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_nature")}
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "38%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/pueblos Magicos")}
            >
              <ImageBackground
                source={{
                  uri: "https://wallpapers.com/images/hd/monterrey-photo-collage-7ilxq3egqhow9gdw.jpg",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_magic")}
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={row3AnimatedStyle}>
          <View style={[s.gridRow, { height: 154 }]}>
            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "48%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/tours")}
            >
              <ImageBackground
                source={{
                  uri: "https://tse1.mm.bing.net/th/id/OIP.SJuomIXnlZ7o0_RQ7XO18AHaDf",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_tours")}
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "48%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/cultura")}
            >
              <ImageBackground
                source={{
                  uri: "https://i1.wp.com/www.turimexico.com/wp-content/uploads/2015/06/marco.jpg",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_culture")}
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={row4AnimatedStyle}>
          <View style={[s.gridRow, { height: 184 }]}>
            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "43%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/compras")}
            >
              <ImageBackground
                source={{
                  uri: "https://statics-cuidateplus.marca.com/cms/2022-11/compras-compulsivas_0.jpg",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_shopping")}
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                s.card,
                { width: "53%" },
                { transform: [{ scale: pressed ? 0.96 : 0.98 }] },
              ]}
              onPress={() => router.push("/categorias/servicios")}
            >
              <ImageBackground
                source={{
                  uri: "https://i0.wp.com/www.cuponerapp.com/mexiconoce/wp-content/uploads/2021/05/Captura-de-pantalla-2021-05-31-222254.jpg?resize=600%2C332&ssl=1",
                }}
                style={s.cardBg}
                imageStyle={s.rounded}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.85)"]}
                  style={s.gradient}
                >
                  <Text style={[s.cardTitle, { fontSize: fonts.lg }]}>
                    {t("cat_services")}
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={mapAnimatedStyle}>
          <View style={s.mapHeaderBlock}>
            <View style={s.mapHeader}>
              <View style={s.sectionDot} />
              <View>
                <Text style={[s.mapTitle, { fontSize: fonts.xl }]}>{t("cat_map")}</Text>
                <Text style={[s.mapSubtitle, { fontSize: fonts.xs }]}>
                  {t("cat_map_sub")}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.mapFrame}>
            <View style={s.mapContainer}>
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={
                  region ?? {
                    latitude: 25.676,
                    longitude: -100.256,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }
                }
              >
                {region && (
                  <Marker coordinate={region}>
                    <View style={s.userMarker} />
                  </Marker>
                )}
              </MapView>

              <Pressable
                style={({ pressed }) => [
                  s.expandMapBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/(stack)/mapaCompleto',
                    params: region
                      ? { latitude: String(region.latitude), longitude: String(region.longitude), from: 'home' }
                      : { from: 'home' },
                  })
                }
              >
                <Ionicons name="expand-outline" size={20} color={isDark ? '#e5e5e5' : '#222'} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              s.locationBtn,
              {
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            onPress={centerMap}
          >
            <LinearGradient colors={["#E96928", "#c4511a"]} style={s.locationBtnGradient}>
              <Ionicons name="locate-outline" size={20} color="#fff" />
              <Text style={[s.btnText, { fontSize: fonts.sm }]}>
                {t("cat_my_location")}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.ScrollView>

      {searchResults.length > 0 && dropdownTop > 0 && (
        <>
          <Pressable
            style={s.searchOverlayBg}
            onPress={() => { setSearch(""); Keyboard.dismiss(); }}
          />
          <View style={[s.searchResults, { top: dropdownTop }]}>
            <Text style={[s.searchResultsTitle, { fontSize: fonts.sm }]}>
              {t("search")}
            </Text>
            {searchResults.slice(0, 6).map((item, index) => (
              <Pressable
                key={item.id ?? index}
                style={s.searchItem}
                onPress={() => {
                  setSearch("");
                  Keyboard.dismiss();
                  router.push(`/lugar/${item.id}` as any);
                }}
              >
                <View style={s.searchItemIcon}>
                  <Ionicons name="location-outline" size={16} color="#E96928" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[s.searchItemTitle, { fontSize: fonts.sm }]}
                    numberOfLines={1}
                  >
                    {item.nombre}
                  </Text>
                  {item.ubicacion ? (
                    <Text style={[s.searchSub, { fontSize: fonts.xs }]} numberOfLines={1}>
                      {item.ubicacion}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Floating language chip — top-right corner ──────────────────────── */}
      <Pressable
        onPress={() => setLangModal(true)}
        style={({ pressed }) => [
          s.langChip,
          { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <Ionicons name="globe-outline" size={14} color={isDark ? colors.text : "#444"} />
        <View style={s.langDivider} />
        <Text style={s.langCode}>{currentLang.toUpperCase()}</Text>
      </Pressable>

      {/* ── Language picker bottom sheet ───────────────────────────────────── */}
      <LanguageSheet
        visible={langModal}
        onClose={() => setLangModal(false)}
        currentLang={currentLang}
        onSelect={handleSelectLang}
        colors={colors}
        fonts={fonts}
        isDark={isDark}
      />

    </View>
  );
}

const makeStyles = (c: any, f: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? c.background : "#fafafa",
      overflow: "hidden",
    },

    scrollContent: {
      paddingBottom: 150,
      paddingTop: 6,
    },

    headerShell: {
      marginBottom: 4,
      position: "relative",
      zIndex: 999,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 28,
      marginTop: 8,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },

    headerGlow: {
      position: "absolute",
      top: -30,
      left: 40,
      right: 40,
      height: 140,
      borderRadius: 80,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.025)"
        : "rgba(233,105,40,0.06)",
      opacity: 0.9,
    },

    searchTitle: {
      fontWeight: "900",
      marginBottom: 16,
      textAlign: "center",
      color: c.text,
      letterSpacing: -0.4,
      lineHeight: 42,
    },

    dateTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 18,
    },

    dateChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: isDark ? "rgba(233,105,40,0.12)" : "rgba(233,105,40,0.08)",
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(233,105,40,0.30)" : "rgba(233,105,40,0.18)",
    },

    dateChipText: {
      color: isDark ? "#E96928" : "#c4511a",
      fontWeight: "600",
    },

    timeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: isDark ? "rgba(233,105,40,0.12)" : "rgba(233,105,40,0.08)",
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(233,105,40,0.30)" : "rgba(233,105,40,0.18)",
    },

    timeChipText: {
      color: isDark ? "#E96928" : "#c4511a",
      fontWeight: "700",
    },

    searchWrapper: {
      position: "relative",
      zIndex: 999,
      marginTop: 4,
    },

    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f7f7f8",
      borderRadius: 24,
      paddingHorizontal: 18,
      height: 64,
      borderWidth: 1.2,
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 14,
      elevation: 4,
    },

    searchInput: {
      flex: 1,
      marginLeft: 10,
      color: c.text,
    },

    searchOverlayBg: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 998,
    },

    searchResults: {
      position: "absolute",
      left: 20,
      right: 20,
      backgroundColor: c.card,
      borderRadius: 20,
      padding: 14,
      elevation: 20,
      zIndex: 999,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 18,
    },

    searchResultsTitle: {
      fontWeight: "700",
      color: c.subtext,
      marginBottom: 8,
    },

    searchItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
    },

    searchItemIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(233,105,40,0.12)" : "rgba(233,105,40,0.08)",
      justifyContent: "center",
      alignItems: "center",
    },

    searchItemTitle: {
      fontWeight: "700",
      color: c.text,
    },

    searchSub: {
      color: c.subtext,
      marginTop: 2,
    },

    gridRow: {
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
      marginBottom: 14,
      gap: 12,
      paddingHorizontal: 16,
    },

    card: {
      flex: 1,
      borderRadius: 26,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.28 : 0.14,
      shadowRadius: 18,
      elevation: 6,
      backfaceVisibility: "hidden",
    },

    cardBg: {
      flex: 1,
      width: "100%",
      height: "100%",
      justifyContent: "flex-end",
      overflow: "hidden",
    },

    rounded: {
      borderRadius: 26,
    },

    gradient: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 70,
      justifyContent: "flex-end",
      borderRadius: 26,
    },

    cardIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.18)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    },

    cardTitle: {
      color: "#fff",
      fontWeight: "900",
      letterSpacing: -0.3,
      textShadowColor: "rgba(0,0,0,0.55)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },

    cardSub: {
      color: "rgba(255,255,255,0.9)",
      marginTop: 4,
      fontWeight: "500",
      textShadowColor: "rgba(0,0,0,0.45)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 5,
    },

    mapHeaderBlock: {
      paddingHorizontal: 4,
      marginTop: 8,
    },

    mapHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 16,
      marginTop: 22,
      marginBottom: 14,
    },

    sectionDot: {
      width: 5,
      height: 22,
      borderRadius: 3,
      backgroundColor: "#E96928",
    },

    mapTitle: {
      fontWeight: "900",
      color: c.text,
      letterSpacing: -0.3,
    },

    mapSubtitle: {
      color: c.subtext,
      marginTop: 3,
    },

    mapFrame: {
      marginHorizontal: 16,
      borderRadius: 28,
      overflow: "hidden",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
    },

    mapContainer: {
      height: 285,
      borderRadius: 28,
      overflow: "hidden",
    },

    expandMapBtn: {
      position: "absolute",
      top: 14,
      left: 14,
      backgroundColor: c.card,
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      borderWidth: 1,
      borderColor: c.border,
    },

    userMarker: {
      width: 16,
      height: 16,
      backgroundColor: "#E96928",
      borderRadius: 8,
      borderWidth: 3,
      borderColor: "#fff",
    },

    locationBtn: {
      marginTop: 18,
      alignSelf: "center",
      borderRadius: 32,
      overflow: "hidden",
      elevation: 5,
      shadowColor: "#E96928",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
    },

    locationBtnGradient: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 26,
      paddingVertical: 14,
      gap: 9,
    },

    btnText: {
      color: "#fff",
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    // ── Floating language chip ───────────────────────────────────────────────
    langChip: {
      position: "absolute",
      top: 4,
      right: 8,
      zIndex: 1000,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark ? "rgba(30,30,30,0.92)" : "rgba(255,255,255,0.96)",
      borderRadius: 22,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
    langDivider: {
      width: 1,
      height: 13,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
    },
    langCode: {
      fontSize: 12,
      fontWeight: "800",
      color: isDark ? "#e5e5e5" : "#222",
      letterSpacing: 0.6,
    },
  });