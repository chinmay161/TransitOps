"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { User } from "@phosphor-icons/react";

type MockRole = "manager" | "unverified_driver" | "verified_driver";

const MOCK_ROLE_KEY = "transitops_mock_role";
const MOCK_DRIVER_NAME_KEY = "transitops_mock_driver_name";

function getStoredMockRole(): MockRole {
  if (typeof window === "undefined") return "manager";
  return (localStorage.getItem(MOCK_ROLE_KEY) as MockRole) || "manager";
}

function getStoredMockDriverName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(MOCK_DRIVER_NAME_KEY) || "";
}

export function DemoSwitcher() {
  const { user, authenticated } = useAuth();
  const [mockRole, setMockRoleState] = useState<MockRole>(getStoredMockRole);
  const [mockDriverName] = useState(getStoredMockDriverName);

  useEffect(() => {
    localStorage.setItem(MOCK_ROLE_KEY, mockRole);
  }, [mockRole]);

  if (authenticated && user) {
    return (
      <div className="flex items-center gap-2 bg-[#0D1526] border border-white/5 rounded-lg p-1 px-2.5 text-xs">
        <span className="text-[#6B7FA3] font-bold uppercase tracking-wider text-[10px]">Session:</span>
        <span className="text-[#F0F4FF] font-semibold capitalize">{user.role}</span>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#6B7FA3]">
          <User size={12} /> {user.full_name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-[#0D1526] border border-white/5 rounded-lg p-1 px-2.5 text-xs">
      <span className="text-[#6B7FA3] font-bold uppercase tracking-wider text-[10px]">Mock Mode:</span>
      <select
        value={mockRole}
        onChange={(e) => setMockRoleState(e.target.value as MockRole)}
        className="bg-[#070D1A] text-[#F0F4FF] border border-white/10 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-[#F5A623] cursor-pointer"
      >
        <option value="manager">Fleet Manager / Admin</option>
        <option value="unverified_driver">Driver (Pending Verification)</option>
        <option value="verified_driver">Driver (Verified)</option>
      </select>

      {mockDriverName && (
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#6B7FA3]">
          • Active: <strong className="text-[#F0F4FF]">{mockDriverName}</strong>
        </span>
      )}
    </div>
  );
}
