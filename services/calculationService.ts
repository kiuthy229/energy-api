import { rawRowSchema, NormalizedRow, RowResult } from '../models/schemas';
import { env } from '../config/env';
import { inclusiveDays, round2 } from '../utils/dateUtils';

export function normalizeAndValidateRow(raw: any): NormalizedRow {
  const parsed = rawRowSchema.parse(raw);
  const r: NormalizedRow = {
    accountId: parsed.accountId,
    meterId: parsed.meterId,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    electricity_kwh: parsed.electricity_kwh != null && parsed.electricity_kwh !== '' ? Number(parsed.electricity_kwh) : undefined,
    gas_mj: parsed.gas_mj != null && parsed.gas_mj !== '' ? Number(parsed.gas_mj) : undefined,
  };
  if ((r.electricity_kwh == null || Number.isNaN(r.electricity_kwh)) && (r.gas_mj == null || Number.isNaN(r.gas_mj))) {
    throw new Error(`Row for accountId=${r.accountId} must contain electricity_kwh or gas_mj`);
  }
  const s = new Date(r.startDate);
  const e = new Date(r.endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) throw new Error(`Invalid dates for accountId=${r.accountId}`);
  return r;
}

export function calculateRow(row: NormalizedRow): RowResult {
  const days = inclusiveDays(row.startDate, row.endDate);
  let electricity_cost = 0;
  let gas_cost = 0;
  if (row.electricity_kwh != null) {
    electricity_cost = (row.electricity_kwh * env.ELECTRICITY_RATE) + (env.ELECTRICITY_DAILY_CHARGE * days);
  }
  if (row.gas_mj != null) {
    gas_cost = (row.gas_mj * env.GAS_RATE) + (env.GAS_DAILY_CHARGE * days);
  }
  const total = round2(electricity_cost + gas_cost);
  return {
    accountId: row.accountId,
    meterId: row.meterId,
    startDate: row.startDate,
    endDate: row.endDate,
    days,
    electricity_kwh: row.electricity_kwh,
    electricity_cost: round2(electricity_cost),
    gas_mj: row.gas_mj,
    gas_cost: round2(gas_cost),
    total_cost: total,
  };
}
