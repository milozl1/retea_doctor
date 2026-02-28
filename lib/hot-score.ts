export function calculateHotScore(score: number, createdAt: Date): number {
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds =
    (createdAt.getTime() - new Date("2026-01-01").getTime()) / 1000;
  return Math.round((sign * order + seconds / 45000) * 10000000);
}

export function hotScore(
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds =
    (createdAt.getTime() - new Date("2026-01-01").getTime()) / 1000;
  return Number((sign * order + seconds / 45000).toFixed(7));
}
