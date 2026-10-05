// 开发占位数据（Provider/TestRecord/Ranking/Comparison/Article/Glossary/Review）
// 统一以 "demo-" 前缀命名（见 Content & Data Foundation v1.1），
// 这里提供一个共享判断函数，供各 Hub 页面查询 Content/Data Layer 时过滤，
// 确保占位数据永远不会出现在正式页面上。
export function isDemoEntry(id: string): boolean {
  return id.startsWith('demo-') || id.includes('/demo-');
}
