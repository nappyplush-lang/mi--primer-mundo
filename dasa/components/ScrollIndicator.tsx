export default function ScrollIndicator({ className = "" }: { className?: string }) {
  return (
    <a
      href="#servicios"
      aria-label="Ir a servicios"
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      <span
        className="eyebrow"
        style={{ writingMode: "vertical-rl", fontSize: "10px" }}
      >
        Scroll para explorar
      </span>
      <span aria-hidden="true" className="anim-pulse block h-10 w-px bg-hairline" />
    </a>
  );
}
