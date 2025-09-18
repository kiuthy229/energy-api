import { env } from "../config/env";
import { round2 } from "./round2";

export function calcIntervalElectricity(row: any, days: number) {
  if (!row.interval_data) return 0;
  let usageCost = 0;
  for (const entry of row.interval_data) {
    const rate =
      entry.tariff === 'peak'
        ? env.ELECTRICITY_RATE_PEAK
        : entry.tariff === 'shoulder'
        ? env.ELECTRICITY_RATE_SHOULDER
        : env.ELECTRICITY_RATE_OFFPEAK;
    usageCost += entry.kWh * rate;
  }
  return round2(usageCost + env.ELECTRICITY_DAILY_CHARGE * days);
}