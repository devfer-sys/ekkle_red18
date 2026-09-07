# 📍 Encuentra tu Célula

Una página web estática, moderna y totalmente responsive para mostrar información de diferentes células. Desplegable gratuitamente en **GitHub Pages**.

![Vista previa](assets/preview.png)

---

## ✨ Características

- 🎨 **Diseño moderno y juvenil** con fondo oscuro y colores vibrantes
- 📱 **Totalmente responsive** — funciona en móviles, tablets y computadoras
- 🔍 **Buscador en tiempo real** por nombre, día, lugar o número
- 📅 **Filtros por día** (Todos, Jueves, Sábados, Domingos)
- 📍 **Geolocalización** para calcular distancia a cada célula
- 🗺️ **Mapa interactivo** con Leaflet.js + OpenStreetMap
- 📏 **Cálculo de distancia** con fórmula de Haversine
- 💬 **Botones de WhatsApp** con mensaje predeterminado
- 📞 **Botones de llamada** directa desde móviles
- 🗺️ **Abrir en Google Maps** con un clic
- 🚫 **Sin backend** — 100% estático, listo para GitHub Pages

---

## 🚀 Cómo ejecutar localmente

### Opción 1: Abrir directamente
1. Descarga o clona este repositorio
2. Abre el archivo `index.html` en tu navegador

### Opción 2: Servidor local (recomendado)
```bash
# Con Python 3
cd celulas-web
python -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8000
```
Luego abre `http://localhost:8000` en tu navegador.

> ⚠️ **Nota:** Leaflet.js requiere que se sirva desde un servidor (no funciona abriendo el archivo directamente por restricciones de CORS).

---

## 📤 Cómo subir a GitHub

### Paso 1: Crear repositorio
1. Ve a [github.com](https://github.com) e inicia sesión
2. Clic en **New repository** (o el botón `+` → New repository)
3. Nombre: `celulas-web` (o el que prefieras)
4. Deja todo en público
5. Clic en **Create repository**

### Paso 2: Subir archivos
```bash
# En tu computadora, dentro de la carpeta celulas-web
git init
git add .
git commit -m "Primera versión de Encuentra tu Célula"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/celulas-web.git
git push -u origin main
```

O sube los archivos manualmente arrastrándolos a GitHub.

### Paso 3: Activar GitHub Pages
1. En tu repositorio de GitHub, ve a **Settings**
2. En el menú lateral, clic en **Pages**
3. En "Source", selecciona **Deploy from a branch**
4. Selecciona la rama **main** y carpeta **/(root)**
5. Clic en **Save**
6. Espera 1-2 minutos y tu sitio estará en:
   `https://TU_USUARIO.github.io/celulas-web/`

---

## 📝 Cómo agregar nuevas células

Abre el archivo `js/data.js` y agrega un nuevo objeto al array `celulas`:

```javascript
{
  id: 6,                              // Número único, incremental
  nombre: "Nombre1, Nombre2",          // Nombres de los líderes
  dia: "Domingo",                     // Día de reunión
  hora: "10:00",                      // Hora en formato 24h
  direccion: "Calle Ejemplo 123",    // Dirección completa
  referencia: "Cerca del mercado",     // Punto de referencia
  contactos: ["71234567", "72345678"], // Array de números (sin +591)
  latitud: null,                      // Coordenada (null si no se conoce)
  longitud: null,                     // Coordenada (null si no se conoce)
  color: "pink",                      // Color de la tarjeta
  hex: "#e91e63"                     // Código HEX del color
}
```

### Colores disponibles:
| Color | Clase CSS | HEX |
|-------|-----------|-----|
| Rosa | `pink` | `#e91e63` |
| Turquesa | `teal` | `#00bcd4` |
| Naranja | `orange` | `#ff9800` |
| Morado | `purple` | `#9c27b0` |
| Verde | `green` | `#4caf50` |

---

## 📍 Cómo agregar coordenadas GPS

### Método 1: Google Maps (más preciso)
1. Abre [Google Maps](https://maps.google.com)
2. Busca la dirección de la célula
3. Haz **clic derecho** en el punto exacto
4. Aparecerán las coordenadas en la parte inferior
5. Copia el primer número (latitud) y el segundo (longitud)

### Método 2: Desde el celular
1. Abre Google Maps en tu celular
2. Mantén presionado el punto exacto
3. Toca las coordenadas que aparecen arriba
4. Copia y pega en `data.js`

### Ejemplo con coordenadas:
```javascript
{
  id: 1,
  nombre: "Wilson, Xime, Raysa",
  // ... otros campos ...
  latitud: -16.5043,    // ← Reemplazar null
  longitud: -68.1234,   // ← Reemplazar null
  // ...
}
```

---

## 🎨 Cómo cambiar colores, horarios, direcciones y teléfonos

Todo está en el archivo **`js/data.js`**. Simplemente edita los valores:

```javascript
// Cambiar hora
hora: "19:00",

// Cambiar dirección
direccion: "Nueva dirección aquí",

// Cambiar referencia
referencia: "Nuevo punto de referencia",

// Cambiar contactos (siempre como array de strings)
contactos: ["70000001", "70000002", "70000003"],

// Cambiar color
color: "purple",
hex: "#9c27b0"
```

---

## 📁 Estructura del proyecto

```
celulas-web/
│
├── index.html          ← Página principal
├── README.md           ← Este archivo
│
├── css/
│   └── styles.css      ← Todos los estilos
│
├── js/
│   ├── data.js         ← Datos de las células
│   ├── location.js     ← Geolocalización y Haversine
│   ├── map.js          ← Leaflet.js interactivo
│   └── app.js          ← Lógica principal de la app
│
└── assets/
    └── (imágenes opcionales)
```

---

## 🔧 Tecnologías utilizadas

- **HTML5** — Estructura semántica
- **CSS3** — Estilos modernos con variables CSS y animaciones
- **JavaScript Vanilla** — Sin frameworks, código limpio y modular
- **Leaflet.js** — Mapas interactivos
- **OpenStreetMap** — Proveedor de mapas gratuito
- **Font Awesome** — Iconos vectoriales
- **Google Fonts (Poppins)** — Tipografía moderna

---

## ⚠️ Notas importantes

- **No se inventaron coordenadas**: las células sin coordenadas muestran un mapa centrado en La Paz y permiten buscar la dirección en Google Maps.
- **Geocodificación**: existe una función `geocodificarDireccion()` para obtener coordenadas automáticamente, pero no es obligatoria.
- **WhatsApp**: los números deben ser de Bolivia (código +591 se agrega automáticamente).
- **GitHub Pages**: el sitio funciona completamente con rutas relativas, no requiere configuración adicional.

---

## 📄 Licencia

Este proyecto es de uso libre para la comunidad. Puedes modificarlo y adaptarlo según tus necesidades.

---

**Hecho con ❤️ para la comunidad**
