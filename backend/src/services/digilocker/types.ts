export interface VerificationResult {
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

export interface VerificationRecord extends VerificationResult {
  driverId: string;
}
