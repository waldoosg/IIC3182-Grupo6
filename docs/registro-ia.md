# Registro técnico de la intervención de IA

Registro factual del prototipo Bitácora. No reemplaza el anexo académico ni la reflexión del grupo.

Fecha de la implementación: 31 de octubre de 2026.

## Qué se construyó

Aplicación de una sola página en React, TypeScript y Vite. Persistencia en `localStorage` con la clave `bitacora-entreno-v1`. Sin cuenta y sin servidor.

## Archivos de aplicación

- `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `components.json`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/lib/utils.ts`
- `src/domain/types.ts`, `constants.ts`, `format.ts`, `load.ts`, `queries.ts`, `seed.ts`
- `src/storage/store.ts`
- `src/pages/home-page.tsx`, `session-page.tsx`, `history-page.tsx`, `progress-page.tsx`
- `src/components/app-shell.tsx`, `exercise-logger.tsx`, `history-list.tsx`, `progress-panel.tsx`, `note-dialog.tsx`, `note-fields.tsx`, `equipment-sheet.tsx`, `exercise-select.tsx`, `load-breakdown.tsx`, `missing.tsx`
- `src/components/ui/`: componentes de shadcn (button, card, badge, dialog, alert-dialog, sheet, select, input, textarea, separator, sonner, alert, empty, tabs, toggle, toggle-group, field, chart, label, scroll-area)
- `e2e/flujos.spec.ts`, `playwright.config.ts`
- `vercel.json`, `netlify.toml`
- `README.md`, `docs/registro-ia.md`

`src/assets/hero.png`, `react.svg` y `vite.svg` quedaron del template de Vite y la interfaz no los usa.

Ajustes sobre componentes generados por shadcn: botones e interruptores grandes para uso táctil, textos de cierre en “Cerrar”, y el toaster fijado en tema claro para no depender de `next-themes`.

## Dependencias agregadas

Producción: `react`, `react-dom`, `react-router-dom`, `recharts`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`, `class-variance-authority`, `cn`, `radix-ui`, `shadcn`, `tw-animate-css`, `@fontsource-variable/geist`, `sonner`, `next-themes`.

Desarrollo: `vite`, `typescript`, `@vitejs/plugin-react`, `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `@playwright/test`.

`next-themes` lo instala el componente sonner de shadcn. El toaster no lo usa.

## Decisiones de implementación que afectan el cálculo

- 1 lb = 0,45359237 kg.
- Carga estimada = kilos × relación mecánica, solo si esa relación está guardada y es mayor que 0.
- El número de poleas no se multiplica otra vez.
- Las máquinas y las relaciones de la semilla son ficticias.
- La pestaña muscular no suma ejercicios.

## Pruebas ejecutadas

- `npm run build` (`tsc -b && vite build`) termina sin errores. Vite advierte que el bundle de JavaScript supera 500 kB.
- `npx playwright test --workers=2`: 12 pruebas aprobadas, 0 fallidas. Seis casos en escritorio y los mismos en Pixel 5.

Durante el desarrollo, tres casos fallaron por el localizador (el selector de gimnasio es un radio, no un botón), por un texto duplicado en el cambio de ejercicio y porque el diálogo de nota no se cerraba al guardar. Se corrigió el cierre del diálogo y los localizadores, y la suite completa volvió a pasar.

## Límites conocidos

- No hay constructor de rutinas, cuentas, backend, calendario ni publicación hecha.
- La estimación no representa la fuerza real.
- No hay especificaciones de marcas comerciales.
- Los datos de un navegador no se comparten con otro.
- `next-themes` queda instalado y sin uso.
