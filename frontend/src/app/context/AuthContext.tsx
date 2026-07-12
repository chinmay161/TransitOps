"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "manager" | "unverified_driver" | "verified_driver";

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  mockDriverId: string | null;
  setMockDriverId: (id: string | null) => void;
  mockDriverName: string;
  mockLicenseNumber: string;
  loading: boolean;
  refreshDrivers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("manager");
  const [mockDriverId, setMockDriverId] = useState<string | null>(null);
  const [mockDriverName, setMockDriverName] = useState<string>("Rahul Sharma");
  const [mockLicenseNumber, setMockLicenseNumber] = useState<string>("MH14DL2024012345");
  const [loading, setLoading] = useState(true);

  // Sync role with localStorage for persistence during test refreshes
  useEffect(() => {
    const savedRole = typeof window !== "undefined" ? localStorage.getItem("transitops_role") as UserRole : null;
    if (savedRole) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("transitops_role", newRole);
    }
  };

  const refreshDrivers = async () => {
    try {
      const res = await fetch("http://localhost:5000/drivers");
      if (res.ok) {
        const drivers = await res.json();
        if (drivers.length > 0) {
          const verified = drivers.find((d: any) => d.verification_status === "verified");
          const unverified = drivers.find((d: any) => d.verification_status !== "verified");
          
          if (role === "verified_driver" && verified) {
            setMockDriverId(verified.id);
            setMockDriverName(verified.full_name);
            setMockLicenseNumber(verified.license_number);
          } else if (role === "unverified_driver" && unverified) {
            setMockDriverId(unverified.id);
            setMockDriverName(unverified.full_name);
            setMockLicenseNumber(unverified.license_number);
          } else {
            // fallback
            const driverToUse = unverified || drivers[0];
            setMockDriverId(driverToUse.id);
            setMockDriverName(driverToUse.full_name);
            setMockLicenseNumber(driverToUse.license_number);
          }
        } else {
          // If no drivers exist, default placeholders
          setMockDriverId(null);
        }
      }
    } catch (e) {
      console.error("Failed to load drivers for mock session:", e);
    } finally {
      setLoading(false);
    }
  };

  // Keep mock driver sync'd when role changes
  useEffect(() => {
    refreshDrivers();
  }, [role]);

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        mockDriverId,
        setMockDriverId,
        mockDriverName,
        mockLicenseNumber,
        loading,
        refreshDrivers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
