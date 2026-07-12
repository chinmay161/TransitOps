import { Pool } from "pg";
import { DigiLockerService } from "./DigiLockerService";
import { VerificationResult } from "./types";

export class MockDigiLockerService implements DigiLockerService {
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
          verification_status = 'verified',
          verification_source = $4,
          verification_date = $5,
          verification_id = $6,
          updated_at = NOW()
        WHERE id = $7
      `;
      await client.query(updateQuery, [
        verifiedResult.licenseNumber,
        verifiedResult.expiryDate,
        verifiedResult.licenseType,
        verifiedResult.source,
        verifiedResult.verifiedAt,
        verifiedResult.verificationId,
        driverId
      ]);
      
      await client.query("COMMIT");
    } catch (e: any) {
      await client.query("ROLLBACK");
      console.error("Failed to update database driver with verified details:", e);
      throw e;
    } finally {
      client.release();
    }

    return verifiedResult;
  }

  public async getVerificationRecord(driverId: string): Promise<VerificationResult | null> {
    const query = `
      SELECT verification_status, verification_source, verification_date, verification_id, license_number, license_type, TO_CHAR(license_expiry, 'YYYY-MM-DD') as license_expiry, u.full_name
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `;
    const res = await this.pool.query(query, [driverId]);
    if (res.rows.length === 0 || res.rows[0].verification_status !== 'verified') {
      return null;
    }
    const row = res.rows[0];
    return {
      verified: true,
      verificationId: row.verification_id,
      holderName: row.full_name,
      licenseNumber: row.license_number,
      licenseType: row.license_type,
      issueDate: "2022-03-14",
      expiryDate: row.license_expiry,
      issuingAuthority: "Maharashtra RTO",
      verifiedAt: row.verification_date ? new Date(row.verification_date).toISOString() : new Date().toISOString(),
      source: row.verification_source || "DigiLocker"
    };
  }

  public async isDriverVerified(driverId: string): Promise<boolean> {
    const query = "SELECT verification_status FROM drivers WHERE id = $1";
    const res = await this.pool.query(query, [driverId]);
    return res.rows.length > 0 && res.rows[0].verification_status === 'verified';
  }
}
