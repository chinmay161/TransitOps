import { VerificationResult } from "./types";

export interface DigiLockerService {
  verifyLicense(driverId: string, licenseNumber: string): Promise<VerificationResult>;
  getVerificationRecord(driverId: string): Promise<VerificationResult | null>;
  isDriverVerified(driverId: string): Promise<boolean>;
}
