import { buildWhatsAppLink, whatsappMessages } from "@/lib/whatsapp";

export default function FloatingWhatsApp() {
  return (
    <a
      href={buildWhatsAppLink(whatsappMessages.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center border border-hairline bg-[rgba(10,14,25,0.7)] text-ink backdrop-blur"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6L3 21z" />
        <path d="M9 8.5c.2 2.6 3.4 5.8 6 6l1.2-1.2-1.8-1-.9.7c-.8-.3-1.9-1.4-2.2-2.2l.7-.9-1-1.8L9 8.5z" stroke="#25D366" />
      </svg>
    </a>
  );
}
