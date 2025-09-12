import { z } from 'zod';

export const rawRowSchema = z.object({
  accountId: z.string(),
  meterId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  electricity_kwh: z.union([z.string(), z.number()]).optional().nullable(),
  gas_mj: z.union([z.string(), z.number()]).optional().nullable(),
});

export type NormalizedRow = {
  accountId: string;
  meterId?: string;
  startDate: string;
  endDate: string;
  electricity_kwh?: number;
  gas_mj?: number;
};

export type RowResult = {
  accountId: string;
  meterId?: string;
  startDate: string;
  endDate: string;
  days: number;
  electricity_kwh?: number;
  electricity_cost?: number;
  gas_mj?: number;
  gas_cost?: number;
  total_cost: number;
};
