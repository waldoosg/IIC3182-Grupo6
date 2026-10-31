# Bitácora

Prototipo web para registrar entrenamiento de fuerza, cambiar un ejercicio solo en la sesión actual y revisar el historial según gimnasio e implemento. No tiene cuenta ni servidor: los datos viven en `localStorage` del navegador.

## Requisitos

- Node.js 22 o superior (probado con Node 25.9.0 y npm 11.12.1)
- Un navegador moderno

## Ejecutar en local

```bash
npm install
npm run dev
```

La aplicación queda en [http://127.0.0.1:5173](http://127.0.0.1:5173). No pide inicio de sesión.

Comprobar el build de producción:

```bash
npm run build
npm run preview
```

## Pruebas

Hace falta Chromium de Playwright (una sola vez):

```bash
npx playwright install chromium
npm run test:e2e
```

La configuración está en `playwright.config.ts`. Levanta la app en el puerto 4173 y corre `e2e/flujos.spec.ts` en dos proyectos: escritorio (Chrome) y móvil (Pixel 5).

Resultado de `npx playwright test --workers=2` el 31 de octubre de 2026: **12 passed** (6 casos × 2 viewports).

Los casos cubren:

- guardar una serie, corregirla y verla después de recargar
- el gimnasio activo ordena su historial y deja los otros gimnasios aparte
- un cambio de ejercicio no modifica la rutina original
- una nota queda en el historial
- el gráfico separa el peso registrado de la carga estimada
- una relación mecánica ingresada por el usuario distingue ambos valores

## Datos de demostración

Al abrir la app por primera vez, o si el JSON guardado no es válido, se carga la semilla de `src/domain/seed.ts`. El botón **Restablecer datos** vuelve a esa semilla.

La clave de almacenamiento es `bitacora-entreno-v1`.

La semilla incluye dos gimnasios ficticios (Gimnasio Norte y Sala Sur), rutinas de tren superior y tren inferior, sesiones anteriores con pesos y repeticiones distintos, notas de contexto y máquinas ficticias. Para el remo sentado: Atlas R-2 (kg, relación mecánica 1) en Gimnasio Norte y Pila LM-4 (lb, relación mecánica 0,5) en Sala Sur. Esas relaciones son idealizadas. No describen una marca comercial.

La sugerencia de “Hoy” es la rutina del foco contrario a la última sesión terminada. Ambas se pueden empezar. No hay calendario semanal.

## Cálculo de carga

Implementado en `src/domain/load.ts` y visible en la pantalla de progreso.

1. El peso registrado se conserva en la unidad en que se anotó (kg o lb).
2. La conversión a kilos es `lb × 0,45359237`. Un peso en kg no se convierte.
3. Si el modelo tiene una relación mecánica guardada y mayor que 0, la carga estimada es `kilos × relación`.
4. Si no hay relación, la interfaz dice que no se puede estimar. No se inventa un valor.
5. El número de poleas se muestra como contexto. No se vuelve a multiplicar: la relación ya lo incluye.
6. La estimación no es la fuerza real de la persona.

En el gráfico, el eje Y está en kg. La línea continua es el peso registrado (solo convertido de unidad) y la punteada es la estimación. Los puntos sin estimación no se unen con una línea inventada.

El paso de peso es 2,5 kg o 5 lb. El paso de repeticiones es 1.

## Qué hace cada pantalla

- **Inicio.** Elige el gimnasio activo, muestra las dos rutinas y empieza una sesión. Solo puede haber una sesión en curso. El gimnasio de esa sesión queda fijo al empezarla.
- **Sesión.** Confirma series con el último peso y las últimas repeticiones de ese ejercicio, en ese gimnasio y con ese implemento. Se puede corregir o quitar una serie. Cambiar el ejercicio vale solo para esa sesión y, si se deja activo, agrega la nota “Máquina ocupada”. La rutina original no cambia.
- **Historial.** El gimnasio activo va primero. Los otros gimnasios quedan en otra sección, con su nombre y en un tono más apagado.
- **Progreso.** Un gráfico por ejercicio. La pestaña de grupo muscular muestra cada ejercicio por separado y no suma cargas.

Un implemento se guarda con tipo, marca, modelo, unidad y, si se conoce, relación mecánica. El historial de peso y repeticiones corresponde a ese implemento.

## Publicar

El despliegue no está hecho. Los archivos de configuración sí.

**Vercel.** Importar el repositorio. El framework es Vite. El comando de build es `npm run build` y el directorio de salida es `dist`. `vercel.json` reescribe todas las rutas a `index.html` para que al recargar `/historial` o `/progreso` no aparezca un 404.

**Netlify.** `netlify.toml` ya define `npm run build`, publica `dist` y redirige `/*` a `/index.html` con estado 200.

## Qué queda fuera

- Constructor de rutinas. Las dos rutinas son plantillas fijas.
- Cuentas, backend y sincronización entre dispositivos.
- Calendario semanal.
- Un puntaje que sume ejercicios distintos.
- Fichas técnicas de marcas reales.
- Publicación en un URL público. Solo están las instrucciones y los archivos de configuración.
