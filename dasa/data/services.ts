import type { WhatsAppMessageKey } from "@/lib/whatsapp";

export type Service = {
  number: string;
  title: string;
  items: string[];
  message: WhatsAppMessageKey;
  icon: "droplet" | "figure" | "hand";
  /** Descripción de la foto real que va aquí (4:5). */
  photo: string;
};

export const services: Service[] = [
  {
    number: "01",
    title: "Tratamientos Faciales",
    items: ["Limpieza facial profunda", "Hidratación", "Peeling"],
    message: "facial",
    icon: "droplet",
    photo: "Clienta en tratamiento facial con luz suave",
  },
  {
    number: "02",
    title: "Tratamientos Corporales",
    items: ["Reductores", "Moldeadores", "Drenaje linfático"],
    message: "corporal",
    icon: "figure",
    photo: "Manos de la terapeuta en un tratamiento corporal",
  },
  {
    number: "03",
    title: "Masajes de Relajación",
    items: ["Masaje relajante", "Piedras calientes", "Aromaterapia"],
    message: "masaje",
    icon: "hand",
    photo: "Masaje con toallas y piedras calientes",
  },
];
