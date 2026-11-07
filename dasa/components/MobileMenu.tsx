"use client";

import { useEffect } from "react";
import Logo from "./Logo";
import WhatsAppButton from "./WhatsAppButton";
import { navLinks } from "./nav";
import { whatsappMessages } from "@/lib/whatsapp";

type Props = { open: boolean; onClose: () => void };

export default function MobileMenu({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className="fixed inset-0 z-50 on-light flex flex-col bg-surface px-gutter text-ink"
    >
      <div className="flex h-[72px] items-center justify-between">
        <Logo className="text-base" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex h-11 w-11 items-center justify-center"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" stroke="currentColor" strokeWidth="1" aria-hidden="true">
            <path d="M3 3l16 16M19 3L3 19" />
          </svg>
        </button>
      </div>
      <nav aria-label="Principal" className="mt-16 flex flex-col">
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="border-b border-hairline py-5 font-serif text-4xl text-ink"
          >
            {l.label}
          </a>
        ))}
      </nav>
      <div className="mt-10">
        <WhatsAppButton variant="outline" message={whatsappMessages.general}>
          Agendar
        </WhatsAppButton>
      </div>
    </div>
  );
}
