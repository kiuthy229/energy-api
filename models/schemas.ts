import { z } from 'zod';

const intervalEntrySchema = z.object({
  timestamp: z.string(),
  kWh: z.number(),
  tariff: z.enum(['peak', 'shoulder', 'offpeak']),
});

export const rawRowSchema = z.object({
  accountId: z.string(),
  meterId: z.string().optional(),
  type: z.enum(['fixed', 'interval']),
  startDate: z.string(),
  endDate: z.string(),
  electricity_kwh: z.number().optional(),
  gas_mj: z.number().optional(),
  interval_data: z.array(intervalEntrySchema).optional(),
});

export const requestSchema = z.object({
  rows: z.array(rawRowSchema),
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
