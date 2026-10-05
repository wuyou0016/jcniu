---
term: "Shadowsocks"
definition: "Shadowsocks 是老牌的轻量代理协议，自带加密、配置简单、客户端支持面极广，常被简称为 SS。"
extendedExplanation: "Shadowsocks 由社区开发者在 2010 年代初推出，是国内用户最早接触的一批代理协议之一。它用对称加密保护数据，没有 TLS 外壳，结构简单、资源占用小，几乎所有客户端都支持。早期的流式加密方式已不推荐，现在一般使用 AEAD 加密。较新的规范常被称为 SS2022，支持情况因客户端而异，以官方说明为准。"
aliases: ["SS", "Shadowsocks协议", "SS2022"]
relatedTerms: ["shadowtls", "vless", "trojan-protocol", "multi-user-port"]
relatedArticles: ["vless-trojan-hysteria2-bijiao", "jiedian-dingyue-xieyi-guanxi", "clash-jichang-tuijian"]
updatedAt: 2026-10-05
---

Shadowsocks 是协议圈里的“老炮”：**出道早、结构简单、几乎所有客户端都认。** 新协议层出不穷，它仍然常出现在订阅里，原因主要在这三点。

## Shadowsocks 为什么还在被用

- **简单**：配置项少，服务端和客户端都只需要地址、端口、密码和加密方式。
- **轻量**：没有 TLS 外壳，处理开销小，对设备要求低。
- **兼容**：从电脑到手机，从路由器到各类内核，基本都能找到支持。

## 加密方式：你会看到的几个名字

节点配置里有一项“加密方式”，别随便挑，也别自己改：

| 类型 | 常见写法 | 一般建议 |
|---|---|---|
| AEAD 加密 | aes-128-gcm、aes-256-gcm、chacha20-ietf-poly1305 | 现在的主流选择 |
| 早期流式加密 | rc4-md5 一类 | 已被认为不安全，不建议使用 |
| 新一代规范 | 常称 SS2022，名称以 2022 开头 | 需要客户端支持，兼容性因版本而异 |

**加密方式必须与服务端一致**，不一致时表现就是连上了但无法使用，这类“已连接无网络”的排查可以参考 [已连接但无法上网](/troubleshooting/yilianjie-dan-meiwang/)。

## 它和 TLS 类协议有什么取舍

[Trojan](/glossary/trojan-protocol/) 之类协议把流量装进标准 TLS，Shadowsocks 则靠自带加密，没有 TLS 外壳：

- 优点是简单、省资源、兼容性好。
- 缺点是流量里没有 TLS 的外形，在管控较严的网络环境中，一般更容易被特征识别，实际情况因环境而异。
- 想补上外形，可以搭配传输层伪装，见 [ShadowTLS](/glossary/shadowtls/)。

## 什么时候你会遇到它

1. **较早期的套餐或老节点**：很多服务商会保留 SS 节点作为兼容选项。
2. **需要兼容旧客户端、路由器固件**：新协议不支持时，SS 是退路。
3. **“一人一端口”的老式部署**：经典 Shadowsocks 一个端口一个密码，所以用户多时常用多端口，见 [多用户端口](/glossary/multi-user-port/)。

## 关于 Shadowsocks 的 3 个说法

- **“SS 过时了，不能用。”** 它仍在广泛使用，是否合适要看你的网络与客户端。
- **“SS 不安全。”** AEAD 加密本身没问题，早期流式加密才是被淘汰的对象。
- **“SS 和 VLESS 差不多。”** 两者设计思路不同，VLESS 把安全交给外层，SS 自带加密。

想把几个协议放在一起比较，看 [VLESS Trojan Hysteria2区别](/knowledge/vless-trojan-hysteria2-bijiao/)；想弄清节点、订阅、协议各是什么，看 [机场节点是什么](/knowledge/jiedian-dingyue-xieyi-guanxi/)。
