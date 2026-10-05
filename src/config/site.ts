// 全站基础配置。只放品牌/域名/语言等站点级事实，
// 不放具体文章 SEO、Provider 数据、榜单数据——那些属于内容/数据层。

export const siteConfig = {
  siteName: '机场牛',
  brandName: '机场牛',
  brandNameShort: '机场牛',
  brandNameEn: 'JichangNiu',
  url: 'https://jcniu.com',
  locale: 'zh-CN',
  language: 'zh-CN',

  // 定位：综合型机场推荐站。核心是一张"夯 → 顶级 → 人上人 → NPC → 拉"的分档榜（另设“拉完了”名单），
  // 按资料透明度给 28 家机场分层；围绕这张榜铺开专项榜单（便宜/专线/稳定/月付）、
  // 客户端与平台教程、机场对比、优惠码、跑路预警、免费 vs 付费、在线工具和术语库，
  // 把"机场推荐、便宜机场、专线机场、梯子工具、Clash 机场、跑路预警"这些搜索意图
  // 各分配一个主战页面（见 docs/keyword-registry.md）。
  description:
    '机场牛：2026 机场推荐排行榜，把机场和梯子按资料透明度从夯排到拉，便宜机场、专线机场、稳定机场一页看完。整理 IPLC/IEPL 线路、VLESS/Trojan/Hysteria2 协议与 Clash、小火箭、v2rayN 客户端资料，汇总优惠码、跑路预警和避坑指南，晚高峰与流媒体、ChatGPT 可用性只写查得到来源的内容。',

  defaultTitle: '机场牛｜2026 机场推荐排行榜，机场梯子从夯到拉一次看完',
  defaultDescription:
    '机场牛：2026 机场推荐排行榜，把机场和梯子按资料透明度从夯排到拉，便宜机场、专线机场、稳定机场一页看完。整理 IPLC/IEPL 线路、VLESS/Trojan/Hysteria2 协议与 Clash、小火箭、v2rayN 客户端资料，汇总优惠码、跑路预警和避坑指南，晚高峰与流媒体、ChatGPT 可用性只写查得到来源的内容。',

  defaultOgImage: '/images/og/default.png',

  author: {
    name: '机场牛编辑部',
  },
} as const;
