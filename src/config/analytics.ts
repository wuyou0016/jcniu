// 统一统计配置。全部是"配置项开关"——留空就什么都不加载，不会产生半成品脚本。
// 之后只需要把真实 ID/token 填进来，不用再改代码。
export const analyticsConfig = {
  siteId: 'jcniu.com',
  ga4MeasurementId: '',
  cloudflareBeaconToken: '',
  zztoolsSiteId: '',
  clarityProjectId: '',
} as const;
