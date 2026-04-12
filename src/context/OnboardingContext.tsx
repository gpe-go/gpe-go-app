import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ── Storage keys ────────────────────────────────────────────────────────────
const KEY_SLIDES = '@ggo_slides';
const KEY_TIP_HOME = '@ggo_tip_home';
const KEY_TIP_DIRECTORIO = '@ggo_tip_directorio';
const KEY_TIP_EXPLORAR = '@ggo_tip_explorar';
const KEY_TIP_EVENTOS = '@ggo_tip_eventos';

// ── Types ────────────────────────────────────────────────────────────────────
export type TooltipKey = 'home' | 'directorio' | 'explorar' | 'eventos';

interface OnboardingState {
  /** True once AsyncStorage has been read (safe to show/hide UI) */
  slidesReady: boolean;
  /** Whether the welcome slides overlay should be visible */
  showSlides: boolean;
  /** Which per-tab tooltips have already been dismissed */
  tooltipSeen: Record<TooltipKey, boolean>;
}

interface OnboardingContextValue extends OnboardingState {
  /** Call when the user finishes or skips all slides */
  completeSlides: () => Promise<void>;
  /** Call when the user dismisses a specific tab tooltip */
  markTooltipSeen: (key: TooltipKey) => Promise<void>;
  /** Resets everything so slides + all tooltips will show again */
  resetOnboarding: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [slidesReady, setSlidesReady] = useState(false);
  const [showSlides, setShowSlides] = useState(false);
  const [tooltipSeen, setTooltipSeen] = useState<Record<TooltipKey, boolean>>({
    home: false,
    directorio: false,
    explorar: false,
    eventos: false,
  });

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const [slides, tipHome, tipDir, tipExp, tipEv] = await Promise.all([
          AsyncStorage.getItem(KEY_SLIDES),
          AsyncStorage.getItem(KEY_TIP_HOME),
          AsyncStorage.getItem(KEY_TIP_DIRECTORIO),
          AsyncStorage.getItem(KEY_TIP_EXPLORAR),
          AsyncStorage.getItem(KEY_TIP_EVENTOS),
        ]);

        // slides === null means first launch
        setShowSlides(slides === null);
        setTooltipSeen({
          home: tipHome === 'true',
          directorio: tipDir === 'true',
          explorar: tipExp === 'true',
          eventos: tipEv === 'true',
        });
      } catch (_err) {
        // If storage fails, just show slides as if first launch
        setShowSlides(true);
      } finally {
        setSlidesReady(true);
      }
    })();
  }, []);

  const completeSlides = useCallback(async () => {
    try {
      await AsyncStorage.setItem(KEY_SLIDES, 'done');
    } catch (_err) {
      // ignore storage errors
    }
    setShowSlides(false);
  }, []);

  const markTooltipSeen = useCallback(async (key: TooltipKey) => {
    const storageKey =
      key === 'home'
        ? KEY_TIP_HOME
        : key === 'directorio'
        ? KEY_TIP_DIRECTORIO
        : key === 'explorar'
        ? KEY_TIP_EXPLORAR
        : KEY_TIP_EVENTOS;

    try {
      await AsyncStorage.setItem(storageKey, 'true');
    } catch (_err) {
      // ignore storage errors
    }
    setTooltipSeen((prev) => ({ ...prev, [key]: true }));
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        KEY_SLIDES,
        KEY_TIP_HOME,
        KEY_TIP_DIRECTORIO,
        KEY_TIP_EXPLORAR,
        KEY_TIP_EVENTOS,
      ]);
    } catch (_err) {
      // ignore storage errors
    }
    setTooltipSeen({ home: false, directorio: false, explorar: false, eventos: false });
    setShowSlides(true);
  }, []);

  const value: OnboardingContextValue = {
    slidesReady,
    showSlides,
    tooltipSeen,
    completeSlides,
    markTooltipSeen,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  }
  return ctx;
}
