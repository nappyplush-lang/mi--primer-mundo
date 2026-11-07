export const site = {
  name: "Dasa",
  city: "[CIUDAD]",
  /** Formato internacional sin "+": 57 + 10 dígitos. TODO: reemplazar. */
  whatsappNumber: "57XXXXXXXXXX",
  /** Formato visible: +57 3XX XXX XXXX */
  phoneDisplay: "+57 3XX XXX XXXX",
  address: "[DIRECCIÓN], [CIUDAD], Colombia",
  hours: ["Lunes a viernes · [HORARIO]", "Sábados · [HORARIO]"],
  instagram: { handle: "@dasa", url: "https://instagram.com/" },
} as const;

export const flags = {
  /** Botón flotante de WhatsApp (no está en la referencia). */
  SHOW_FLOATING_WHATSAPP: false,
  /** H1 detrás del edificio (requiere public/images/hero-fg.png real). */
  HERO_DEPTH_EFFECT: true,
  /** Punto decorativo (inferido de la referencia). */
  SHOW_DECORATIVE_DOT: true,
  /** Secciones inferiores (fuera de la captura). */
  SHOW_EXTRA_SECTIONS: true,
} as const;

/** Prefijo de ruta para GitHub Pages (vacío en local). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
