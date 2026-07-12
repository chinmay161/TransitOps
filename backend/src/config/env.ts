import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  port: Number.parseInt(process.env.PORT || "5000", 10),
  dbUser: process.env.DB_USER,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: Number.parseInt(process.env.DB_PORT || "5439", 10),
};
