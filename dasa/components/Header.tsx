"use client";

import { useState } from "react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import WhatsAppButton from "./WhatsAppButton";
import { navLinks } from "./nav";
import { whatsappMessages } from "@/lib/whatsapp";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="on-dark absolute inset-x-0 top-0 z-30">
      <div className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center px-gutter lg:h-[90px]">
        <div>
          <Logo className="text-base lg:text-[18px]" />
        </div>

        <nav aria-label="Principal" className="hidden items-center gap-10 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] tracking-[0.02em] text-ink opacity-90 transition-opacity hover:opacity-100"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-2">
          <WhatsAppButton variant="outline" message={whatsappMessages.general}>
            Agendar
          </WhatsAppButton>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <svg width="22" height="10" viewBox="0 0 22 10" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <path d="M0 1h22M0 9h22" />
            </svg>
          </button>
        </div>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
