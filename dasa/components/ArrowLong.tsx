/** Flecha larga y fina (línea ~16px + punta, trazo 1px). */
export default function ArrowLong({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={`transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1 ${className}`}
    >
      <path d="M0 5h17M13 1l4 4-4 4" />
    </svg>
  );
}
