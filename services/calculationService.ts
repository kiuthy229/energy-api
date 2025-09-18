import { NormalizedRow, rawRowSchema, RowResult } from '../models/schemas';
import { env } from '../config/env';
import { inclusiveDays, round2 } from '../helpers';

export function normalizeAndValidateRow(raw: any): NormalizedRow {
  if (raw.type === 'fixed') {
    if (
      (raw.electricity_kwh == null || Number.isNaN(raw.electricity_kwh)) &&
      (raw.gas_mj == null || Number.isNaN(raw.gas_mj))
    ) {
      throw new Error(
        `Row for accountId=${raw.accountId} must contain electricity_kwh or gas_mj`
      );
    }
  }

  // Validate against Zod schema (already typed properly if JSON)
  const parsed = rawRowSchema.parse(raw);
  return parsed; // Already normalized
}

export function calculateRow(row: any): RowResult {
  const days = inclusiveDays(row.startDate, row.endDate);

  let electricity_cost = 0;
  if (row.type === 'fixed' && row.electricity_kwh != null) {
    electricity_cost =
      row.electricity_kwh * env.ELECTRICITY_RATE +
      env.ELECTRICITY_DAILY_CHARGE * days;
  } else if (row.type === 'interval' && row.interval_data) {
    for (const entry of row.interval_data) {
      const rate =
        entry.tariff === 'peak'
          ? env.ELECTRICITY_RATE_PEAK
          : entry.tariff === 'shoulder'
          ? env.ELECTRICITY_RATE_SHOULDER
          : env.ELECTRICITY_RATE_OFFPEAK;
      electricity_cost += entry.kWh * rate;
    }
    electricity_cost += env.ELECTRICITY_DAILY_CHARGE * days;
  }

  let gas_cost = 0;
  if (row.gas_mj != null) {
    gas_cost = row.gas_mj * env.GAS_RATE + env.GAS_DAILY_CHARGE * days;
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
