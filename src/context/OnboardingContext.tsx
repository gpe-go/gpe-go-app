import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const KEY_TOUR = '@ggo_tour_done';

interface OnboardingContextValue {
  /** True once AsyncStorage has been read */
  tourReady: boolean;
  /** Whether the in-app guided tour is currently running */
  tourActive: boolean;
  /** Current step (0=Home, 1=Directorio, 2=Explorar, 3=Eventos) */
  tourStep: number;
  /** Advance to next step; completes tour on last step */
  nextTourStep: () => Promise<void>;
  /** Skip and end the tour immediately */
  skipTour: () => Promise<void>;
  /** Reset so tour shows again — called from Settings */
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const TOTAL_STEPS = 7;

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [tourReady, setTourReady] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem(KEY_TOUR);
        setTourActive(done === null); // null = first launch → show tour
      } catch {
        setTourActive(true);
      } finally {
        setTourReady(true);
      }
    })();
  }, []);

  const completeTour = useCallback(async () => {
    try {
      await AsyncStorage.setItem(KEY_TOUR, 'done');
    } catch { /* ignore storage errors */ }
    setTourActive(false);
    setTourStep(0);
  }, []);

  const nextTourStep = useCallback(async () => {
    if (tourStep < TOTAL_STEPS - 1) {
      setTourStep(s => s + 1);
    } else {
      await completeTour();
    }
  }, [tourStep, completeTour]);

  const skipTour = useCallback(async () => {
    await completeTour();
  }, [completeTour]);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(KEY_TOUR);
    } catch { /* ignore */ }
    setTourStep(0);
    setTourActive(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{ tourReady, tourActive, tourStep, nextTourStep, skipTour, resetOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}
