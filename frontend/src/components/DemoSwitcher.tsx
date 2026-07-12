"use client";

import { useAuth, UserRole } from "../app/context/AuthContext";
import { User, IdentificationCard, ShieldCheck } from "@phosphor-icons/react";

export function DemoSwitcher() {
  const { role, setRole, mockDriverId, mockDriverName } = useAuth();

  return (
    <div className="flex items-center gap-2 bg-[#0D1526] border border-white/5 rounded-lg p-1 px-2.5 text-xs">
      <span className="text-[#6B7FA3] font-bold uppercase tracking-wider text-[10px]">Session Mode:</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className="bg-[#070D1A] text-[#F0F4FF] border border-white/10 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-[#F5A623] cursor-pointer"
      >
        <option value="manager">Fleet Manager / Admin</option>
        <option value="unverified_driver">Driver (Pending Verification)</option>
        <option value="verified_driver">Driver (Verified)</option>
      </select>

      {mockDriverId && (
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#6B7FA3]">
          • Active: <strong className="text-[#F0F4FF]">{mockDriverName}</strong>
        </span>
      )}
    </div>
  );
}
