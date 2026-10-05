// SEO 模块的类型约定。代码（seo-tags.ts、各页面、组件）全站一致，
// 可见文案（问答、标签介绍、页面标题等）由各站自己的 faq-data.ts / site-copy.ts /
// provider-faq.ts 提供，每个站必须写自己的文字，不能与其他站雷同。

export interface FaqItem {
  cluster: string;
  q: string;
  a: string;
  tags: string[];
}

export interface FaqCluster {
  id: string;
  title: string;
  intro: string;
}

export interface TagCopy {
  /** 标签名，会出现在标题和面包屑里，必须包含该标签的核心关键词 */
  name: string;
  /** 标签导航页卡片上的一句话（40 字以内） */
  blurb: string;
  /** 标签页开头的介绍段（60-120 字） */
  intro: string;
  /** 标签页第二段：这个站对该关键词的独有角度（80-160 字） */
  angle: string;
  /** 可选：覆盖该标签"更多入口"里链接的文字，数组顺序与结构里 links 顺序一致 */
  linkLabels?: string[];
}

export interface SeoCopy {
  articleFaqHeading: string;
  providerFaqHeading: (name: string) => string;
  faqLinkLabel: string;
  tagLinkLabel: string;
  faqPage: {
    title: (count: number) => string;
    description: (count: number, clusterCount: number) => string;
    keywords: string[];
    breadcrumb: string;
    h1: string;
    intro: (count: number, clusterCount: number) => string;
    navLabel: string;
    moreHeading: string;
    moreLinks: { tag: string; airports: string; rankings: string; knowledge: string; troubleshooting: string };
  };
  tagIndex: {
    title: string;
    description: string;
    keywords: string[];
    breadcrumb: string;
    h1: string;
    intro: string;
    outro: string;
    cardCta: (articleCount: number, faqCount: number) => string;
  };
  tagPage: {
    title: (name: string) => string;
    description: (name: string, intro: string) => string;
    h1: (name: string) => string;
    articlesHeading: (name: string) => string;
    faqHeading: (name: string) => string;
    providerHeading: (name: string) => string;
    providerIntro: (name: string) => string;
    moreHeading: string;
    otherHeading: string;
  };
}
