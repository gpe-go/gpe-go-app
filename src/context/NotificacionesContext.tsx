import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  getNotificaciones,
  contarNoLeidas,
  marcarTodasLeidas as apiMarcarTodas,
  marcarLeida as apiMarcarLeida,
  guardarPushToken,
  eliminarPushToken,
} from '../api/api';
import { useAuth } from './AuthContext';

// Push solo funciona en build nativo (no en Expo Go desde SDK 53+)
// Se usa require() en lugar de import para evitar side effects en Expo Go
// (DevicePushTokenAutoRegistration.fx.js se ejecuta al importar expo-notifications)
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Configurar comportamiento solo si no es Expo Go (usando require para evitar side effects)
if (!IS_EXPO_GO) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert:  true,
      shouldPlaySound:  true,
      shouldSetBadge:   true,
      shouldShowBanner: true,
      shouldShowList:   true,
    }),
  });
}

export type Notificacion = {
  id: number;
  tipo: string;
  titulo: string;
  cuerpo: string;
  id_referencia: number | null;
  leida: number;
  created_at: string;
};

type NotificacionesContextType = {
  notificaciones: Notificacion[];
  unread: number;
  loading: boolean;
  refresh: () => Promise<void>;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodas: () => Promise<void>;
};

const NotificacionesContext = createContext<NotificacionesContextType>({
  notificaciones: [],
  unread: 0,
  loading: false,
  refresh: async () => {},
  marcarLeida: async () => {},
  marcarTodas: async () => {},
});

export function NotificacionesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unread, setUnread]     = useState(0);
  const [loading, setLoading]   = useState(false);
  const pushTokenRef            = useRef<string | null>(null);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Registrar push token ───────────────────────────────────────────────
  const registrarToken = useCallback(async () => {
    if (!isAuthenticated || IS_EXPO_GO) return;
    try {
      // require() aquí para evitar que el módulo se cargue en Expo Go
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Device        = require('expo-device');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications');

      if (!Device.isDevice) return;

      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      // Configurar canal en Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'GuadalupeGO',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E96928',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'guadalupego',
      });

      const token = tokenData.data;
      pushTokenRef.current = token;

      await guardarPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
    } catch {
      // Si falla (simulador, sin permisos), continúa sin push
    }
  }, [isAuthenticated]);

  // ─── Cargar notificaciones ───────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        getNotificaciones(),
        contarNoLeidas(),
      ]);
      if (listRes.success)  setNotificaciones(
        (listRes.data ?? []).map((n: any) => ({ ...n, leida: Number(n.leida) }))
      );
      if (countRes.success) setUnread(Number(countRes.data?.count ?? 0));
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ─── Marcar una como leída ───────────────────────────────────────────────
  const marcarLeida = useCallback(async (id: number) => {
    // Actualización visual inmediata, sin esperar la API
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: 1 } : n)
    );
    setUnread(prev => Math.max(0, prev - 1));
    apiMarcarLeida(id).catch(() => {});
  }, []);

  // ─── Marcar todas ───────────────────────────────────────────────────────
  const marcarTodas = useCallback(async () => {
    try {
      await apiMarcarTodas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: 1 })));
      setUnread(0);
    } catch {
      // silencioso
    }
  }, []);

  // ─── Efectos ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      registrarToken();
      refresh();
      // Refrescar conteo cada 2 minutos
      intervalRef.current = setInterval(refresh, 2 * 60 * 1000);
    } else {
      setNotificaciones([]);
      setUnread(0);
      // Eliminar token al cerrar sesión
      if (pushTokenRef.current) {
        eliminarPushToken(pushTokenRef.current).catch(() => {});
        pushTokenRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, refresh, registrarToken]);

  // ─── Escuchar notificaciones recibidas en foreground (solo build nativo) ──
  useEffect(() => {
    if (IS_EXPO_GO) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications');
    const sub = Notifications.addNotificationReceivedListener(() => {
      refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <NotificacionesContext.Provider
      value={{ notificaciones, unread, loading, refresh, marcarLeida, marcarTodas }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}

export const useNotificaciones = () => useContext(NotificacionesContext);
