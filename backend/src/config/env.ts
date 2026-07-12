import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number.parseInt(process.env.PORT || "5000", 10),
  dbUser: requireEnv("DB_USER"),
  dbHost: requireEnv("DB_HOST"),
  dbName: requireEnv("DB_NAME"),
  dbPassword: requireEnv("DB_PASSWORD"),
  dbPort: Number.parseInt(process.env.DB_PORT || "5439", 10),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "default_jwt_secret_key_at_least_32_characters_long",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "re_mockkey_placeholder_for_local_dev",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "noreply@transitops.com",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
