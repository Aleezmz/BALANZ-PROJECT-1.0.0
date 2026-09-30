# Balanz Family Finances

https://github.com/Aleezmz/pixel-perfect-view-3102.git

Actúa como un Desarrollador Full-Stack experto especializado en React, Vite, TypeScript y Tailwind CSS.

Acabamos de adoptar este repositorio generado por Lovable (pixel-perfect-view-3102) como la base definitiva para la aplicación de finanzas familiares "Balanz". El diseño visual está impecable, pero necesitamos conectar la interactividad de los botones, los filtros de meses, la gestión de pestañas (Dashboard, Categorías, Integrantes y Movimientos) y el formulario de carga de gastos con una capa de estado funcional en el cliente (usando estados locales o un archivo de contexto temporal en TypeScript) antes de integrarlo con Supabase.

Por favor, haz lo siguiente:

1. Analiza la estructura de carpetas actual (components, hooks, lib, routes).

2. Asegúrate de que los botones de navegación entre pestañas, el selector de meses y los modales de agregar gastos respondan correctamente a las interacciones del usuario en tiempo real.

3. Configura un store o estado mock robusto (en la carpeta lib o hooks) para que al agregar un gasto (por ejemplo, de 250.000 Gs) este se refleje al instante en la tabla de Movimientos, en las tarjetas de los integrantes (Hogar, Abuela, Claudia, etc.) y en los totales del Dashboard sin recargar la página.

4. Verifica que el archivo package.json tenga todas las dependencias necesarias y que el proyecto compile y corra sin errores ejecutando los scripts de desarrollo.

Revisa el código y déjalo listo y completamente interactivo.

Actúa como un Desarrollador Full-Stack experto. Ya tenemos el frontend interactivo de Lovable funcionando de forma local. Ahora necesitamos conectar la persistencia con Supabase y dejar el proyecto listo para producción en Vercel.

Por favor, haz lo siguiente:

1. Configuración de Supabase:
   - Instala el cliente oficial de Supabase (`@supabase/supabase-js`).
   - Crea un archivo de configuración de cliente en `src/lib/supabase.ts` que lea las variables de entorno de Vite (`import.meta.env.VITE_SUPABASE_URL` y `import.meta.env.VITE_SUPABASE_ANON_KEY`).
   - Reemplaza los datos simulados (mock data) actuales del Dashboard, Movimientos y Categorías por consultas reales (fetch/insert) a tus tablas de Supabase (por ejemplo, para obtener transacciones, filtrarlas por mes e insertar nuevos registros).

2. Variables de Entorno:
   - Crea un archivo `.env.example` en la raíz del proyecto indicando las variables requeridas (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`) para que el entorno esté documentado.

3. Preparación para Vercel:
   - Asegúrate de que el archivo `package.json` tenga el script de compilación correcto para Vite (`"build": "tsc && vite build"`).
   - Verifica que no existan errores de TypeScript (`npx tsc --noEmit`) y que el proyecto compile de forma limpia para asegurar que el despliegue en Vercel no falle.

Revisa los archivos, implementa la conexión con Supabase y déjalo todo listo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5550d4dc-fd8a-43f5-81d9-57502ac17fdc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
