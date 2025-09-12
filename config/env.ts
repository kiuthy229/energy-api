import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess((v) => v ? Number(v) : 3000, z.number().int().positive()),
  ELECTRICITY_RATE: z.preprocess((v) => v ? Number(v) : 0.3, z.number().nonnegative()),
  GAS_RATE: z.preprocess((v) => v ? Number(v) : 0.03, z.number().nonnegative()),
  ELECTRICITY_DAILY_CHARGE: z.preprocess((v) => v ? Number(v) : 0.5, z.number().nonnegative()),
  GAS_DAILY_CHARGE: z.preprocess((v) => v ? Number(v) : 0.2, z.number().nonnegative()),
});

export const env = envSchema.parse(process.env);
