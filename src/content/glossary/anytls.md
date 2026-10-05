---
term: "AnyTLS"
definition: "AnyTLS 是近年出现的 TLS 类代理协议，设计上试图削弱“TLS 套 TLS”的流量特征，需要较新的内核才支持。"
extendedExplanation: "AnyTLS 属于较新的 TLS 类代理协议，按项目介绍，设计目标之一是通过可配置的填充策略和连接复用，缓解代理流量中“TLS 套 TLS”带来的握手特征。由于出现时间较晚，通常只有较新版本的 sing-box、Mihomo 等内核及其客户端才支持，旧客户端导入后可能看不到该节点，具体以官方说明为准。"
aliases: ["AnyTLS协议", "Any-TLS"]
relatedTerms: ["trojan-protocol", "shadowtls", "vless", "hysteria2"]
relatedArticles: ["vless-trojan-hysteria2-bijiao", "jiedian-dingyue-xieyi-guanxi", "clash-jichang-tuijian"]
updatedAt: 2026-10-05
---

AnyTLS 在协议名单里属于“新面孔”：**出现得晚，思路是在 TLS 这条路上继续打磨，兼容性要靠客户端版本去赌。** 订阅里看到它时，第一反应应该是“我的客户端认不认”，而不是“它是不是更强”。

## AnyTLS 是什么，为什么说它较新

它和 [Trojan](/glossary/trojan-protocol/) 同属 TLS 类协议：流量运行在 TLS 之内，外形接近普通的加密网页访问。区别在于它加入了新的设计，按项目介绍，主要是：

- **填充策略**：可以在数据包里增加填充，改变包长分布。
- **连接复用**：多个访问复用同一条底层连接，减少频繁握手。

这些说法来自项目设计目标，**效果因网络环境而异，不是承诺**。

## “TLS 套 TLS”是什么问题

当你通过代理访问一个 HTTPS 网站时，会发生两层加密：

1. 外层是你和代理服务器之间的 TLS。
2. 里层是你和目标网站之间的 TLS。

两层握手叠在一起，会留下一些有规律的特征，这就是常说的“TLS 套 TLS”。AnyTLS 的设计思路之一，就是用填充等手段让这种规律变得不那么明显。至于在具体网络里管不管用，没有统一答案。

## 在 TLS 类方案里它站在哪

| 方案 | 思路 | 与其他的关系 |
|---|---|---|
| [Trojan](/glossary/trojan-protocol/) | 跑在标准 TLS 之上，用密码认证 | 成熟、客户端支持广 |
| [ShadowTLS](/glossary/shadowtls/) | 借用真实站点握手，再承载其他协议 | 是传输层，不是独立协议 |
| AnyTLS | 在 TLS 之上加入填充与复用 | 较新，要求内核较新 |

## 订阅里出现 AnyTLS 节点，先做这 4 步

1. **看客户端版本**：到客户端官方仓库的发布说明里确认是否支持，旧版本通常不认。
2. **看订阅格式**：不同格式能不能携带这类节点，因服务商和转换方式而异，见 [订阅链接](/glossary/subscription-link/)。
3. **导入后核对节点列表**：节点没显示，多半是客户端不识别，不是节点坏了。
4. **对照其他协议节点**：同一机房换成别的协议能用，说明问题在协议支持，而不是线路。

## 对新协议保持理性

- **“新的就一定更好。”** 新协议没有经过同样长时间的广泛使用，兼容性和细节更不稳定。
- **“有 AnyTLS 说明服务商更专业。”** 协议只是配置项，线路与运营才是主体，见 [落地节点](/glossary/exit-node/) 与 [中转线路](/glossary/relay-route/)。
- **“我的客户端不支持，就必须升级。”** 先看别的协议节点能不能满足需求，再决定要不要换客户端。

协议之间的比较见 [VLESS Trojan Hysteria2区别](/knowledge/vless-trojan-hysteria2-bijiao/)；怎么挑适配 Clash 内核的服务商，看 [Clash机场推荐](/guides/clash-jichang-tuijian/)。
