# API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded data in the React Native app with API calls to `gpe_go_api`, using hooks with fallback to local data.

**Architecture:** Three new layers — API functions with correct params, mapper functions that transform API responses to the shapes the UI expects, and custom hooks that orchestrate fetch + mapping + fallback. Each hook exposes `{ data, loading, error }`.

**Tech Stack:** React Native (Expo), TypeScript, Axios, expo-router

**Spec:** `docs/superpowers/specs/2026-03-21-api-integration-design.md`

---

## File Structure

```
src/
  types/
    lugar.ts              # Unified Lugar type (NEW)
  mappers/
    lugaresMapper.ts      # API -> Lugar (NEW)
    eventosMapper.ts      # API -> Evento (NEW)
    noticiasMapper.ts     # API -> Noticia (NEW)
    favoritosMapper.ts    # API -> FavoritoAPI (NEW)
  hooks/
    useLugares.ts         # Hook for places list (NEW)
    useLugar.ts           # Hook for single place detail (NEW)
    useEventos.ts         # Hook for events list (NEW)
    useNoticias.ts        # Hook for news list (NEW)
    useFavoritosAPI.ts    # Hook for favorites with auth (NEW)
  api/
    api.ts                # Fix endpoints, add new functions (MODIFY)
  data/
    lugares.ts            # Update Lugar import (MODIFY)
    eventos.ts            # No changes needed
  context/
    FavoritosContext.tsx   # Update Lugar import (MODIFY)

app/
  (tabs)/
    index.tsx             # Use useLugares() (MODIFY)
    explorar.tsx          # Use useLugares(), remove inline data (MODIFY)
    directorio.tsx        # Use useLugares(), remove inline data (MODIFY)
    eventos.tsx           # Use useEventos() (MODIFY)
    noticias.tsx          # Use useNoticias(), remove GNews (MODIFY)
    detalleNoticia.tsx    # Adapt for API data shape (MODIFY)
    favoritos.tsx         # Use useFavoritosAPI() (MODIFY)
  categorias/
    [tipo].tsx            # Use useLugares() (MODIFY)
  lugar/
    [id].tsx              # Use useLugar() (MODIFY)
```

---

## Task 1: Unified Lugar type

**Files:**
- Create: `src/types/lugar.ts`
- Modify: `src/data/lugares.ts`
- Modify: `src/context/FavoritosContext.tsx`

- [ ] **Step 1: Create the unified Lugar type**

Create `src/types/lugar.ts`:

```ts
export type Lugar = {
  id: string;
  nombre: string;
  ubicacion: string;
  imagen: string;
  categoria: string;
  costo: string;
  rating?: number;
};
```

- [ ] **Step 2: Update `src/data/lugares.ts` to import from unified type**

Replace the local `Lugar` type definition with an import:

```ts
// Remove the local type definition and replace with:
import { Lugar } from "../types/lugar";

// Re-export for backwards compatibility
export type { Lugar };

// LUGARES array stays the same
```

- [ ] **Step 3: Update `src/context/FavoritosContext.tsx` to import from unified type**

Replace the local `Lugar` interface (lines 4-12) with:

```ts
import { Lugar } from "../types/lugar";

// Remove the interface Lugar { ... } block
// Keep the rest of the file unchanged
// Keep the "export { Lugar }" so other files that import from here still work
```

Add a re-export at the bottom:

```ts
export type { Lugar };
```

- [ ] **Step 4: Verify the app still compiles**

Run: `cd /Applications/XAMPP/xamppfiles/htdocs/gpe-go-app && npx expo start --clear 2>&1 | head -20`

Verify no TypeScript errors related to the Lugar type.

- [ ] **Step 5: Commit**

```bash
git add src/types/lugar.ts src/data/lugares.ts src/context/FavoritosContext.tsx
git commit -m "refactor: unify Lugar type into src/types/lugar.ts"
```

---

## Task 2: Fix API functions in api.ts

**Files:**
- Modify: `src/api/api.ts`

- [ ] **Step 1: Fix `getLugares` to use correct params**

Replace the current `getLugares` function (lines 57-65) with:

```ts
export const getLugares = async (params?: {
  id_categoria?: number;
  busqueda?: string;
  pagina?: number;
  por_pagina?: number;
}) => {
  const response = await API.get("", {
    params: { modulo: "lugares", action: "listar", por_pagina: 100, ...params },
  });
  return response.data;
};
```

- [ ] **Step 2: Add `getLugar` for single place detail**

Add after `getLugares`:

```ts
export const getLugar = async (id: number) => {
  const response = await API.get("", {
    params: { modulo: "lugares", action: "ver", id },
  });
  return response.data;
};
```

- [ ] **Step 3: Fix `getEventos` to use correct params**

Replace the current `getEventos` function (lines 45-53) with:

```ts
export const getEventos = async (params?: {
  tipo?: string;
  busqueda?: string;
  pagina?: number;
  por_pagina?: number;
}) => {
  const response = await API.get("", {
    params: { modulo: "eventos", action: "listar", por_pagina: 100, ...params },
  });
  return response.data;
};
```

- [ ] **Step 4: Replace `getNoticias` to use own API instead of GNews**

Replace the current `getNoticias` function (lines 94-115) with:

```ts
export const getNoticias = async (params?: {
  busqueda?: string;
  pagina?: number;
}) => {
  const response = await API.get("", {
    params: { modulo: "eventos", action: "listar", tipo: "noticia", por_pagina: 100, ...params },
  });
  return response.data;
};
```

- [ ] **Step 5: Fix `getFavoritos` and add `agregarFavorito`, `quitarFavorito`**

Replace the current `getFavoritos` (lines 69-78) with:

```ts
export const getFavoritos = async () => {
  const response = await API.get("", {
    params: { modulo: "favoritos", action: "listar" },
  });
  return response.data;
};

export const agregarFavorito = async (payload: {
  id_lugar?: number;
  id_evento?: number;
}) => {
  const response = await API.post("", payload, {
    params: { modulo: "favoritos", action: "agregar" },
  });
  return response.data;
};

export const quitarFavorito = async (id: number) => {
  const response = await API.delete("", {
    params: { modulo: "favoritos", action: "quitar", id },
  });
  return response.data;
};
```

- [ ] **Step 6: Fix `getUsuario`**

Replace the current `getUsuario` (lines 80-90) with:

```ts
export const getUsuario = async () => {
  const response = await API.get("", {
    params: { modulo: "usuarios", action: "perfil" },
  });
  return response.data;
};
```

- [ ] **Step 7: Add `getCategoriasAPI` and `getFotosLugar`**

Add at the end of the file. Note: `getFotosLugar` and `getCategoriasAPI` are created now for completeness but are NOT used by any hook in this phase. They will be used in a future phase when we integrate photo galleries and server-side category filtering.

```ts
export const getCategoriasAPI = async () => {
  const response = await API.get("", {
    params: { modulo: "categorias", action: "listar" },
  });
  return response.data;
};

export const getFotosLugar = async (id_lugar: number) => {
  const response = await API.get("", {
    params: { modulo: "fotos_lugares", action: "listar", id_lugar },
  });
  return response.data;
};
```

- [ ] **Step 8: Commit**

```bash
git add src/api/api.ts
git commit -m "fix: correct API endpoints to use modulo/action params, remove GNews dependency"
```

---

## Task 3: Create Mappers

**Files:**
- Create: `src/mappers/lugaresMapper.ts`
- Create: `src/mappers/eventosMapper.ts`
- Create: `src/mappers/noticiasMapper.ts`
- Create: `src/mappers/favoritosMapper.ts`

- [ ] **Step 1: Create lugaresMapper.ts**

Create `src/mappers/lugaresMapper.ts`:

```ts
import { Lugar } from "../types/lugar";

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export const mapLugar = (raw: any): Lugar => ({
  id: String(raw.id),
  nombre: raw.nombre ?? "",
  ubicacion: raw.direccion ?? "",
  imagen: PLACEHOLDER_IMG,
  categoria: raw.categoria_nombre ?? "",
  costo: "Consultar",
  rating: 0,
});

export const mapLugares = (rawList: any[]): Lugar[] =>
  rawList.map(mapLugar);
```

- [ ] **Step 2: Create eventosMapper.ts**

Create `src/mappers/eventosMapper.ts`:

```ts
import { Evento } from "../data/eventos";

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

const formatearFecha = (inicio?: string, fin?: string): string => {
  if (!inicio) return "";
  if (!fin || inicio === fin) return inicio;
  return `${inicio} - ${fin}`;
};

export const mapEvento = (raw: any): Evento => ({
  id: String(raw.id),
  titulo: raw.titulo ?? "",
  fecha: formatearFecha(raw.fecha_inicio, raw.fecha_fin),
  lugar: raw.lugar_nombre ?? "",
  imagen: PLACEHOLDER_IMG,
  categoria: "General",
  sub: raw.tipo === "noticia" ? "Noticia" : "Evento",
  costo: "Consultar",
  especial: false,
});

export const mapEventos = (rawList: any[]): Evento[] =>
  rawList.map(mapEvento);
```

- [ ] **Step 3: Create noticiasMapper.ts**

Create `src/mappers/noticiasMapper.ts`:

```ts
const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export type Noticia = {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  content: string;
};

export const mapNoticia = (raw: any): Noticia => ({
  title: raw.titulo ?? "",
  description: raw.descripcion ?? "",
  image: PLACEHOLDER_IMG,
  publishedAt: raw.fecha_inicio ?? "",
  content: raw.descripcion ?? "",
});

export const mapNoticias = (rawList: any[]): Noticia[] =>
  rawList.map(mapNoticia);
```

- [ ] **Step 4: Create favoritosMapper.ts**

Create `src/mappers/favoritosMapper.ts`:

```ts
export type FavoritoAPI = {
  id: string;
  id_lugar: string | null;
  id_evento: string | null;
  nombre: string;
};

export const mapFavorito = (raw: any): FavoritoAPI => ({
  id: String(raw.id),
  id_lugar: raw.id_lugar ? String(raw.id_lugar) : null,
  id_evento: raw.id_evento ? String(raw.id_evento) : null,
  nombre: raw.nombre_lugar ?? raw.nombre_evento ?? "",
});

export const mapFavoritos = (rawList: any[]): FavoritoAPI[] =>
  rawList.map(mapFavorito);
```

- [ ] **Step 5: Commit**

```bash
git add src/mappers/
git commit -m "feat: add mapper functions for lugares, eventos, noticias, favoritos"
```

---

## Task 4: Create Hooks — useLugares and useLugar

**Files:**
- Create: `src/hooks/useLugares.ts`
- Create: `src/hooks/useLugar.ts`

- [ ] **Step 1: Create useLugares.ts**

Create `src/hooks/useLugares.ts`:

```ts
import { useState, useEffect } from "react";
import { getLugares } from "../api/api";
import { mapLugares } from "../mappers/lugaresMapper";
import { LUGARES } from "../data/lugares";
import { Lugar } from "../types/lugar";

export const useLugares = (id_categoria?: number, busqueda?: string) => {
  const [data, setData] = useState<Lugar[]>(LUGARES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const params: any = {};
        if (id_categoria) params.id_categoria = id_categoria;
        if (busqueda) params.busqueda = busqueda;

        const res = await getLugares(params);
        if (res.success && res.data?.lugares?.length > 0) {
          setData(mapLugares(res.data.lugares));
        }
      } catch (e) {
        setError("Error cargando lugares");
        console.log("Usando datos locales de lugares");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id_categoria, busqueda]);

  return { data, loading, error };
};
```

- [ ] **Step 2: Create useLugar.ts**

Create `src/hooks/useLugar.ts`:

```ts
import { useState, useEffect } from "react";
import { getLugar } from "../api/api";
import { mapLugar } from "../mappers/lugaresMapper";
import { LUGARES } from "../data/lugares";
import { Lugar } from "../types/lugar";

export const useLugar = (id: string) => {
  const fallback = LUGARES.find((l) => l.id === id) ?? null;
  const [data, setData] = useState<Lugar | null>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getLugar(Number(id));
        if (res.success && res.data) {
          setData(mapLugar(res.data));
        }
      } catch (e) {
        setError("Error cargando lugar");
        console.log("Usando datos locales para lugar", id);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  return { data, loading, error };
};
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLugares.ts src/hooks/useLugar.ts
git commit -m "feat: add useLugares and useLugar hooks with API fallback"
```

---

## Task 5: Integrate Lugares into screens

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/explorar.tsx`
- Modify: `app/(tabs)/directorio.tsx`
- Modify: `app/categorias/[tipo].tsx`
- Modify: `app/lugar/[id].tsx`

- [ ] **Step 1: Update `app/(tabs)/index.tsx`**

Replace the import and usage of hardcoded LUGARES:

```diff
- import { LUGARES } from "../../src/data/lugares";
+ import { useLugares } from "../../src/hooks/useLugares";
+ import { ActivityIndicator } from "react-native";
```

Inside the component, add:

```ts
const { data: lugares, loading } = useLugares();
```

Replace all references to `LUGARES` with `lugares` in the search filter:

```ts
const searchResults =
  search.length > 0
    ? lugares.filter((item: any) =>
        item.nombre.toLowerCase().includes(search.toLowerCase())
      )
    : [];
```

- [ ] **Step 2: Update `app/(tabs)/explorar.tsx`**

Replace the inline `SITIOS_TURISTICOS` data (lines 23-onwards) with the hook:

```diff
- const SITIOS_TURISTICOS: Lugar[] = [ ... ];
+ import { useLugares } from "../../src/hooks/useLugares";
```

Inside the component:

```ts
const { data: sitios, loading } = useLugares();
```

Replace ALL references to `SITIOS_TURISTICOS` with `sitios`, including:
- The `filteredData` state initialization (e.g., `useState(SITIOS_TURISTICOS)` -> `useState(sitios)`)
- The `filtrarCategoria` function that resets to `SITIOS_TURISTICOS` when "Todas" is selected
- The `handleSearch` function that filters from `SITIOS_TURISTICOS`
- Any other filter/search logic referencing the constant

These filter functions must use the hook's data as their source, not the removed constant.

Add `ActivityIndicator` while loading if desired.

- [ ] **Step 3: Update `app/(tabs)/directorio.tsx`**

Replace the inline `LUGARES` data (lines 20-onwards) with the hook:

```diff
- const LUGARES: Lugar[] = [ ... ];
+ import { useLugares } from "../../src/hooks/useLugares";
```

Inside the component:

```ts
const { data: lugares, loading } = useLugares();
```

Replace ALL references to `LUGARES` with `lugares`, including:
- The `filtrar` function that searches/filters from the `LUGARES` constant
- Any state initialization that uses `LUGARES`
- Any category filter logic referencing the constant

- [ ] **Step 4: Update `app/categorias/[tipo].tsx`**

Replace the import and filtering:

```diff
- import { LUGARES } from "../../src/data/lugares";
+ import { useLugares } from "../../src/hooks/useLugares";
```

Inside the component:

```ts
const { data: lugares, loading } = useLugares();
const lugaresCategoria = lugares.filter((item) => item.categoria === tipo);
```

Note: For now we filter client-side by category name since the route passes the name string. This works with fallback data. When the API has data, the `id_categoria` filter can be added later.

Replace `LUGARES` usage with `lugaresCategoria`.

- [ ] **Step 5: Update `app/lugar/[id].tsx`**

Replace the import and lookup:

```diff
- import { LUGARES } from "../../src/data/lugares";
+ import { useLugar } from "../../src/hooks/useLugar";
+ import { ActivityIndicator } from "react-native";
```

Inside the component:

```ts
const { data: lugar, loading } = useLugar(id as string);
```

Remove the line:
```diff
- const lugar = LUGARES.find((item: any) => item.id === id);
```

Update the loading state:
```ts
if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#E96928" /></View>;
if (!lugar) return <View style={styles.container}><Text>Lugar no encontrado</Text></View>;
```

- [ ] **Step 6: Verify screens render correctly**

Run: `cd /Applications/XAMPP/xamppfiles/htdocs/gpe-go-app && npx expo start --clear 2>&1 | head -20`

Navigate through Home, Explorar, Directorio, a category, and a lugar detail. Fallback data should display.

- [ ] **Step 7: Commit**

```bash
git add app/(tabs)/index.tsx app/(tabs)/explorar.tsx app/(tabs)/directorio.tsx app/categorias/\[tipo\].tsx app/lugar/\[id\].tsx
git commit -m "feat: integrate useLugares/useLugar hooks into all places screens"
```

---

## Task 6: Create and integrate useEventos hook

**Files:**
- Create: `src/hooks/useEventos.ts`
- Modify: `app/(tabs)/eventos.tsx`

- [ ] **Step 1: Create useEventos.ts**

Create `src/hooks/useEventos.ts`:

```ts
import { useState, useEffect } from "react";
import { getEventos } from "../api/api";
import { mapEventos } from "../mappers/eventosMapper";
import { EVENTOS_DATA, Evento } from "../data/eventos";

export const useEventos = (tipo?: string, busqueda?: string) => {
  const [data, setData] = useState<Evento[]>(EVENTOS_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const params: any = {};
        if (tipo) params.tipo = tipo;
        if (busqueda) params.busqueda = busqueda;

        const res = await getEventos(params);
        if (res.success && res.data?.eventos?.length > 0) {
          setData(mapEventos(res.data.eventos));
        }
      } catch (e) {
        setError("Error cargando eventos");
        console.log("Usando datos locales de eventos");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [tipo, busqueda]);

  return { data, loading, error };
};
```

- [ ] **Step 2: Update `app/(tabs)/eventos.tsx`**

Replace the import and usage of hardcoded data:

```diff
- import { EVENTOS_DATA } from "@/src/data/eventos";
+ import { useEventos } from "../../src/hooks/useEventos";
+ import { ActivityIndicator } from "react-native";
```

Inside the component, add at the top:

```ts
const { data: eventos, loading } = useEventos();
```

Replace ALL references to `EVENTOS_DATA` with `eventos`:

- Line 49: `const eventoPrincipal = eventos.find(e => e.especial);`
- Line 51: `const filteredEvents = eventos.filter((event) => { ...`
- Lines 115-116 in search results: `eventos.filter(e => ...`

Remove the commented-out backend integration code at the bottom of the file (lines 389-420).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useEventos.ts app/(tabs)/eventos.tsx
git commit -m "feat: integrate useEventos hook, replace hardcoded EVENTOS_DATA"
```

---

## Task 7: Create and integrate useNoticias hook

**Files:**
- Create: `src/hooks/useNoticias.ts`
- Modify: `app/(tabs)/noticias.tsx`
- Modify: `app/(tabs)/detalleNoticia.tsx`

- [ ] **Step 1: Create useNoticias.ts**

Create `src/hooks/useNoticias.ts`:

```ts
import { useState, useEffect } from "react";
import { getNoticias } from "../api/api";
import { mapNoticias, Noticia } from "../mappers/noticiasMapper";

export const useNoticias = (busqueda?: string) => {
  const [data, setData] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const params: any = {};
        if (busqueda) params.busqueda = busqueda;

        const res = await getNoticias(params);
        if (res.success && res.data?.eventos?.length > 0) {
          setData(mapNoticias(res.data.eventos));
        }
        // If empty, data stays as [] — screen shows empty state
      } catch (e) {
        setError("Error cargando noticias");
        console.log("No se pudieron cargar noticias");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [busqueda]);

  return { data, loading, error };
};
```

- [ ] **Step 2: Update `app/(tabs)/noticias.tsx`**

Replace the import and data fetching:

```diff
- import { getNoticias } from '@/src/api/api';
+ import { useNoticias } from '../../src/hooks/useNoticias';
+ import { ActivityIndicator } from 'react-native';
```

Replace the state and useEffect (lines 9-20) with:

```ts
const { data: noticias, loading } = useNoticias();
```

Add empty state after the header, before the map:

```tsx
{loading && (
  <View style={{ padding: 40, alignItems: "center" }}>
    <ActivityIndicator size="large" color="#E96928" />
  </View>
)}

{!loading && noticias.length === 0 && (
  <View style={{ padding: 40, alignItems: "center" }}>
    <Ionicons name="newspaper-outline" size={60} color="#CBD5E1" />
    <Text style={{ fontSize: 16, color: "#94A3B8", marginTop: 12 }}>
      No hay noticias disponibles
    </Text>
  </View>
)}
```

Also remove `url: item.url` from the `router.push` params object (line 129) since the `Noticia` type has no `url` field:

```diff
  params: {
    title: item.title,
    description: item.description,
    image: item.image,
    content: item.content,
-   url: item.url,
    date: item.publishedAt
  }
```

The rest of the component stays the same — it already reads `item.title`, `item.description`, `item.image`, `item.publishedAt` which match the `Noticia` type from our mapper.

- [ ] **Step 3: Update `app/(tabs)/detalleNoticia.tsx`**

Remove the "Ver noticia completa" button and its Linking import since there's no external URL anymore:

```diff
- import * as Linking from "expo-linking";
```

Remove the button (lines 37-45):

```diff
-        <Pressable
-          style={styles.button}
-          onPress={() => Linking.openURL(url as string)}
-        >
-          <Ionicons name="open-outline" size={18} color="#fff" />
-          <Text style={styles.buttonText}>
-            Ver noticia completa
-          </Text>
-        </Pressable>
```

Remove `url` from the params destructuring:

```diff
- const { title, description, image, content, url, date } = useLocalSearchParams();
+ const { title, description, image, content, date } = useLocalSearchParams();
```

Remove the `button` and `buttonText` styles.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useNoticias.ts app/(tabs)/noticias.tsx app/(tabs)/detalleNoticia.tsx
git commit -m "feat: integrate useNoticias hook, replace GNews with own API"
```

---

## Task 8: Create and integrate useFavoritosAPI hook

**Files:**
- Create: `src/hooks/useFavoritosAPI.ts`
- Modify: `app/(tabs)/favoritos.tsx`

- [ ] **Step 1: Create useFavoritosAPI.ts**

Create `src/hooks/useFavoritosAPI.ts`:

```ts
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFavoritos, agregarFavorito, quitarFavorito, getLugar } from "../api/api";
import { mapLugar } from "../mappers/lugaresMapper";
import { mapFavoritos } from "../mappers/favoritosMapper";
import { Lugar } from "../types/lugar";

export const useFavoritosAPI = () => {
  const [favoritos, setFavoritos] = useState<Lugar[]>([]);
  const [favIdMap, setFavIdMap] = useState<Record<string, number>>({}); // lugarId -> favoritoAPIId
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Check auth status and load favorites
  useEffect(() => {
    const cargar = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          setIsAuth(true);
          const res = await getFavoritos();

          if (res.success && Array.isArray(res.data)) {
            const mapped = mapFavoritos(res.data);

            // Build favId mapping for later toggle operations
            const idMap: Record<string, number> = {};
            mapped.forEach((fav) => {
              if (fav.id_lugar) idMap[fav.id_lugar] = Number(fav.id);
            });
            setFavIdMap(idMap);

            // Fetch full lugar details in parallel (not sequential)
            const promises = mapped
              .filter((fav) => fav.id_lugar)
              .map(async (fav) => {
                try {
                  const lugarRes = await getLugar(Number(fav.id_lugar));
                  if (lugarRes.success && lugarRes.data) {
                    return mapLugar(lugarRes.data);
                  }
                } catch {
                  // If individual lugar fetch fails, return minimal data
                }
                return {
                  id: fav.id_lugar!,
                  nombre: fav.nombre,
                  ubicacion: "",
                  imagen: "https://via.placeholder.com/400x300?text=Sin+Imagen",
                  categoria: "",
                  costo: "Consultar",
                } as Lugar;
              });

            const lugaresCompletos = await Promise.all(promises);
            setFavoritos(lugaresCompletos);
          }
        }
        // If no token, favoritos stays empty (local mode via FavoritosContext)
      } catch (e) {
        console.log("Error cargando favoritos desde API");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const toggleFavorito = useCallback(async (lugar: Lugar) => {
    if (!isAuth) return; // If not auth, the FavoritosContext handles it

    const existe = favoritos.some((f) => f.id === lugar.id);

    if (existe) {
      try {
        // Use stored mapping instead of refetching
        const favAPIId = favIdMap[lugar.id];
        if (favAPIId) {
          await quitarFavorito(favAPIId);
        }
        setFavoritos((prev) => prev.filter((f) => f.id !== lugar.id));
        setFavIdMap((prev) => {
          const next = { ...prev };
          delete next[lugar.id];
          return next;
        });
      } catch (e) {
        console.log("Error quitando favorito");
      }
    } else {
      try {
        const res = await agregarFavorito({ id_lugar: Number(lugar.id) });
        setFavoritos((prev) => [...prev, lugar]);
        if (res.success && res.data?.id) {
          setFavIdMap((prev) => ({ ...prev, [lugar.id]: res.data.id }));
        }
      } catch (e) {
        console.log("Error agregando favorito");
      }
    }
  }, [isAuth, favoritos, favIdMap]);

  const esFavorito = useCallback(
    (id: string) => favoritos.some((f) => f.id === id),
    [favoritos]
  );

  return { favoritos, toggleFavorito, esFavorito, loading, isAuth };
};
```

- [ ] **Step 2: Update `app/(tabs)/favoritos.tsx`**

The favoritos screen currently uses `useFavoritos()` from `FavoritosContext`. We need to add the API-backed hook as an additional data source for authenticated users.

Add import:

```diff
+ import { useFavoritosAPI } from '../../src/hooks/useFavoritosAPI';
```

Inside the component, add:

```ts
const { favoritos: favoritosLocal, toggleFavorito: toggleLocal } = useFavoritos();
const { favoritos: favoritosAPI, toggleFavorito: toggleAPI, loading: loadingAPI, isAuth } = useFavoritosAPI();

// Use API favorites if authenticated, otherwise local
const favoritosActivos = isAuth ? favoritosAPI : favoritosLocal;
const toggleActivo = isAuth ? toggleAPI : toggleLocal;
```

Replace references to `favoritos` with `favoritosActivos` and `toggleFavorito` with `toggleActivo` throughout the component.

Add loading indicator when `loadingAPI` is true.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useFavoritosAPI.ts app/(tabs)/favoritos.tsx
git commit -m "feat: integrate useFavoritosAPI hook with auth-aware favorites"
```

---

## Task 9: Cleanup and final verification

**Files:**
- Modify: `src/api/api.ts` (remove unused GNews API key)

- [ ] **Step 1: Remove GNews API key from codebase**

Verify the GNews `getNoticias` function has been replaced (done in Task 2). Ensure no references to `gnews.io` remain:

Run: `grep -r "gnews" src/ app/`

If any remain, remove them.

- [ ] **Step 2: Revoke the GNews API key**

The key `d1f76e48278d8951b1ecacf64f8366c3` was exposed in client-side code and is committed to version control. Revoke it from the GNews dashboard.

- [ ] **Step 3: Verify all screens work with fallback data**

Start the app and navigate through each screen:

1. Home (index.tsx) — should show LUGARES in search
2. Explorar — should show places list
3. Directorio — should show places list
4. Tap a category from Home — should show filtered places
5. Tap a place — should show detail
6. Eventos — should show EVENTOS_DATA
7. Noticias — should show "No hay noticias disponibles" (API likely empty)
8. Favoritos — should work locally if not logged in

- [ ] **Step 4: Commit final cleanup**

```bash
git add -A
git commit -m "chore: cleanup GNews references, verify API integration complete"
```

---

## Deferred to future phases

- **`perfil.tsx`** — currently a static login form, not a real profile screen. Will be updated to use `getUsuario()` when the profile screen is redesigned.
- **Photo integration** — `getFotosLugar` / `getFotosEvento` are available but not wired into mappers/hooks yet. All images use placeholders until photos are uploaded to S3.
- **Server-side category filtering** — Currently filtering client-side by category name. Will use `id_categoria` when Home passes numeric IDs.
- **Resenas, reportes, admin features** — Not in scope for this phase.

---

## Summary of changes

| Task | Description | Files |
|------|-------------|-------|
| 1 | Unified Lugar type | 3 files |
| 2 | Fix API functions | 1 file |
| 3 | Create mappers | 4 files |
| 4 | Lugares hooks | 2 files |
| 5 | Integrate lugares into 5 screens | 5 files |
| 6 | Eventos hook + screen | 2 files |
| 7 | Noticias hook + screens | 3 files |
| 8 | Favoritos hook + screen | 2 files |
| 9 | Cleanup and verify | 1 file |
| **Total** | | **23 file changes** |
