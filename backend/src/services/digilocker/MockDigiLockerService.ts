import { Pool } from "pg";
import { DigiLockerService } from "./DigiLockerService";
import { VerificationResult, VerificationRecord } from "./types";

export class MockDigiLockerService implements DigiLockerService {
  private verificationStore = new Map<string, VerificationRecord>();
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async verifyLicense(driverId: string, licenseNumber: string): Promise<VerificationResult> {
    // 20% failure simulation
    const rand = Math.random();
    if (rand < 0.2) {
      const failures = [
        "License Not Found",
        "Invalid License Number",
        "Authentication Failed with DigiLocker",
        "Network Timeout"
      ];
      const selectedFailure = failures[Math.floor(Math.random() * failures.length)];
      throw new Error(selectedFailure);
    }

    // Get the driver record from DB to verify they exist and match their full name
    const query = `
      SELECT d.id, u.full_name 
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `;
    const res = await this.pool.query(query, [driverId]);
    if (res.rows.length === 0) {
      throw new Error("Driver profile not found in database.");
    }
    const driverName = res.rows[0].full_name;

    // Generate verified license output
    const verifiedResult: VerificationResult = {
      verified: true,
      verificationId: `DLV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      holderName: driverName,
      licenseNumber: licenseNumber.toUpperCase().trim(),
      licenseType: "LMV",
      issueDate: "2022-03-14",
      expiryDate: "2042-03-13",
      issuingAuthority: "Maharashtra RTO",
      verifiedAt: new Date().toISOString(),
      source: "DigiLocker"
    };

    // Store in-memory status
    this.verificationStore.set(driverId, {
      ...verifiedResult,
      driverId
    });

    // Update driver profile in database to match verified details
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      
      const updateQuery = `
        UPDATE drivers 
        SET 
          license_number = $1,
          license_expiry = $2,
          license_type = $3,
          updated_at = NOW()
        WHERE id = $4
      `;
      await client.query(updateQuery, [
        verifiedResult.licenseNumber,
        verifiedResult.expiryDate,
        verifiedResult.licenseType,
        driverId
      ]);
      
      await client.query("COMMIT");
    } catch (e: any) {
      await client.query("ROLLBACK");
      console.error("Failed to update database driver with verified details:", e);
    } finally {
      client.release();
    }

    return verifiedResult;
  }

  public getVerificationRecord(driverId: string): VerificationResult | null {
    const record = this.verificationStore.get(driverId);
    return record || null;
  }

  public isDriverVerified(driverId: string): boolean {
    const record = this.verificationStore.get(driverId);
    return !!(record && record.verified);
  }
}
