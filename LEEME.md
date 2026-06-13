# JC Data Studio — tu plataforma freelance

Plataforma web completa, sin dependencias ni backend, que sirve para **cualquier servicio** que ofrezcas.

## Qué es (triple uso)
1. **Te vende** — landing profesional con servicios, propuesta de valor y pruebas sociales.
2. **Produce** — 4 herramientas reales que también usás para entregar trabajo de cliente más rápido:
   - 📊 Dashboard financiero
   - 🧹 Limpiador de datos (CSV: duplicados, espacios, filas/columnas vacías, formato) ← úsala para los gigs de limpieza
   - 🧾 Generador de facturas (imprimible / PDF)
   - 📈 Constructor de gráficos (exporta SVG)
3. **Capta y califica leads solo** — motor de presupuesto instantáneo + generador de briefs.

## Cómo adaptarla (1 archivo)
Editá **`config.js`**. Ahí están tu marca, servicios, precios, links y textos.
Cambiás eso y se actualiza toda la plataforma. Para agregar un servicio nuevo, copiás un bloque
del array `services`. No necesitás tocar nada más.

### Pendiente: completar tus links
En `config.js`, dentro de `links`, poné tus URLs de Fiverr, Gumroad, LinkedIn, GitHub.
Y tu `whatsapp` si querés botón de WhatsApp.

### Opcional pero recomendado (todo gratis, sin backend)
En `config.js`:
- **`integrations.formEndpoint`** — creá un formulario gratis en [formspree.io](https://formspree.io),
  copiá el endpoint (ej: `https://formspree.io/f/xxxx`) y pegalo acá. Aparece un botón "Enviarme el brief"
  y los briefs te llegan al mail solos, sin que el cliente tenga que escribirte.
- **`integrations.analytics`** — pegá el `<script>` de [Plausible](https://plausible.io),
  [GoatCounter](https://goatcounter.com) (gratis) o Google Analytics para ver cuánta gente entra. Se inyecta solo.
- **`seo.url`** — después de publicar, poné tu URL final de GitHub Pages acá. Mejora la tarjeta al compartir.

### Tarjeta al compartir (Open Graph)
Ya viene lista: cuando pegues el link en WhatsApp, LinkedIn, etc., muestra una tarjeta con título, descripción
e imagen (`og-image.svg`). Nota: algunas redes prefieren imagen PNG/JPG — si querés, después generamos una versión raster.

### Menú mobile
La barra superior se adapta a celular con un menú ☰. La mayoría del tráfico de redes es mobile.

## Probarla localmente
```
node negocio/studio/serve.js
```
Abrí http://localhost:8780

## Publicarla GRATIS (GitHub Pages)
1. Creá cuenta en github.com → repo nuevo (ej: `data-studio`).
2. Subí los archivos de esta carpeta (`index.html`, `styles.css`, `config.js`, `tools.js`, `app.js`).
3. Settings → Pages → Source: rama `main`, carpeta `/root` → Save.
4. En 1-2 min queda online en `https://TUUSUARIO.github.io/data-studio/`.

Ese link es el que ponés en Fiverr, en tu bio, donde sea. Es tu portfolio vivo.

> Decime cuándo tengas la cuenta de GitHub y te guío comando por comando (o lo subo yo).

## Archivos
- `index.html` — shell
- `styles.css` — diseño
- `config.js` — **tu configuración (editá esto)**
- `tools.js` — las 4 herramientas
- `app.js` — router, landing, presupuesto, briefs
- `serve.js` — servidor local de prueba
