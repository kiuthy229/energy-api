import { env } from "../config/env";
import { round2 } from "./round2";

export function calcFixedElectricity(row: any, days: number) {
  let cost = 0;
  if (row.electricity_kwh != null) {
    cost = row.electricity_kwh * env.ELECTRICITY_RATE + env.ELECTRICITY_DAILY_CHARGE * days;
  }
  return round2(cost);
}