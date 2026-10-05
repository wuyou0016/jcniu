---
term: "Trojan"
definition: "Trojan 是把代理流量伪装成 HTTPS 流量的代理协议，运行在 TLS 之上，用密码认证用户，与计算机木马无关。"
extendedExplanation: "Trojan 的设计思路是：直接跑在标准 TLS 之上，服务端对外表现得像一个普通 HTTPS 网站，认证没通过的连接可以转交给真实网页。这让它的流量看起来更接近普通网页访问，但“看起来像”不等于“无法识别”。它通常需要域名和证书，客户端支持面很广，具体以官方说明为准。"
aliases: ["Trojan协议", "trojan://"]
relatedTerms: ["vless", "shadowsocks", "shadowtls", "anytls"]
relatedArticles: ["vless-trojan-hysteria2-bijiao", "jiedian-dingyue-xieyi-guanxi", "clash-jichang-tuijian"]
updatedAt: 2026-10-05
---

先把最容易吓到新手的误会放前面：**Trojan 协议和电脑里的木马病毒没有关系。** 名字取自“特洛伊木马”的比喻，意思是“藏在正常 HTTPS 流量里”，它本身只是一个通信协议。

## 名字里的 Trojan 是怎么回事

搜索“Trojan”时，搜索结果里会混进大量病毒、木马的内容，别看岔了。订阅里出现 `trojan://` 开头的节点，是协议标识，不是恶意软件。判断一个节点是否可信，看的是服务商本身，而不是协议名。

## “伪装 HTTPS”到底伪装了什么

Trojan 的做法可以拆成三步：

1. 客户端与服务端建立一条**标准的 TLS 连接**，外部看到的握手与访问网站相似。
2. 客户端在连接内用**密码**证明身份。
3. 认证不通过的访问，服务端可以把它转给一个真实的网页，对外表现得像普通站点。

这里的“伪装”，指的是**流量形态接近普通 HTTPS 访问**。它不代表无法被识别，也不代表在任何网络环境都畅通，以实际环境为准。

## 与 VLESS、Shadowsocks 怎么区分

| 对比 | Trojan | [VLESS](/glossary/vless/) | [Shadowsocks](/glossary/shadowsocks/) |
|---|---|---|---|
| 外层是否依赖 TLS | 是，设计上就跑在 TLS 上 | 常搭配 TLS，但不是协议本身要求 | 默认没有，自带加密 |
| 用户认证 | 密码 | UUID | 密码加加密方式 |
| 典型配置门槛 | 需要域名与证书 | 视搭配方案而定 | 较低 |
| 客户端支持 | 普遍 | 普遍，个别搭配需较新内核 | 非常普遍 |

## 买机场时，Trojan 节点要注意什么

- **看客户端支持**：主流客户端基本都支持，但是否支持某些传输扩展，要看具体版本。
- **别把协议当质量**：同样是 Trojan 节点，线路、入口带宽、落地机房差异巨大，参考 [落地节点](/glossary/exit-node/) 与 [中转线路](/glossary/relay-route/)。
- **证书问题常表现为连不上**：服务端证书过期或域名失效时，客户端通常只会提示超时，排查见 [机场节点超时怎么办](/troubleshooting/jiedian-quanbu-chaoshi/)。

## 3 个常见说法的拆解

- **“Trojan 伪装得好，所以不会被识别。”** 流量像 HTTPS 不等于无法识别，没有任何协议可以一劳永逸。
- **“Trojan 比别的协议快。”** 协议只是通信语言，速度由线路和带宽决定。
- **“Trojan 就是 Trojan-Go。”** 后者是社区的一种实现，两者的关系以各自项目说明为准。

想比较更多协议，看 [VLESS Trojan Hysteria2区别](/knowledge/vless-trojan-hysteria2-bijiao/)；想知道节点、订阅、协议各自是什么，看 [机场节点是什么](/knowledge/jiedian-dingyue-xieyi-guanxi/)。
