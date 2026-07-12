export function AuthHeader() {
  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, var(--amber) 0%, var(--amber-dark) 100%)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="8" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
          <path d="M12 10h3.5l2.5 3v2H12V10z" fill="white" fillOpacity="0.85" />
          <circle cx="5" cy="15.5" r="1.5" fill="var(--amber-dark)" />
          <circle cx="14.5" cy="15.5" r="1.5" fill="var(--amber-dark)" />
        </svg>
      </div>
      <span
        className="text-xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        TransitOps
      </span>
    </div>
  );
}
