import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { z } from 'zod';

const rootEnvPath = path.resolve(__dirname, "../../../.env");
const fallbackEnvPath = path.resolve(__dirname, "../../../.env.example");

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: fs.existsSync(rootEnvPath) ? rootEnvPath : fallbackEnvPath,
  });
}

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DB_USER: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_PORT: z.coerce.number().optional().default(5432),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
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
