export function inclusiveDays(startIso: string, endIso: string): number {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const startUTC = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const endUTC = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((endUTC - startUTC) / msPerDay) + 1;
  if (diffDays < 0) throw new Error('endDate is before startDate');
  return diffDays;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
