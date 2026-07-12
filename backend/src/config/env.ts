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
};
