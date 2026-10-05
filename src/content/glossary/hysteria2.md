---
term: "Hysteria2"
definition: "Hysteria2 是基于 QUIC/UDP 的代理协议，面向高延迟、易丢包的网络环境设计，需要客户端明确支持。"
extendedExplanation: "Hysteria2 是 Hysteria 的第二代，运行在 QUIC 之上，对外形态接近 HTTP/3，使用 UDP 传输，并采用针对丢包链路设计的拥塞控制思路，与第一代互不兼容。它更适合线路抖动、丢包偏多的网络，但部分网络环境会对 UDP 限速或限制，实际表现因网络而异，具体以官方说明为准。"
aliases: ["Hysteria 2", "Hy2", "hysteria2协议"]
relatedTerms: ["vless", "trojan-protocol", "anytls", "proxy-node"]
relatedArticles: ["vless-trojan-hysteria2-bijiao", "jiedian-dingyue-xieyi-guanxi", "wanggaofeng-bian-man"]
updatedAt: 2026-10-05
---

Hysteria2 和多数常见协议有一个根本区别：**它走 UDP。** 理解了这一点，就能理解它为什么在某些网络里表现亮眼，又为什么在另一些网络里让人头疼。

## Hysteria2 想解决什么问题

传统代理多跑在 TCP 之上，丢包较多时，TCP 的拥塞控制会不断减小发送速度，体感就是“越丢包越卡”。Hysteria2 的思路是：

- 基于 **QUIC**，用 UDP 承载，连接建立更灵活。
- 拥塞控制更倾向于按预设的带宽发送，而不是一遇丢包就退让，所以**带宽参数需要如实设置**。
- 外形接近 HTTP/3 流量，常见搭配端口跳跃等配置，具体取决于服务端设置。

这些是设计思路，不是效果承诺。实际表现要看你的网络和线路。

## UDP 这件事，要先弄清

| 场景 | 影响 |
|---|---|
| 家用宽带 | 通常能用，表现因运营商而异 |
| 公司或校园网络 | 可能限制或限速 UDP，导致连不上或很慢 |
| 部分移动网络 | 同样可能对 UDP 有策略 |
| 线路本身丢包较多 | 设计上正是它想发挥的场景 |

一旦发现 Hysteria2 节点能 Ping 通却没法正常用，**先怀疑 UDP 是否被限制**，再去怀疑节点。

## 与基于 TCP 的协议并排看

| 对比 | Hysteria2 | [VLESS](/glossary/vless/)、[Trojan](/glossary/trojan-protocol/) |
|---|---|---|
| 传输层 | UDP（QUIC） | 通常是 TCP，也可搭配其他传输 |
| 弱网表现 | 设计上更针对丢包链路 | 取决于线路与搭配 |
| 受 UDP 限制影响 | 大 | 小 |
| 与旧版本兼容 | 与第一代不兼容 | 不涉及 |

## 订阅里出现 Hysteria2，怎么办

1. 确认你的客户端和内核**明确支持 Hysteria2**，较旧的版本可能不认。
2. 确认订阅格式包含该节点，见 [订阅链接](/glossary/subscription-link/)。
3. 先拿同一机房的其他协议节点做对照，区分是节点问题还是网络问题。
4. 晚高峰变慢时，别急着换协议，先看 [机场很慢怎么办](/troubleshooting/wanggaofeng-bian-man/)。

## 3 个误会

- **“Hysteria2 一定更快。”** 它只是在丢包场景更有针对性，条件不对时反而更差。
- **“带宽参数填越大越好。”** 填得比真实带宽高，可能导致拥塞与丢包加重，应按实际情况设置。
- **“Hysteria2 能顶替所有协议。”** 受 UDP 限制影响，它更像一个可选项，而不是万能方案。

协议对比放在 [VLESS Trojan Hysteria2区别](/knowledge/vless-trojan-hysteria2-bijiao/)，节点与订阅的关系见 [机场节点是什么](/knowledge/jiedian-dingyue-xieyi-guanxi/)。
