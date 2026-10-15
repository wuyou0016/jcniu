---
type: client
title: 'Clash for Windows 停更了用什么？三个接班客户端怎么选'
description: "Clash for Windows替代怎么选：它已停止维护，常见的接班客户端有 Clash Verge Rev、Mihomo Party、FlClash。对比内核、平台与上手难度，附迁移订阅的步骤和下载提醒。"
category: Windows
primaryKeyword: Clash for Windows替代
secondaryKeywords: [Clash for Windows停更, Clash Verge Rev, FlClash]
difficulty: beginner
publishedAt: 2026-10-15
updatedAt: 2026-10-15
rankBlock: none
relatedTopics: [clash-verge, mihomo-party, clash-verge-daoru-dingyue, windows-jichang-kehuduan]
faqs:
  - q: Clash for Windows 还能继续用吗？
    a: 能打开不等于值得用。项目已经停止更新，不再修复问题，也跟不上新的协议和内核变化。如果订阅里出现了老内核认不出的节点，常见表现就是节点缺失或连接失败。建议迁移到仍在维护的客户端，旧版只作为临时过渡。
  - q: 换客户端之后，订阅要重新买吗？
    a: 不用。订阅属于机场账号，和客户端无关。在新客户端里重新粘贴同一条订阅链接即可。如果机场区分了订阅格式，选 Clash 格式或通用格式的那条，具体以机场后台的说明为准。
  - q: 旧客户端里手写的规则能搬过去吗？
    a: 规则文本本身多数还能用，因为新客户端同样使用 Clash 系的配置语法。但不要直接复制整份旧配置文件，建议只把自己写的规则挑出来，放进新客户端的覆写或扩展配置里，避免把过时字段带过去。
  - q: 三个客户端可以同时装吗？
    a: 可以安装，但同一时间只开一个。它们都会修改系统代理或创建虚拟网卡，同时运行会互相抢占，表现为断网或代理不生效。切换前先在原来的客户端里关闭系统代理和 TUN。
---

Clash for Windows替代怎么选，先给结论：Windows 上想要界面省事，选 Clash Verge Rev；偏好 Mihomo 内核的独立客户端，看 Mihomo Party；要同一套体验覆盖安卓和电脑，可以考虑 FlClash。三者都还有人维护，都支持常见的新协议，订阅链接也都是直接粘贴导入，迁移成本并不高。

## Clash for Windows 停更意味着什么

Clash for Windows 曾经是 Windows 上最常见的 Clash 图形客户端。按公开信息，项目作者在 2023 年底删除了仓库并停止维护，同一时期 Clash 原版内核的仓库也被删除。这件事对使用者的影响主要有三点：

- **不再有更新**：遇到的问题没有人修，系统升级后出现的兼容问题只能自己绕；
- **内核停在旧版本**：较新的协议，例如 VLESS、Hysteria2，老内核不一定认识，订阅里这部分节点会缺失或连不上，概念可以看 [VLESS 是什么](/glossary/vless/) 和 [Hysteria2 是什么](/glossary/hysteria2/)；
- **下载来源变乱**：仓库没了之后，网上出现了各种来路不明的“镜像包”，安装包被改动的风险明显升高。

所以 Clash for Windows 停更并不是“不能用”，而是“不值得继续把它当主力”。

## 三个接班客户端对照

Clash for Windows替代的备选不止这三个，下面只列出仍在持续更新、资料最多的三种。内容按各项目公开说明整理，版本更新很快，具体以项目发布页为准。

| 客户端 | 内核 | 平台 | 特点 | 适合谁 |
|---|---|---|---|---|
| Clash Verge Rev | Mihomo（Clash Meta） | Windows、macOS、Linux | 界面完整，订阅、规则、TUN 都在图形界面里，社区资料最多 | 第一次从 Clash for Windows 迁移的人 |
| Mihomo Party | Mihomo | Windows、macOS、Linux | 同样基于 Mihomo，界面思路接近原来的 Clash 系客户端，设置项偏细 | 想要独立、可细调的 Mihomo 客户端 |
| FlClash | Mihomo | Android、Windows、macOS、Linux | 跨平台一致，手机和电脑用同一种操作习惯 | 安卓和电脑都要用，想少学一套界面 |

怎么选可以用一个简单的判断：

1. 只在 Windows 上用、希望教程多：先试 Clash Verge Rev，对应教程见 [Clash Verge 导入订阅教程](/tutorials/clash-verge-daoru-dingyue/)；
2. 想要更细的内核设置：看 [Mihomo Party 怎么用](/clients/mihomo-party/)；
3. 安卓也要用：安卓上的选择见 [安卓机场教程](/clients/android-jichang-jiaocheng/)，里面把 FlClash 和其他客户端放在一起比较过；
4. 还拿不准：用 [客户端选择器](/tools/client-picker/) 按设备和协议筛一遍。

## 从 Clash for Windows 迁移订阅的步骤

迁移的核心原则是“订阅重新导入，规则单独搬运”，不要整份复制旧配置。

1. **找到订阅链接**：从机场后台重新复制，不要从旧客户端里导出配置文件；
2. **在新客户端里新建订阅**：粘贴链接，保存，拉取节点列表；
3. **更新一次并确认节点**：节点数量和旧客户端里大致一致就说明导入正常；
4. **重新设置系统代理或 TUN**：只导入订阅是不会让流量走代理的，系统代理和 TUN 的区别见 [TUN 模式怎么开](/tutorials/tun-mode-setup/)；
5. **把自己写的规则挑出来**：放进新客户端的覆写或扩展配置里，规则怎么写见 [分流规则怎么设](/tutorials/mihomo-fenliu-guize/)；
6. **关闭并卸载旧客户端**：先在旧客户端里关闭系统代理，再卸载，避免残留的系统代理指向一个不再运行的端口，导致其他软件联网异常。

如果迁移后订阅更新失败，按 [订阅更新失败怎么办](/troubleshooting/dingyue-gengxin-shibai/) 里的步骤排查，大多是链接复制不完整或需要先关闭残留代理。

## 下载提醒：只从项目官方仓库获取

停更之后最容易踩的坑，是下载到被改动的安装包。几条习惯：

- 只在项目官方的 GitHub 发布页下载，例如 [Clash Verge Rev 项目](https://github.com/clash-verge-rev/clash-verge-rev)、[Mihomo Party 项目](https://github.com/mihomo-party-org/mihomo-party)、[FlClash 项目](https://github.com/chen08209/FlClash)；
- 看清自己系统的架构和安装包类型，不确定的话选带 x64 的版本，较新的 ARM 设备再选 arm64；
- 不要安装要求关闭杀毒软件才能运行的“破解版”“绿色版”；
- 下载后先确认文件来源和发布页一致，再安装。

## 迁移前后的自检清单

- [ ] 订阅链接是重新从机场后台复制的，没有沿用旧配置文件；
- [ ] 新客户端里节点数量和旧客户端大致一致；
- [ ] 已经选好一种接入方式：系统代理或 TUN，并确认生效；
- [ ] 旧客户端已经关闭系统代理，再卸载；
- [ ] 自己写的规则逐条搬过来，并按顺序检查过；
- [ ] 同一时间只开一个客户端。

## 今天就做

Clash for Windows替代，本质上只是换一个客户端，订阅和账号都不用动。

1. 挑一个客户端，从官方仓库下载安装；
2. 把订阅链接重新粘贴一遍，更新并选节点；
3. 打开系统代理，访问一个常用网站验证。

还没有订阅的，可以先看 [机场推荐排行榜](/rankings/) 里的资料，再决定怎么买。软件界面和功能会随版本变化，以软件实际显示和项目官方说明为准。使用代理服务请遵守所在地法律法规，机场牛不提供法律意见。
