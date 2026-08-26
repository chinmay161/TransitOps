export function AuthHeader() {
  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--amber)] border-2 border-[#0B0F1A] shadow-[3px_3px_0px_rgba(0,0,0,0.5)]"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="8" width="11" height="7" rx="1.5" fill="#0B0F1A" fillOpacity="0.8" />
          <path d="M12 10h3.5l2.5 3v2H12V10z" fill="#0B0F1A" fillOpacity="0.7" />
          <circle cx="5" cy="15.5" r="1.5" fill="#0B0F1A" fillOpacity="0.5" />
          <circle cx="14.5" cy="15.5" r="1.5" fill="#0B0F1A" fillOpacity="0.5" />
        </svg>
      </div>
      <span
        className="text-xl font-black tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        TransitOps
      </span>
    </div>
  );
}
