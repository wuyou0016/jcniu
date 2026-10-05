// 中文阅读时长估算：按每分钟约 450 字，至少 1 分钟。
export function estimateReadingTimeMinutes(body: string): number {
  const chars = body.replace(/\s+/g, '').length;
  return Math.max(1, Math.round(chars / 450));
}
