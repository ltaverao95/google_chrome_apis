# Chrome APIs Web (Base Inicial)

Proyecto inicial creado con **React + TypeScript + Vite + React Router**. Incluye una paleta de colores vívida, fuentes modernas (Poppins y Fira Code) y estilos modulares (CSS Modules) separados por componente, además de estilos globales y variables de tema.

## 🚀 Características

- Vite para arranque y recarga ultrarrápidos.
- React Router 6 con layout compartido.
- TypeScript con configuración estricta.
- Paleta de colores personalizable mediante `src/styles/theme.css`.
- Estilos globales en `src/styles/global.css`.
- CSS Modules por componente/página.
- Diseño responsive y listo para ampliar.

## 📂 Estructura principal

```
src/
  main.tsx              # Punto de entrada
  App.tsx               # Definición de rutas
  components/
    Layout/             # Layout principal con Navbar
    Navbar/
  pages/
    Home/
    About/
    NotFound/
  styles/
    global.css          # Estilos globales
    theme.css           # Variables de tema y colores
```

## 🧪 Requisitos previos

- Node.js 18+ (recomendado LTS)

Verifica tu versión:

```cmd
node -v
```

## 📦 Instalación

En la raíz del proyecto (este directorio):

```cmd
npm install
```

## 🛠️ Desarrollo

```cmd
npm run dev
```

Luego abre en tu navegador la URL que aparece (normalmente):

```
http://localhost:5173
```

## 🏗️ Build de producción

```cmd
npm run build
```

Previsualizar el resultado generado en `dist/`:

```cmd
npm run preview
```

## 🎨 Personalización de tema

Edita colores y fuentes en `src/styles/theme.css`. Ejemplo de variables clave:

```css
:root {
  --color-accent: #FF006E;
  --color-emphasis: #F9C80E;
  --color-secondary: #8338EC;
  --color-info: #3A86FF;
}
```

## ➕ Añadir nuevas páginas

1. Crea carpeta dentro de `src/pages/Nueva/` con `Nueva.tsx` y `Nueva.module.css`.
2. Importa y añade la ruta en `App.tsx`:
   ```tsx
   <Route path="nueva" element={<Nueva />} />
   ```

## 🧹 Linting (opcional)

```cmd
npm run lint
```

## 📜 Licencia

Libre para uso interno / educativo. Añade tu propia licencia si lo distribuyes.

---
¿Necesitas que agregue más páginas o integración con APIs? Abre un issue o pide la ampliación.
