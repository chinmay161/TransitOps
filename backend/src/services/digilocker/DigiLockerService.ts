import { VerificationResult } from "./types";

export interface DigiLockerService {
  verifyLicense(driverId: string, licenseNumber: string): Promise<VerificationResult>;
  getVerificationRecord(driverId: string): VerificationResult | null;
  isDriverVerified(driverId: string): boolean;
}
