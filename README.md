# 📱 Armario Inteligente & Stylist IA — iPhone Liquid Glass Edition

Aplicación web progresiva diseñada bajo el lenguaje de diseño **iOS Liquid Glass** (Apple iOS 18 / VisionOS aesthetic) que gestiona tu guardarropa semanal, genera combinaciones automáticas con inteligencia artificial y pronóstico del clima, planifica un calendario visual de atuendos y lleva el control riguroso de higiene y cesto de lavado.

---

## ✨ Características Principales

### 1. 🪞 Interfaz iPhone Liquid Glass
- **Chasis iPhone 16 Pro Interactivo**: Visualización fidedigna con bisel de titanio, barra de estado (5G, Wi-Fi, batería) y Dynamic Island reactiva.
- **Modo Expandido / Escritorio**: Alternador con un solo clic entre vista iPhone y vista de pantalla completa.
- **Dock Flotante iOS con Liquid Glass**: Barra de navegación inferior traslúcida con desenfoque (`backdrop-filter: blur(24px) saturate(180%)`), reflejos especulares de luz y botón central de acción rápida.
- **Dynamic Island Funcional**: Muestra en tiempo real alertas de lavado, conteo de prendas limpias e indicador de estilista IA.

### 2. 👔 Gestión Integral de Prendas
- **Inventario Completo**: Registro por categorías (poleras, camisas, pantalones, chaquetas, abrigos, zapatos, accesorios).
- **Control de Estados**: Clasificación en *Limpia en Armario*, *En Uso* y *En el Cesto de Lavado*.
- **Metadatos Detallados**: Color con selector visual hex, telas (algodón, lino, lana, mezclilla...), temporadas climáticas afines y estilos predilectos.

### 3. 🪄 Asesor de Imagen & Combinador IA (Gemini API)
- **Combinaciones Contextuales**: Diseñado para generar outfits para:
  - 🏢 Ir al trabajo (Business / Smart Casual)
  - 🎉 Eventos especiales y galas
  - ☕ Salidas casuales y fin de semana
  - 🏋️‍♂️ Deporte y actividades dinámicas
- **Adaptación Meteorológica**: Considera temperatura (°C) y condiciones del tiempo (soleado, lluvioso, frío, caluroso, ventoso).
- **Filtro Automático de Higiene**: Excluye automáticamente cualquier prenda que esté actualmente en el cesto de lavado.
- **Cascada Resiliente de Modelos**: Incorpora reintentos automáticos y fallback entre `gemini-3.8-flash`, `gemini-flash-latest`, `gemini-3.1-flash-lite`, y un motor estético local si el servicio de red está saturado.

### 4. 📅 Calendario Visual Semanal
- **Planificación de Lunes a Domingo**: Vista visual de atuendos asignados para cada día de la semana.
- **Generación Automática Semanal**: Un solo clic para planificar toda la semana con IA.
- **Registro de Uso**: Marca el conjunto cuando te lo pongas para actualizar el contador de prendas.

### 5. 🧺 Control de Usos y Alertas de Lavado
- **Contador Semanal**: Registra cuántas veces a la semana te pusiste cada polera, pantalón o prenda.
- **Límites de Higiene**: Avisa proactivamente cuando una prenda alcanza su límite de puestas recomendadas antes de necesitar lavado.
- **Acción "Hacer Colada"**: Lava todas las prendas del cesto en un solo toque, devolviéndolas limpias al armario.

---

## 🚀 Inicio Rápido (Local)

### Requisitos previos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- Clave de API de [Google AI Studio](https://aistudio.google.com/) (opcional pero recomendada para el asistente Gemini)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/mi-armario-liquid-glass.git
cd mi-armario-liquid-glass

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y añade tu GEMINI_API_KEY
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

Abre tu navegador en `http://localhost:3000`.

### Compilar para Producción

```bash
npm run build
npm start
```

---

## 🐙 Cómo Subir este Proyecto a tu GitHub

Sigue estos sencillos pasos en tu terminal para publicar tu repositorio:

```bash
# 1. Inicializar Git localmente
git init
git add .
git commit -m "feat: iPhone Liquid Glass Wardrobe & AI Stylist"

# 2. Renombrar la rama a main
git branch -M main

# 3. Crear el repositorio en GitHub (con GitHub CLI):
gh repo create mi-armario-liquid-glass --public --source=. --remote=origin --push

# O crear el repositorio manualmente en https://github.com/new y luego:
git remote add origin https://github.com/TU_USUARIO/mi-armario-liquid-glass.git
git push -u origin main
```

---

## 🌐 Opciones de Despliegue en la Nube

### Despliegue en Render / Railway / Cloud Run
1. Conecta tu repositorio de GitHub recién creado.
2. Define la variable de entorno:
   - `GEMINI_API_KEY`: tu clave de Google AI Studio.
3. Comando de compilación (`Build Command`): `npm run build`
4. Comando de inicio (`Start Command`): `npm start`

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend / Proxy**: Node.js, Express (protección de API keys en servidor).
- **Inteligencia Artificial**: `@google/genai` (Gemini Flash con cascada resiliente).
- **Persistencia**: LocalStorage en cliente para sincronización inmediata de prendas, calendario y contador de lavandería.
