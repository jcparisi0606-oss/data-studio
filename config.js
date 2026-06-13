/* =====================================================================
   CONFIG — La única fuente de verdad de tu plataforma.
   Editá SOLO este archivo para adaptar todo: tu marca, servicios,
   precios, links y textos. Todo lo demás se actualiza solo.
   ===================================================================== */

window.STUDIO_CONFIG = {

  // ---------- Tu marca y datos ----------
  brand: 'JC Data Studio',
  tagline: 'Datos que trabajan para tu negocio',
  owner: 'Juan Cruz',
  headline: 'Convierto tus datos en decisiones.',
  subhead: 'Dashboards, automatización de Excel y limpieza de datos para PyMEs y profesionales. Trabajo con Excel, Google Sheets, SQL y sistemas contables / ERP.',
  email: 'jcparisi0606@gmail.com',
  whatsapp: '',                 // ej: '5491122334455' (sin +) — deja vacío si no querés
  currency: 'USD',
  fxNote: 'Se cobra en USD (Payoneer / MercadoPago). Equivalente en pesos al cambio del día.',

  // Links externos (completalos cuando tengas las cuentas)
  links: {
    fiverr:   '',   // tu perfil de Fiverr
    gumroad:  '',   // tu producto en Gumroad
    linkedin: '',
    github:   '',
  },

  // ---------- Servicios (esto maneja el catálogo, presupuestos y briefs) ----------
  // tiers: [básico, estándar, premium] en la moneda de arriba.
  // tool: id de la herramienta demo asociada (o null).
  services: [
    {
      id: 'dashboard',
      icon: '📊',
      name: 'Dashboard a medida',
      short: 'Tableros automáticos que se actualizan solos.',
      desc: 'Convierto tu planilla o export en un dashboard claro: KPIs, gráficos y análisis que se recalculan al cargar datos.',
      tiers: [60, 110, 180],
      tierNames: ['Simple', 'Completo', 'Premium'],
      tierDesc: ['1 dashboard, hasta 3 métricas', 'Dashboard + gráficos + hoja de carga', 'Multi-hoja + automatización + video'],
      tool: 'dashboard',
      unit: null,
    },
    {
      id: 'cleaning',
      icon: '🧹',
      name: 'Limpieza y migración de datos',
      short: 'Datos prolijos, sin duplicados ni errores.',
      desc: 'Tomo tu export desordenado (Excel, CSV, ERP) y lo dejo limpio, estandarizado y usable.',
      tiers: [40, 80, 150],
      tierNames: ['Básico', 'Estándar', 'Migración'],
      tierDesc: ['Hasta 1.000 filas', 'Hasta 5.000 filas + reestructura', 'Migración / export ERP + validación'],
      tool: 'cleaner',
      unit: 'filas',
    },
    {
      id: 'automation',
      icon: '⚙️',
      name: 'Automatización de Excel',
      short: 'Reportes que se hacen solos.',
      desc: 'Fórmulas, validaciones y macros para que cargues los datos una vez y el reporte se arme solo.',
      tiers: [80, 150, 250],
      tierNames: ['1 reporte', 'Avanzado', 'Macros / VBA'],
      tierDesc: ['Automatizo 1 reporte', 'Reporte + validaciones + menús', 'Workbook completo con macros'],
      tool: 'chart',
      unit: null,
    },
    {
      id: 'invoice',
      icon: '🧾',
      name: 'Facturación y reportes',
      short: 'Facturas y reportes profesionales.',
      desc: 'Sistemas de facturación, recibos y reportes prolijos listos para imprimir o enviar.',
      tiers: [35, 70, 120],
      tierNames: ['Plantilla', 'Sistema', 'A medida'],
      tierDesc: ['Plantilla de factura', 'Sistema con numeración', 'Solución a medida'],
      tool: 'invoice',
      unit: null,
    },
  ],

  // Multiplicadores del motor de presupuesto
  pricing: {
    rushMultiplier: 1.4,        // entrega urgente (48h)
    revisionUnit: 15,           // por revisión extra
    volumeBreaks: [             // recargo por volumen (filas) para servicios con unit:'filas'
      { upTo: 1000, mult: 1 },
      { upTo: 5000, mult: 1.5 },
      { upTo: 20000, mult: 2.2 },
      { upTo: Infinity, mult: 3 },
    ],
  },

  // Pruebas sociales (editá / agregá a medida que consigas reseñas)
  testimonials: [
    { text: 'Me ordenó 8.000 filas de export contable en una tarde. Impecable.', author: 'Cliente PyME' },
    { text: 'El dashboard me cambió la forma de ver el negocio.', author: 'Emprendedor' },
  ],

  // Propuesta de valor (la sección "por qué yo")
  valueProps: [
    { icon: '⚡', title: 'Rápido', text: 'Entregas claras, sin vueltas.' },
    { icon: '🎯', title: 'Preciso', text: 'Vengo del mundo contable/ERP: los números importan.' },
    { icon: '🔁', title: 'Automático', text: 'Te dejo sistemas que se mantienen solos.' },
  ],

  // Herramientas habilitadas en la galería (orden importa)
  tools: ['dashboard', 'cleaner', 'invoice', 'chart'],

  // ---------- Integraciones (todo opcional, sin backend) ----------
  integrations: {
    // Formspree (gratis): creá un form en formspree.io y pegá acá el endpoint
    // (ej: 'https://formspree.io/f/xxxxxx'). Los briefs te llegan al mail solos.
    // Si lo dejás vacío, el brief cae al envío por email (mailto) como respaldo.
    formEndpoint: '',
    // Analítica de visitas. Pegá el <script> de tu herramienta (Plausible, GoatCounter,
    // Umami, Google Analytics...). Se inyecta solo. Vacío = sin tracking.
    analytics: '',
  },

  // ---------- SEO / cómo se ve el link al compartir ----------
  seo: {
    // Después de publicar, poné acá tu URL final (ej: 'https://juan.github.io/data-studio/').
    // Mejora la tarjeta al compartir. Vacío = se usa la URL actual.
    url: 'https://jcparisi0606-oss.github.io/data-studio/',
    // Imagen de la tarjeta. Ya viene una generada (og-image.svg).
    image: 'og-image.svg',
  },
};
