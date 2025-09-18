import { env } from "../config/env";
import { round2 } from "./round2";

export function calcGas(row: any, days: number): number {
  if (row.gas_mj == null) return 0;
  return round2(row.gas_mj * env.GAS_RATE + env.GAS_DAILY_CHARGE * days);
}