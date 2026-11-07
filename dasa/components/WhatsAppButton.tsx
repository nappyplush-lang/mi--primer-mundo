import ArrowLong from "./ArrowLong";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type Props = {
  variant: "outline" | "link";
  message: string;
  children: React.ReactNode;
  className?: string;
};

export default function WhatsAppButton({ variant, message, children, className = "" }: Props) {
  const href = buildWhatsAppLink(message);

  if (variant === "outline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex h-11 items-center gap-[10px] border border-btn px-5 text-sm text-ink transition-[border-color,color,opacity] duration-[400ms] ease-in-out hover:border-btn-hover hover:text-btn-hover active:opacity-80 sm:h-[45px] ${className}`}
      >
        {children}
        <ArrowLong />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex h-12 items-center justify-center gap-[10px] border border-btn px-6 text-xs uppercase tracking-[0.16em] text-ink transition-[border-color,color,opacity] duration-[400ms] hover:border-btn-hover hover:text-btn-hover active:opacity-80 sm:h-auto sm:flex-col sm:items-start sm:gap-2 sm:border-0 sm:px-0 ${className}`}
    >
      <span className="inline-flex items-center gap-[10px] text-[12px] sm:text-[13px]">
        {children}
        <ArrowLong />
      </span>
      <span
        aria-hidden="true"
        className="hidden h-px w-[215px] bg-hairline transition-colors duration-[400ms] group-hover:bg-line-hover sm:block"
      />
    </a>
  );
}
