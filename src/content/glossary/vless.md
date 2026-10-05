---
term: "VLESS"
definition: "VLESS 是出自 V2Ray/Xray 生态的轻量代理协议，协议本身很精简，传输安全通常交给 TLS 等外层方案负责。"
extendedExplanation: "VLESS 用 UUID 标识用户，协议头简单、不保存连接状态，所以常被称为轻量、无状态。它本身偏精简，加密和伪装一般交给外层的 TLS 或 REALITY 等方案，常见搭配 WebSocket、gRPC 等传输方式。能否使用取决于客户端和内核是否支持，主流的 Xray、sing-box、Mihomo 系客户端一般都支持，以官方说明为准。"
aliases: ["VLESS协议", "V2Ray VLESS", "Xray VLESS"]
relatedTerms: ["trojan-protocol", "hysteria2", "shadowtls", "anytls", "proxy-node"]
relatedArticles: ["vless-trojan-hysteria2-bijiao", "jiedian-dingyue-xieyi-guanxi", "v2rayn-jichang-tuijian"]
updatedAt: 2026-10-05
---

VLESS 的关键词是“轻”：**它把协议本身做得很薄，把安全和伪装的活交给外面一层去干。** 理解了这一点，订阅里那串长长的 VLESS 参数就不再神秘。

## VLESS 轻在哪里

- **标识简单**：用一串 UUID 区分用户，不需要复杂的握手字段。
- **无状态**：协议层不保存连接状态，实现起来开销小。
- **分工明确**：自身偏精简，安全性主要看外层，比如 TLS。

这种设计的代价是：**单看 VLESS 三个字母，你无法判断一条节点安不安全、稳不稳，要看它外面套了什么。**

## 它通常和谁搭配

订阅里的 VLESS 节点，参数里常见这些“搭档”：

| 搭档 | 作用 | 备注 |
|---|---|---|
| TLS | 提供加密和标准握手 | 常需要域名与证书 |
| REALITY | 借用真实站点的握手做伪装 | 出自 Xray 生态，需内核较新 |
| WebSocket、gRPC 等传输 | 决定数据怎么被封装和承载 | 服务端与客户端必须一致 |
| 流控（如 Vision） | 针对 TLS 流量的优化选项 | 需要双方都支持 |

参数越多，**客户端与服务端必须逐项对上**，任何一项不一致，表现都是“节点超时”，排查思路见 [机场节点超时怎么办](/troubleshooting/jiedian-quanbu-chaoshi/)。

## 选机场时，VLESS 要看什么

1. **你的客户端和内核版本是否支持**：Windows 的 [v2rayN](/clients/v2rayn/)、跨平台的 [Sing-box](/clients/sing-box/)、Mihomo 系客户端一般都能用，旧版本可能缺少个别搭配。
2. **订阅格式是否对应你的客户端**：格式不匹配时，VLESS 节点可能被丢掉，见 [订阅链接](/glossary/subscription-link/)。
3. **别只看协议名**：线路与落地对体验的影响，常常大于协议之间的差异，见 [VLESS Trojan Hysteria2区别](/knowledge/vless-trojan-hysteria2-bijiao/)。

## 关于 VLESS 的 3 个误会

- **“VLESS 更快。”** 协议本身并不决定速度，线路、带宽和拥塞才是大头。
- **“VLESS 不加密，所以不安全。”** 要看外层有没有 TLS 等保护，笼统一句话不成立。
- **“订阅里有 VLESS，我的客户端就一定能连。”** 客户端不认某项参数时，节点会失效或根本不显示。

VLESS 与 [Trojan](/glossary/trojan-protocol/)、[Hysteria2](/glossary/hysteria2/) 的取舍，以及它们各自的客户端支持情况，放在协议对比文章里讲。想按客户端挑服务商，可以先看 [机场推荐排行榜](/rankings/)。
