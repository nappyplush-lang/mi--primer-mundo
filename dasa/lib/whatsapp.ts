import { site } from "@/config/site";

export function buildWhatsAppLink(mensaje: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
}

export const whatsappMessages = {
  general: `Hola ${site.name}, quiero agendar una cita`,
  facial: `Hola ${site.name}, quiero agendar un tratamiento facial`,
  corporal: `Hola ${site.name}, quiero agendar un tratamiento corporal`,
  masaje: `Hola ${site.name}, quiero agendar un masaje de relajación`,
} as const;

export type WhatsAppMessageKey = keyof typeof whatsappMessages;
