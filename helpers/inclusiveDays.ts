export function inclusiveDays(startIso: string, endIso: string): number {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((e.getTime() - s.getTime()) / msPerDay) + 1;
}