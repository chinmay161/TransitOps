<<<<<<< HEAD
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
=======
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DB_USER: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_PORT: z.coerce.number().optional().default(5432),
  JWT_SECRET_KEY: z.string().min(32, 'JWT_SECRET_KEY must be at least 32 characters'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL must be a valid email'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error();
  process.exit(1);
}

export const env = parsed.data;
>>>>>>> 1d760bc (chore: resolve merge conflicts and finalize vehicle module)
