# Integracion completa de la API GPE Go

## Objetivo

Reemplazar todos los datos hardcodeados de la app React Native con datos provenientes de la API `gpe_go_api`, manteniendo fallback a datos locales cuando la API no devuelva resultados o falle. Eliminar la dependencia de GNews para noticias.

## Arquitectura

```
Pantallas (UI)
    |
    v
Hooks (useLugares, useEventos, useNoticias, useFavoritosAPI)
    |          |
    v          v
Mappers    Fallback (datos locales)
    |
    v
API (api.ts) --> gpe_go_api/inputs.php?modulo=X&action=Y
```

Tres capas nuevas entre las pantallas y la API:

1. **api.ts** - funciones de fetch con params correctos
2. **mappers/** - transforman la respuesta de la API al formato que esperan las pantallas
3. **hooks/** - orquestan fetch + mapeo + fallback, exponen { data, loading, error }

## Orden de implementacion

1. Lugares (alimenta Home, Explorar, Directorio, Categorias, Detalle)
2. Eventos
3. Noticias (migrar de GNews a API propia con tipo=noticia)
4. Favoritos (migrar de AsyncStorage local a API con fallback local para no autenticados)

---

## Tipo unificado de Lugar

Actualmente existen dos tipos `Lugar`: uno en `src/data/lugares.ts` y otro en `src/context/FavoritosContext.tsx`. Se consolida a un solo tipo exportado desde `src/types/lugar.ts`:

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

Tanto `data/lugares.ts`, `FavoritosContext.tsx`, los mappers y los hooks importan de este archivo unico.

---

## Campos reales de la API vs campos que la app necesita

### Lugares

| Campo API (tb_lugares) | Campo App (Lugar) | Notas |
|------------------------|-------------------|-------|
| `id` | `id` (como string) | Convertir a string |
| `nombre` | `nombre` | Directo |
| `direccion` | `ubicacion` | Renombrar |
| `descripcion` | -- | No usado actualmente en tarjetas |
| `telefono` | -- | Solo en detalle |
| `categoria_nombre` | `categoria` | Viene del JOIN en la API |
| -- | `imagen` | No existe en tb_lugares. Obtener de `fotos_lugares` (primera foto) o placeholder |
| -- | `costo` | No existe en tb_lugares. Usar "Consultar" como default |
| -- | `rating` | No existe en tb_lugares. Obtener de promedio de resenas o 0 |

### Eventos

| Campo API (tb_eventos) | Campo App (Evento) | Notas |
|------------------------|-------------------|-------|
| `id` | `id` (como string) | Convertir a string |
| `titulo` | `titulo` | Directo |
| `fecha_inicio` + `fecha_fin` | `fecha` | Formatear como rango |
| `lugar_nombre` | `lugar` | OJO: el SQL alias es `lugar_nombre`, no `nombre_lugar` |
| `tipo` | `sub` | "evento" o "noticia" |
| `descripcion` | -- | No usado en tarjeta, si en detalle |
| -- | `imagen` | No existe en tb_eventos. Obtener de `fotos_eventos` o placeholder |
| -- | `categoria` | No existe. Usar "General" como default |
| -- | `costo` | No existe. Usar "Consultar" como default |
| -- | `especial` | No existe. Usar false como default |

### Noticias (tipo=noticia en eventos)

La pantalla de noticias actualmente consume GNews con campos: `title`, `description`, `image`, `url`, `publishedAt`, `content`. Se necesita un mapper dedicado.

| Campo API (evento tipo=noticia) | Campo Noticias App | Notas |
|--------------------------------|-------------------|-------|
| `titulo` | `title` | Renombrar |
| `descripcion` | `description` | Renombrar |
| `fecha_inicio` | `publishedAt` | Renombrar |
| -- | `image` | Obtener de fotos_eventos o placeholder |
| -- | `url` | No existe. Se elimina enlace externo en detalleNoticia |
| -- | `content` | Usar `descripcion` como contenido completo |

La pantalla `detalleNoticia.tsx` debe adaptarse para no depender de `url` (ya no hay enlace externo) y usar `descripcion` como contenido.

---

## 1. Capa de API (src/api/api.ts)

Corregir funciones existentes que usan URLs incorrectas (`/eventos`, `/lugares`) al formato real de la API (`?modulo=X&action=Y`). Las funciones ya no atrapan errores internamente - los hooks se encargan del error handling.

### Funciones a corregir

```ts
// getLugares - antes: API.get("/lugares")
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

// getLugar (nuevo) - detalle de un lugar
export const getLugar = async (id: number) => {
  const response = await API.get("", {
    params: { modulo: "lugares", action: "ver", id },
  });
  return response.data;
};

// getEventos - antes: API.get("/eventos")
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

// getNoticias - antes: llamaba a GNews. Ahora usa la API propia con tipo=noticia
export const getNoticias = async (params?: {
  busqueda?: string;
  pagina?: number;
}) => {
  const response = await API.get("", {
    params: { modulo: "eventos", action: "listar", tipo: "noticia", por_pagina: 100, ...params },
  });
  return response.data;
};

// getCategoriasAPI (nuevo)
export const getCategoriasAPI = async () => {
  const response = await API.get("", {
    params: { modulo: "categorias", action: "listar" },
  });
  return response.data;
};

// getFotoLugar (nuevo) - obtener primera foto de un lugar
export const getFotosLugar = async (id_lugar: number) => {
  const response = await API.get("", {
    params: { modulo: "fotos_lugares", action: "listar", id_lugar },
  });
  return response.data;
};

// getFavoritos - antes: API.get("/favoritos")
export const getFavoritos = async () => {
  const response = await API.get("", {
    params: { modulo: "favoritos", action: "listar" },
  });
  return response.data;
};

// agregarFavorito (nuevo)
export const agregarFavorito = async (payload: {
  id_lugar?: number;
  id_evento?: number;
}) => {
  const response = await API.post("", payload, {
    params: { modulo: "favoritos", action: "agregar" },
  });
  return response.data;
};

// quitarFavorito (nuevo)
export const quitarFavorito = async (id: number) => {
  const response = await API.delete("", {
    params: { modulo: "favoritos", action: "quitar", id },
  });
  return response.data;
};

// getUsuario - antes: API.get("/usuario")
export const getUsuario = async () => {
  const response = await API.get("", {
    params: { modulo: "usuarios", action: "perfil" },
  });
  return response.data;
};
```

### Funciones que no cambian

`solicitarCodigo`, `verificarCodigo`, `registrarUsuario` - ya usan el formato correcto.

### Nota de seguridad

Al completar la migracion, revocar la API key de GNews (`d1f76e48278d8951b1ecacf64f8366c3`) que esta expuesta en el codigo cliente.

---

## 2. Tipo unificado (src/types/lugar.ts)

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

Actualizar imports en: `src/data/lugares.ts`, `src/context/FavoritosContext.tsx`, y todas las pantallas que usen el tipo.

---

## 3. Mappers (src/mappers/)

### src/mappers/lugaresMapper.ts

```ts
import { Lugar } from "../types/lugar";

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export const mapLugar = (raw: any): Lugar => ({
  id: String(raw.id),
  nombre: raw.nombre,
  ubicacion: raw.direccion ?? "",
  imagen: PLACEHOLDER_IMG,  // se actualiza despues con fotos_lugares si existen
  categoria: raw.categoria_nombre ?? "",
  costo: "Consultar",       // campo no existe en la API actualmente
  rating: 0,                // campo no existe en la API actualmente
});

export const mapLugares = (rawList: any[]): Lugar[] =>
  rawList.map(mapLugar);
```

### src/mappers/eventosMapper.ts

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
  titulo: raw.titulo,
  fecha: formatearFecha(raw.fecha_inicio, raw.fecha_fin),
  lugar: raw.lugar_nombre ?? "",  // OJO: alias SQL es lugar_nombre
  imagen: PLACEHOLDER_IMG,        // se actualiza con fotos_eventos si existen
  categoria: "General",
  sub: raw.tipo === "noticia" ? "Noticia" : "Evento",
  costo: "Consultar",
  especial: false,
});

export const mapEventos = (rawList: any[]): Evento[] =>
  rawList.map(mapEvento);
```

### src/mappers/noticiasMapper.ts (NUEVO)

Mapper dedicado para transformar eventos tipo=noticia al formato que espera la pantalla de noticias (que antes consumia GNews).

```ts
const PLACEHOLDER_IMG = "https://via.placeholder.com/400x300?text=Sin+Imagen";

export type Noticia = {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  content: string;
  // url ya no existe - se elimina enlace externo
};

export const mapNoticia = (raw: any): Noticia => ({
  title: raw.titulo,
  description: raw.descripcion ?? "",
  image: PLACEHOLDER_IMG,        // se actualiza con fotos_eventos si existen
  publishedAt: raw.fecha_inicio ?? "",
  content: raw.descripcion ?? "", // contenido completo = descripcion
});

export const mapNoticias = (rawList: any[]): Noticia[] =>
  rawList.map(mapNoticia);
```

### src/mappers/favoritosMapper.ts

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

---

## 4. Hooks (src/hooks/)

### src/hooks/useLugares.ts

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
        // Si viene vacio, se queda con LUGARES (fallback)
      } catch (e) {
        setError("Error cargando lugares");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id_categoria, busqueda]);

  return { data, loading, error };
};
```

Nota: los params se pasan como primitivos individuales (no como objeto) para evitar re-renders infinitos por referencia de objeto en el dependency array del useEffect.

### src/hooks/useLugar.ts

```ts
// Hook para detalle de un lugar individual
// Llama a getLugar(id)
// Fallback: buscar en LUGARES locales por ID
```

### src/hooks/useEventos.ts

```ts
// Mismo patron que useLugares
// Fallback: EVENTOS_DATA
// Params primitivos: tipo, busqueda
```

### src/hooks/useNoticias.ts

```ts
// Llama a getNoticias() que internamente usa tipo="noticia"
// Mapea con mapNoticias (mapper dedicado)
// Fallback: array vacio
// La pantalla muestra "No hay noticias disponibles" cuando data.length === 0
```

### src/hooks/useFavoritosAPI.ts

```ts
// Logica dual:
//
// Si hay token (usuario autenticado):
//   - Al montar: llama getFavoritos() de la API
//   - Para cada favorito recibido (que solo trae id + nombre):
//     llama getLugar(id_lugar) para obtener datos completos y poder renderizar tarjetas
//   - toggleFavorito: llama agregarFavorito / quitarFavorito de la API
//   - esFavorito: busca en la lista cargada
//
// Si no hay token:
//   - Delega al FavoritosContext actual (AsyncStorage local)
//
// Expone: { favoritos: Lugar[], toggleFavorito, esFavorito, loading }
```

---

## 5. Cambios en pantallas

### Patron general de cambio

Cada pantalla reemplaza su import de datos hardcodeados por el hook correspondiente y agrega manejo basico de loading/error.

```
// ANTES
import { LUGARES } from "../../src/data/lugares";
// ... usa LUGARES directamente

// DESPUES
import { useLugares } from "../../src/hooks/useLugares";
const { data: lugares, loading, error } = useLugares();
// ... usa 'lugares' en vez de LUGARES
// Muestra ActivityIndicator si loading === true
```

### Pantallas afectadas

| Pantalla | Hook | Fallback | Notas |
|----------|------|----------|-------|
| `app/(tabs)/index.tsx` | `useLugares()` | LUGARES locales | Buscador usa datos del hook |
| `app/(tabs)/explorar.tsx` | `useLugares()` | LUGARES locales | Eliminar SITIOS_TURISTICOS inline |
| `app/(tabs)/directorio.tsx` | `useLugares()` | LUGARES locales | Eliminar LUGARES inline |
| `app/categorias/[tipo].tsx` | `useLugares(id_categoria)` | LUGARES filtrados | Pasar id_categoria numerico desde la ruta, no nombre string |
| `app/lugar/[id].tsx` | `useLugar(id)` | LUGARES locales por ID | -- |
| `app/(tabs)/eventos.tsx` | `useEventos()` | EVENTOS_DATA | -- |
| `app/(tabs)/noticias.tsx` | `useNoticias()` | Array vacio + mensaje | Quitar GNews completamente |
| `app/(tabs)/detalleNoticia.tsx` | -- | -- | Adaptar para no depender de `url`, usar `content` (=descripcion) |
| `app/(tabs)/favoritos.tsx` | `useFavoritosAPI()` | AsyncStorage local | Si no autenticado |
| `app/(tabs)/perfil.tsx` | `getUsuario()` corregido | -- | Actualizar llamada API |

### Categorias: resolucion nombre -> id_categoria

El Home navega a `/categorias/explorar` pasando un nombre de categoria string. La API filtra por `id_categoria` numerico. Solucion:

- Modificar el Home para pasar `id_categoria` como param de ruta en lugar del nombre
- O en el hook, cargar categorias primero con `getCategoriasAPI()` y resolver el nombre al ID

Se recomienda la primera opcion (pasar id_categoria desde Home) por ser mas simple.

### Indicadores de UI

- **Loading:** ActivityIndicator centrado mientras `loading === true`
- **Error:** Toast o texto sutil, no bloquea la pantalla (se muestran datos de fallback)
- **Vacio (noticias):** Icono + texto "No hay noticias disponibles"

---

## 6. Archivos nuevos a crear

```
src/
  types/
    lugar.ts
  mappers/
    lugaresMapper.ts
    eventosMapper.ts
    noticiasMapper.ts
    favoritosMapper.ts
  hooks/
    useLugares.ts
    useLugar.ts
    useEventos.ts
    useNoticias.ts
    useFavoritosAPI.ts
```

## 7. Archivos a modificar

```
src/api/api.ts                - corregir endpoints, agregar funciones nuevas, quitar GNews
src/data/lugares.ts           - importar Lugar desde types/lugar.ts
src/context/FavoritosContext.tsx - importar Lugar desde types/lugar.ts
app/(tabs)/index.tsx          - usar useLugares(), pasar id_categoria en navegacion
app/(tabs)/explorar.tsx       - usar useLugares(), eliminar data inline
app/(tabs)/directorio.tsx     - usar useLugares(), eliminar data inline
app/(tabs)/eventos.tsx        - usar useEventos()
app/(tabs)/noticias.tsx       - usar useNoticias(), quitar GNews
app/(tabs)/detalleNoticia.tsx - adaptar para nueva estructura sin url
app/(tabs)/favoritos.tsx      - usar useFavoritosAPI()
app/(tabs)/perfil.tsx         - usar getUsuario() corregido
app/categorias/[tipo].tsx     - usar useLugares(id_categoria)
app/lugar/[id].tsx            - usar useLugar(id)
```

## 8. Paginacion

Por ahora se usa `por_pagina: 100` como stopgap para traer todos los registros. Esto es suficiente para el volumen actual. Se puede implementar infinite scroll en una fase posterior si la cantidad de datos crece.

## 9. Lo que NO se toca en esta fase

- Modulo de resenas y calificaciones (fase posterior)
- Upload de fotos a S3 (fase posterior)
- Modulo de reportes (fase posterior)
- Edicion de perfil de usuario (fase posterior)
- Funcionalidades de admin/moderador (fase posterior)
