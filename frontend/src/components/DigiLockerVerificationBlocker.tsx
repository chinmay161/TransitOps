"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Warning,
  Spinner,
  ArrowRight,
  Sparkle,
  Fingerprint,
  CheckCircle,
  X
} from "@phosphor-icons/react";

interface VerificationData {
  verified: boolean;
  verificationId: string;
  holderName: string;
  licenseNumber: string;
  licenseType: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  verifiedAt: string;
  source: string;
}

export function DigiLockerVerificationBlocker() {
  const { user, refresh } = useAuth();
  const [driverName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("transitops_mock_driver_name") || user?.full_name || "";
    }
    return user?.full_name || "";
  });
  const [driverLicenseNumber] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("transitops_mock_license") || "MH14DL2024012345";
    }
    return "MH14DL2024012345";
  });
  const [driverId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("transitops_mock_driver_id") || user?.driver_id || null;
    }
    return user?.driver_id || null;
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<"idle" | "connecting" | "authenticating" | "retrieving" | "verifying" | "success" | "failure">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [verifiedData, setVerifiedData] = useState<VerificationData | null>(null);

  if (!user || user.role !== "driver") {
    return null;
  }

  const startVerification = async () => {
    if (!driverId) {
      alert("No driver profile found in the database. Please switch to Fleet Manager and add a driver first!");
      return;
    }
    
    setModalOpen(true);
    setErrorMsg("");
    setVerifiedData(null);
    
    setStep("connecting");
    await new Promise((r) => setTimeout(r, 600));
    
    setStep("authenticating");
    await new Promise((r) => setTimeout(r, 600));
    
    setStep("retrieving");
    await new Promise((r) => setTimeout(r, 600));
    
    setStep("verifying");
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await fetch("http://localhost:5000/api/verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driverId,
          license_number: driverLicenseNumber
        })
      });
      
      const resData = await res.json();
      
      if (!res.ok) {
        throw new Error(resData.error || "Verification failed");
      }
      
      setVerifiedData(resData.data);
      setStep("success");
      await refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during DigiLocker retrieval.");
      setStep("failure");
    }
  };

  const handleContinue = () => {
    setModalOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("transitops_mock_role", "verified_driver");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070D1A] dot-grid">
      
      {/* Background radial gradient overlay for premium look */}
      <div className="absolute inset-0 bg-radial-at-c from-[#0D1E3D]/50 via-transparent to-transparent pointer-events-none" />

      {/* Main onboarding lock card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-base max-w-lg w-full bg-[#0D1526] p-8 text-center border-white/5 shadow-2xl relative z-10 space-y-6"
      >
        {/* Government Style Shield Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#D4891A] flex items-center justify-center mx-auto shadow-lg text-white">
          <Fingerprint size={32} weight="duotone" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-black text-[#F0F4FF] tracking-tight">
            Welcome to TransitOps
          </h1>
          <p className="text-xs md:text-sm text-[#6B7FA3] max-w-sm mx-auto leading-relaxed">
            To ensure compliance and secure active trip assignments, every driver must verify their driving license through DigiLocker before dashboard access.
          </p>
        </div>

        {/* Demo Mode Details Badge */}
        <div className="bg-[#111E35] border border-white/5 rounded-lg p-4 max-w-md mx-auto flex items-center justify-between text-left text-xs">
          <div>
            <div className="text-[10px] text-[#F5A623] font-bold uppercase tracking-wider">Demo Mode Session</div>
            <div className="text-[#F0F4FF] font-semibold mt-0.5">{driverName}</div>
            <div className="text-[#6B7FA3] font-mono text-[10px] mt-0.5">License: {driverLicenseNumber}</div>
          </div>
          <span className="px-2.5 py-1 text-[9px] font-extrabold text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 rounded uppercase">
            Verification Required
          </span>
        </div>

        <div className="pt-2">
          <button
            onClick={startVerification}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-[#F5A623]/10 hover:shadow-[#F5A623]/20 transition-all"
          >
            <span>Verify with DigiLocker</span>
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>

        <div className="text-[10px] font-semibold text-[#3A4F73] flex items-center justify-center gap-1.5">
          <span>Secure Gov Verification</span>
          <span>•</span>
          <span className="text-[#F5A623]">Mock DigiLocker Integration</span>
        </div>
      </motion.div>

      {/* DIALOG STEP-BY-STEP MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="card-base w-full max-w-md bg-[#0D1526] p-6 z-10 shadow-2xl relative border-white/5"
            >
              
              {/* Spinner/Retrieval Header */}
              {step !== "success" && step !== "failure" && (
                <div className="text-center py-8 space-y-4">
                  <div className="relative w-12 h-12 mx-auto">
                    <Spinner size={48} className="text-[#F5A623] animate-spin" />
                  </div>
                  
                  <div className="space-y-1">
                    {step === "connecting" && (
                      <h3 className="font-extrabold text-sm text-[#F0F4FF] tracking-wide uppercase">Connecting...</h3>
                    )}
                    {step === "authenticating" && (
                      <h3 className="font-extrabold text-sm text-[#F0F4FF] tracking-wide uppercase">Authenticating...</h3>
                    )}
                    {step === "retrieving" && (
                      <h3 className="font-extrabold text-sm text-[#F0F4FF] tracking-wide uppercase">Retrieving License...</h3>
                    )}
                    {step === "verifying" && (
                      <h3 className="font-extrabold text-sm text-[#F0F4FF] tracking-wide uppercase">Verifying...</h3>
                    )}
                    <p className="text-[11px] text-[#6B7FA3]">DigiLocker Government Gateway Integration</p>
                  </div>
                  
                  {/* Mock progress steps */}
                  <div className="max-w-xs mx-auto flex items-center justify-between text-[10px] text-[#6B7FA3] font-bold pt-4">
                    <span className={step !== "connecting" ? "text-[#10B981]" : "text-[#F5A623] animate-pulse"}>Auth</span>
                    <span className="w-6 h-px bg-white/10" />
                    <span className={step === "retrieving" || step === "verifying" ? "text-[#F5A623] animate-pulse" : step === "connecting" || step === "authenticating" ? "opacity-30" : "text-[#10B981]"}>Fetch</span>
                    <span className="w-6 h-px bg-white/10" />
                    <span className={step === "verifying" ? "text-[#F5A623] animate-pulse" : "opacity-30"}>Match</span>
                  </div>
                </div>
              )}

              {/* Success Result Summary */}
              {step === "success" && verifiedData && (
                <div className="space-y-5 text-left text-xs md:text-sm">
                  
                  <div className="text-center pb-3 border-b border-white/5 space-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto text-[#10B981]">
                      <CheckCircle size={22} weight="bold" />
                    </div>
                    <h3 className="font-extrabold text-[#10B981] text-base">✓ License Verified</h3>
                    <p className="text-[10px] text-[#6B7FA3]">Government records matched successfully.</p>
                  </div>

                  <div className="bg-[#111E35]/40 border border-white/5 rounded-lg p-3.5 space-y-2.5">
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7FA3]">Driver Name</span>
                      <strong className="text-[#F0F4FF]">{verifiedData.holderName}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7FA3]">License Number</span>
                      <strong className="text-[#F0F4FF] font-mono">{verifiedData.licenseNumber}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7FA3]">License Type</span>
                      <strong className="text-[#F0F4FF]">{verifiedData.licenseType}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7FA3]">Issuing Authority</span>
                      <strong className="text-[#F0F4FF]">{verifiedData.issuingAuthority}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7FA3]">Issue Date</span>
                      <strong className="text-[#F0F4FF] font-mono">{verifiedData.issueDate}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7FA3]">Expiry Date</span>
                      <strong className="text-[#F0F4FF] font-mono">{verifiedData.expiryDate}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2.5">
                      <span className="text-[#6B7FA3]">Verification ID</span>
                      <strong className="text-[#F5A623] font-mono text-[11px]">{verifiedData.verificationId}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6B7FA3]">Verified At</span>
                      <strong className="text-[#6B7FA3] font-mono text-[10px]">
                        {new Date(verifiedData.verifiedAt).toLocaleString()}
                      </strong>
                    </div>

                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5 text-xs md:text-sm font-bold shadow-lg"
                  >
                    <span>Continue to Dashboard</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>

                </div>
              )}

              {/* Failure Result Layout */}
              {step === "failure" && (
                <div className="text-center py-4 space-y-5">
                  <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mx-auto text-[#ef4444]">
                    <Warning size={26} weight="bold" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-[#F0F4FF] uppercase tracking-wide">Verification Failed</h3>
                    <p className="text-xs text-[#ef4444] font-semibold mt-1">"{errorMsg}"</p>
                    <p className="text-[11px] text-[#6B7FA3] max-w-xs mx-auto mt-2 leading-relaxed">
                      We were unable to verify your license details with DigiLocker. Please confirm your license number or retry.
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="btn-ghost flex-1 justify-center"
                    >
                      Close
                    </button>
                    <button
                      onClick={startVerification}
                      className="bg-[#F5A623] hover:bg-[#D4891A] text-white py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-colors flex-1"
                    >
                      Retry Verification
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
