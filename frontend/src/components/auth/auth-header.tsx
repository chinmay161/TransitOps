import { TransitOpsLogo } from "@/components/brand/TransitOpsLogo";

export function AuthHeader() {
  return (
    <div className="mb-10 flex flex-col items-center gap-2">
      <TransitOpsLogo size={32} />
      <span
        className="text-lg font-black tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        TransitOps
      </span>
    </div>
  );
}
