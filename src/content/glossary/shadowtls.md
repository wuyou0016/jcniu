---
term: "ShadowTLS"
definition: "ShadowTLS 是借用真实网站的 TLS 握手做伪装的传输方式，握手完成后在同一连接上承载代理数据。"
extendedExplanation: "ShadowTLS 不是独立的代理协议，而是一层传输伪装：客户端先通过服务端与某个真实站点完成一次真实的 TLS 握手，握手过后再在同一连接里转发代理数据，常与 Shadowsocks 等协议套用。它有多个版本，支持面比 VLESS、Trojan 窄，需要客户端内核明确支持，具体以官方说明为准。"
aliases: ["Shadow-TLS", "ShadowTLS v3"]
relatedTerms: ["shadowsocks", "trojan-protocol", "anytls", "vless"]
relatedArticles: ["vless-trojan-hysteria2-bijiao", "jiedian-dingyue-xieyi-guanxi", "mihomo-fenliu-guize"]
updatedAt: 2026-10-05
---

ShadowTLS 最容易被误解的一点是：**它不是一种“协议”，而是一层“外衣”。** 里面穿的通常还是别的协议，ShadowTLS 负责让外面看起来像一次正常的 TLS 访问。

## ShadowTLS 是传输层，不是协议

可以把节点配置想成“里外两层”：

| 层 | 作用 | 常见例子 |
|---|---|---|
| 里层 | 真正承载代理数据 | [Shadowsocks](/glossary/shadowsocks/) 等 |
| 外层 | 让流量外形像普通 TLS 访问 | ShadowTLS |

所以订阅里的 ShadowTLS 节点，通常是“Shadowsocks + ShadowTLS”这类组合。

## 借用握手，大致是这样走的

下面是简化后的示意，具体细节随版本而异：

1. 客户端向服务端发起 TLS 连接，并带上一个“伪装域名”。
2. 服务端把握手交给这个**真实站点**去完成，所以握手对外看起来是真的。
3. 握手完成后，服务端校验客户端是否是自己人。
4. 校验通过，连接切换为承载代理数据；不通过，则继续当作普通访问处理。

这里的关键在于“握手是真的”，而不是用自己的证书去模仿。

## 它与 Trojan、REALITY 的思路异同

| 方案 | 握手来自哪里 | 备注 |
|---|---|---|
| [Trojan](/glossary/trojan-protocol/) | 服务端自己的证书与域名 | 需要域名和证书 |
| ShadowTLS | 借用第三方真实站点的握手 | 里层可换，常见是 Shadowsocks |
| REALITY | 同样借用真实站点的握手 | 出自 Xray 生态，与 [VLESS](/glossary/vless/) 配合 |

三者思路相近，实现细节和支持范围不同。**“看起来像正常 TLS”不等于无法被识别**，别把它当成万能钥匙。

## 客户端与排错

- 需要客户端内核**明确支持**，较老的版本可能无法导入，或节点显示异常。
- 配置里的**伪装域名、版本、密码**要与服务端一致，任何一项对不上，都会表现为超时。
- 出现全部节点超时，先排除本地因素，见 [机场节点超时怎么办](/troubleshooting/jiedian-quanbu-chaoshi/)。

## 该不该为它挑机场

一般不需要。ShadowTLS 属于**进阶、较小众**的选项：

- 多数用户用常见的协议和主流客户端就够了。
- 如果你本来就在用支持它的内核，并且服务商在说明里明确写了这类节点，再考虑启用也不迟。
- 不要因为“有 ShadowTLS”就觉得服务商更高级，线路和运营质量更重要。

相关协议对比见 [VLESS Trojan Hysteria2区别](/knowledge/vless-trojan-hysteria2-bijiao/)，节点和订阅的基本关系见 [机场节点是什么](/knowledge/jiedian-dingyue-xieyi-guanxi/)，较新的同类选项见 [AnyTLS](/glossary/anytls/)。
