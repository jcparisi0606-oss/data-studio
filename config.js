/* =====================================================================
   CONFIG — La única fuente de verdad de tu plataforma.
   Editá SOLO este archivo para adaptar todo: tu marca, servicios,
   precios, links y textos. Todo lo demás se actualiza solo.
   ===================================================================== */

window.STUDIO_CONFIG = {

  // ---------- Tu marca y datos ----------
  brand: 'JC Data Studio',
  tagline: 'Finanzas claras para tu negocio',
  owner: 'Juan Cruz Parisi',
  headline: 'Tu caja clara. Tu deuda, recuperada.',
  subhead: 'Analista financiero con 3+ años en cobranzas, cashflow y conciliaciones. Construyo dashboards financieros, reportes de cobranzas y automatización en Excel para PyMEs. Resultado real: -45% de deuda vencida a 30 días en un mes.',
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
      name: 'Dashboard de cashflow y cobranzas',
      short: 'Tu caja y tus cobros, claros y automáticos.',
      desc: 'Convierto tus datos en un tablero financiero: ingresos, egresos, flujo proyectado, aging de cuentas por cobrar y KPIs que se actualizan solos.',
      tiers: [65, 130, 220],
      tierNames: ['Simple', 'Completo', 'Premium'],
      tierDesc: ['Tablero de caja básico', 'Cashflow + proyección + KPIs', 'Modelo completo + escenarios + aging'],
      tool: 'dashboard',
      unit: null,
    },
    {
      id: 'cleaning',
      icon: '🧹',
      name: 'Conciliaciones y limpieza de datos',
      short: 'Cuentas conciliadas y datos prolijos.',
      desc: 'Concilio cuentas bancarias y de clientes, y dejo tus exports (Excel, CSV, ERP) limpios, estandarizados y listos para reportar.',
      tiers: [40, 90, 170],
      tierNames: ['Básico', 'Estándar', 'Completo'],
      tierDesc: ['1 cuenta o hasta 1.000 filas', 'Conciliación + reestructura (5.000 filas)', 'Múltiple + export ERP + validación'],
      tool: 'cleaner',
      unit: 'filas',
    },
    {
      id: 'automation',
      icon: '⚙️',
      name: 'Automatización y reportes en Excel',
      short: 'Reportes financieros que se hacen solos.',
      desc: 'Fórmulas, validaciones y macros para que cargues los datos una vez y el reporte financiero se arme solo.',
      tiers: [70, 140, 250],
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
