import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useAuth } from '../../src/context/AuthContext';
import { useFavoritos } from '../../src/context/FavoritosContext';
import { useTheme } from '../../src/context/ThemeContext';

const da = StyleSheet.create({
  wrapper: {
    width: 90,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inner: { alignItems: 'center', gap: 4 },
  label: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

function SwipeableCard({
  item,
  colors,
  fonts,
  onDelete,
  onPress,
}: {
  item: any;
  colors: any;
  fonts: any;
  onDelete: () => void;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const swipeRef = useRef<Swipeable>(null);
  const isSwiping = useRef(false);
  const s = makeStyles(colors, fonts);

  const confirmarEliminar = () => {
    Alert.alert(
      t('fav_delete_title'),
      t('fav_delete_msg', { nombre: item.nombre }),
      [
        {
          text: t('profile_cancel'),
          style: 'cancel',
          onPress: () => swipeRef.current?.close(),
        },
        {
          text: t('favorites_delete'),
          style: 'destructive',
          onPress: () => {
            swipeRef.current?.close();
            onDelete();
          },
        },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-90, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View style={[da.wrapper, { opacity, transform: [{ scale }] }]}>
        <Pressable onPress={confirmarEliminar} style={{ flex: 1 }}>
          <LinearGradient colors={['#ff4d4d', '#c0392b']} style={da.gradient}>
            <View style={da.inner}>
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={da.label}>{t('favorites_delete')}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      overshootRight={false}
      friction={2}
      onSwipeableWillOpen={() => {
        isSwiping.current = true;
      }}
      onSwipeableClose={() => {
        setTimeout(() => {
          isSwiping.current = false;
        }, 100);
      }}
    >
      <Pressable
        style={({ pressed }) => [
          s.card,
          {
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          },
        ]}
        onPress={() => {
          if (isSwiping.current) return;
          onPress();
        }}
      >
        <Image source={{ uri: item.imagen }} style={s.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          style={s.gradient}
        >
          <View style={s.cardContent}>
            <View style={s.topRow}>
              <View style={s.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= (item.rating ?? 5) ? 'star' : 'star-outline'}
                    size={13}
                    color="#FFD700"
                  />
                ))}
              </View>

              <View style={s.categoryBadge}>
                <Text style={s.categoryText}>{item.categoria}</Text>
              </View>
            </View>

            <View style={s.bottomRow}>
              <View style={s.textInfo}>
                <Text style={s.nombreText} numberOfLines={1}>
                  {item.nombre}
                </Text>

                <View style={s.locationRow}>
                  <Ionicons
                    name="location"
                    size={13}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={s.locationText} numberOfLines={1}>
                    {item.ubicacion}
                  </Text>
                </View>
              </View>

              <View style={s.priceBadge}>
                <Text style={s.priceText}>{item.costo || '---'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={s.swipeHint}>
          <Ionicons
            name="chevron-back-outline"
            size={14}
            color="rgba(255,255,255,0.6)"
          />
        </View>
      </Pressable>
    </Swipeable>
  );
}

function LoginModal({
  visible,
  onClose,
  onGoLogin,
  colors,
  fonts,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  onGoLogin: () => void;
  colors: any;
  fonts: any;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const modalAnim = useRef(new Animated.Value(0)).current;
  const s = makeStyles(colors, fonts);

  useEffect(() => {
    if (visible) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [visible, modalAnim]);

  const animatedStyle = {
    opacity: modalAnim,
    transform: [
      {
        translateY: modalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
      {
        scale: modalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalBackdrop}>
        <Animated.View style={[s.modalSheet, animatedStyle]}>
          <LinearGradient colors={['#E96928', '#C4511A']} style={s.modalIconWrap}>
            <Ionicons name="heart" size={28} color="#fff" />
          </LinearGradient>

          <Text style={[s.modalTitle, { fontSize: fonts.xl }]}>
            {t('favorites_login_title')}
          </Text>

          <Text style={[s.modalBody, { fontSize: fonts.sm }]}>
            {t('favorites_login_sub')}
          </Text>

          <Pressable
            style={({ pressed }) => [
              s.modalPrimaryBtn,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
            onPress={onGoLogin}
          >
            <LinearGradient
              colors={['#E96928', '#C4511A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.modalPrimaryGradient}
            >
              <Ionicons name="person-outline" size={18} color="#fff" />
              <Text style={[s.modalPrimaryBtnText, { fontSize: fonts.base }]}>
                {t('login_title')}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.72 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            })}
            onPress={onClose}
          >
            <Text style={[s.modalCancelBtnText, { fontSize: fonts.sm }]}>
              {t('cancel')}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

function EmptyStateCard({
  icon,
  title,
  subtitle,
  primaryText,
  primaryIcon,
  onPrimaryPress,
  secondaryText,
  onSecondaryPress,
  colors,
  fonts,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  primaryText: string;
  primaryIcon: keyof typeof Ionicons.glyphMap;
  onPrimaryPress: () => void;
  secondaryText?: string;
  onSecondaryPress?: () => void;
  colors: any;
  fonts: any;
  isDark: boolean;
}) {
  const s = makeStyles(colors, fonts);
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

  return (
    <Animated.View
      style={[
        s.emptyCard,
        {
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [26, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={s.emptyDecorCircle} />
      <View style={s.emptyDecorCircleSmall} />

      <LinearGradient colors={['#E96928', '#C4511A']} style={s.emptyCardIconWrap}>
        <Ionicons name={icon} size={34} color="#fff" />
      </LinearGradient>

      <Text style={[s.emptyCardTitle, { fontSize: fonts['2xl'] ?? fonts.xl }]}>
        {title}
      </Text>

      <Text style={[s.emptyCardSubtitle, { fontSize: fonts.base }]}>
        {subtitle}
      </Text>

      <Pressable
        style={({ pressed }) => [
          s.emptyPrimaryBtn,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          },
        ]}
        onPress={onPrimaryPress}
      >
        <LinearGradient
          colors={['#E96928', '#C4511A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.emptyPrimaryBtnGradient}
        >
          <Ionicons name={primaryIcon} size={19} color="#fff" />
          <Text style={[s.emptyPrimaryBtnText, { fontSize: fonts.base }]}>
            {primaryText}
          </Text>
        </LinearGradient>
      </Pressable>

      {!!secondaryText && !!onSecondaryPress && (
        <Pressable
          style={({ pressed }) => ({
            marginTop: 12,
            opacity: pressed ? 0.72 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          })}
          onPress={onSecondaryPress}
        >
          <Text style={[s.emptySecondaryText, { fontSize: fonts.sm }]}>
            {secondaryText}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

export default function FavoritosScreen() {
  const { t } = useTranslation();
  const { colors, fonts, isDark } = useTheme();
  const s = makeStyles(colors, fonts);
  const { favoritos, toggleFavorito } = useFavoritos();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loginModal, setLoginModal] = React.useState(false);

  const irAlInicio = () => router.replace('/');

  const handlePress = useCallback(
    (item: any) => {
      if (item.origen === 'detalle') {
        router.push({
          pathname: '/(stack)/detalleLugar',
          params: { lugar: JSON.stringify(item), from: 'favoritos' },
        });
      } else {
        router.push(`/lugar/${item.id}`);
      }
    },
    [router]
  );

  const Header = () => (
    <AnimatedHeader
      colors={colors}
      fonts={fonts}
      title={t('tab_favorites')}
      subtitle={
        favoritos.length === 0
          ? t('fav_banner_subtitle')
          : `${favoritos.length} ${
              favoritos.length === 1 ? t('place_saved_one') : t('place_saved_many')
            }`
      }
      showTip={favoritos.length > 0}
      tipText={t('swipe_to_delete')}
    />
  );

  if (!isAuthenticated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LoginModal
          visible={loginModal}
          onClose={() => setLoginModal(false)}
          onGoLogin={() => {
            setLoginModal(false);
            router.push('/(stack)/perfil');
          }}
          colors={colors}
          fonts={fonts}
          isDark={isDark}
        />

        <View style={s.container}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

          <FlatList
            data={[{ id: 'empty-auth' }]}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            ListHeaderComponent={Header}
            renderItem={() => (
              <View style={s.emptySection}>
                <View style={s.sectionLabelRow}>
                  <View style={s.sectionAccent} />
                  <Text style={[s.sectionLabel, { fontSize: fonts.base }]}>
                    {t('fav_access_required')}
                  </Text>
                </View>

                <EmptyStateCard
                  icon="heart-outline"
                  title={t('favorites_login_title')}
                  subtitle={t('favorites_login_sub')}
                  primaryText={t('login_title')}
                  primaryIcon="person-outline"
                  onPrimaryPress={() => setLoginModal(true)}
                  secondaryText={t('fav_explore_no_account')}
                  onSecondaryPress={irAlInicio}
                  colors={colors}
                  fonts={fonts}
                  isDark={isDark}
                />
              </View>
            )}
          />
        </View>
      </GestureHandlerRootView>
    );
  }

  if (favoritos.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={s.container}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

          <FlatList
            data={[{ id: 'empty-favorites' }]}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            ListHeaderComponent={Header}
            renderItem={() => (
              <View style={s.emptySection}>
                <View style={s.sectionLabelRow}>
                  <View style={s.sectionAccent} />
                  <Text style={[s.sectionLabel, { fontSize: fonts.base }]}>
                    {t('fav_start_saving')}
                  </Text>
                </View>

                <EmptyStateCard
                  icon="heart-dislike-outline"
                  title={t('favorites_empty')}
                  subtitle={t('fav_empty_sub')}
                  primaryText={t('favorites_explore')}
                  primaryIcon="compass-outline"
                  onPrimaryPress={irAlInicio}
                  colors={colors}
                  fonts={fonts}
                  isDark={isDark}
                />
              </View>
            )}
          />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={s.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={Header}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SwipeableCard
              item={item}
              colors={colors}
              fonts={fonts}
              onDelete={() => toggleFavorito(item)}
              onPress={() => handlePress(item)}
            />
          )}
        />
      </View>
    </GestureHandlerRootView>
  );
}

function AnimatedHeader({
  colors,
  fonts,
  title,
  subtitle,
  showTip = false,
  tipText = '',
}: {
  colors: any;
  fonts: any;
  title: string;
  subtitle: string;
  showTip?: boolean;
  tipText?: string;
}) {
  const s = makeStyles(colors, fonts);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bannerAnim, contentAnim]);

  return (
    <View>
      <Animated.View
        style={{
          opacity: bannerAnim,
          transform: [
            {
              translateY: bannerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={['#E96928', '#C4511A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <View style={s.circle1} />
          <View style={s.circle2} />

          <View style={s.bannerContent}>
            <View style={s.bannerIconWrap}>
              <Ionicons name="heart" size={24} color="#E96928" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { fontSize: fonts['2xl'] }]}>
                {title}
              </Text>
              <Text style={[s.bannerSubtitle, { fontSize: fonts.sm }]}>
                {subtitle}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {showTip && (
        <Animated.View
          style={[
            s.tipWrap,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={s.tipRow}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={colors.subtext}
            />
            <Text style={[s.tipText, { fontSize: fonts.xs }]}>{tipText}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const makeStyles = (c: any, f: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    banner: {
      paddingHorizontal: 22,
      paddingTop: Platform.OS === 'ios' ? 24 : 28,
      paddingBottom: 30,
      overflow: 'hidden',
      borderBottomLeftRadius: 34,
      borderBottomRightRadius: 34,
      marginBottom: 6,
    },
    circle1: {
      position: 'absolute',
      width: 190,
      height: 190,
      borderRadius: 95,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -56,
      right: -54,
    },
    circle2: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.05)',
      bottom: -30,
      left: -32,
    },
    bannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    bannerIconWrap: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 8,
    },
    bannerTitle: {
      color: '#fff',
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    bannerSubtitle: {
      color: 'rgba(255,255,255,0.84)',
      marginTop: 3,
      fontWeight: '500',
    },

    tipWrap: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 10,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tipText: {
      color: c.subtext,
      fontWeight: '600',
    },

    sectionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 18,
      paddingHorizontal: 20,
    },
    sectionAccent: {
      width: 6,
      height: 32,
      borderRadius: 999,
      backgroundColor: '#E96928',
    },
    sectionLabel: {
      color: c.subtext,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },

    emptySection: {
      paddingTop: 16,
      paddingBottom: 10,
    },
    emptyCard: {
      marginHorizontal: 20,
      backgroundColor: c.card,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 24,
      paddingVertical: 34,
      alignItems: 'center',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 6,
      minHeight: 420,
      justifyContent: 'center',
    },
    emptyDecorCircle: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: 'rgba(233,105,40,0.06)',
      top: -70,
      right: -40,
    },
    emptyDecorCircleSmall: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(233,105,40,0.04)',
      bottom: 36,
      left: -26,
    },
    emptyCardIconWrap: {
      width: 102,
      height: 102,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#E96928',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.34,
      shadowRadius: 18,
      elevation: 10,
    },
    emptyCardTitle: {
      color: c.text,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -0.6,
    },
    emptyCardSubtitle: {
      color: c.subtext,
      textAlign: 'center',
      lineHeight: (f.base || 16) * 1.7,
      maxWidth: 320,
      marginBottom: 26,
    },
    emptyPrimaryBtn: {
      width: '100%',
      maxWidth: 380,
      borderRadius: 22,
      overflow: 'hidden',
      shadowColor: '#E96928',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.34,
      shadowRadius: 16,
      elevation: 8,
    },
    emptyPrimaryBtnGradient: {
      height: 58,
      borderRadius: 22,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    emptyPrimaryBtnText: {
      color: '#fff',
      fontWeight: '800',
    },
    emptySecondaryText: {
      color: c.subtext,
      fontWeight: '600',
      textAlign: 'center',
    },

    card: {
      height: 210,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 22,
      overflow: 'hidden',
      backgroundColor: '#000',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    image: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '75%',
      justifyContent: 'flex-end',
      padding: 16,
    },
    cardContent: {
      width: '100%',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 2,
    },
    categoryBadge: {
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    categoryText: {
      color: '#fff',
      fontSize: f.xs,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    textInfo: {
      flex: 1,
      marginRight: 10,
    },
    nombreText: {
      color: '#fff',
      fontSize: f.lg,
      fontWeight: '900',
      textShadowColor: 'rgba(0,0,0,0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 6,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 3,
    },
    locationText: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: f.xs,
    },
    priceBadge: {
      backgroundColor: '#E96928',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    priceText: {
      color: '#fff',
      fontSize: f.sm,
      fontWeight: '800',
    },
    swipeHint: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: [{ translateY: -10 }],
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.58)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: c.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 28,
      paddingTop: 28,
      paddingBottom: Platform.OS === 'ios' ? 34 : 28,
      alignItems: 'center',
      gap: 14,
      borderTopWidth: 1,
      borderColor: c.border,
    },
    modalIconWrap: {
      width: 70,
      height: 70,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#E96928',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 14,
      elevation: 8,
    },
    modalTitle: {
      color: c.text,
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 2,
    },
    modalBody: {
      color: c.subtext,
      textAlign: 'center',
      lineHeight: (f.sm || 14) * 1.6,
      maxWidth: 320,
      marginBottom: 4,
    },
    modalPrimaryBtn: {
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
      marginTop: 8,
      shadowColor: '#E96928',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 6,
    },
    modalPrimaryGradient: {
      height: 54,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    modalPrimaryBtnText: {
      color: '#fff',
      fontWeight: '800',
    },
    modalCancelBtnText: {
      color: c.subtext,
      fontWeight: '600',
      marginTop: 4,
    },
  });