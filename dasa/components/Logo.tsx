import { site } from "@/config/site";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <a
      href="#inicio"
      aria-label={`${site.name} — inicio`}
      className={`font-serif uppercase tracking-[0.18em] text-ink ${className}`}
    >
      {site.name}
    </a>
  );
}
