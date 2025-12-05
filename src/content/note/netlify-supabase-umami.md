---
title: Netlify + Supabase 部署 Umami
timestamp: 2025-02-27 22:39:00+08:00
series: 站点建设
tags: [CloudServices]
toc: true
---

![](https://blog-static.xeonzilla.top/img/netlify-supabase-umami/cover.avif)

## 起因

最近研究接入友链接力，拜访了很多个人博客，有些博客会记录访客数量、在线人数和运行时间等站点数据。正好 Blowfish 也提供了一些站点分析的选项[^1]，于是我打算也接入一个类似的分析服务。

Google Analytics 肯定是最知名的站点分析服务之一，但是让 Google 掌握如此精细的数据，与出卖访问者的隐私无异；Google Analytics 提供的巨大跟踪脚本，不仅访问性堪忧，也会拖慢网站的运行速度。

目光转向开源替代品后，我最终选择了 Umami[^2]。作为开源项目，它开发进度稳健、界面简洁优雅，还提供了自行部署的文档，看起来非常适合我这样的入门级用户。

## 部署过程

Umami 文档的 Hosting 一章就给出了很多自行部署的可选项。单一服务器部署不太符合我的需求，毕竟能让我免费长期使用的服务器真是难觅踪迹，于是我们需要使用下方的 App hosting + Managed databases 方案。

在 App hosting 服务上，我选择 Netlify，无他，只因我的 Waline 也部署在 Netlify 上，使用同样的平台方便管理，学习成本也更低。

Managed databases 的选择其实已经呼之欲出，因为在 Umami 文档提供的选项中，好像只有 Supabase 提供免费方案，且无需过多手动设置。

具体的部署过程不在此赘述，文档写得足够详细，我只记录部署中的一些小细节。

1. Umami 文档的一键部署按钮会自动创建你的 Umami 仓库，但是这个仓库没有与上游的 fork 关系。如果知道如何 fork 仓库，建议手动执行，保留 fork 关系便于后续的代码同步。
2. Supabase 在数据库连接上，有 `Direct connection`、`Transaction pooler` 和 `Session pooler` 3 种方式，对于 Umami，应该选择 `Session pooler`。
3. Umami 可以通过配置环境变量 `TRACKER_SCRIPT_NAME` 改变跟踪脚本的文件名以绕过屏蔽，但是我在 Netlify 上设置环境变量并不生效，原因未知。我们可以利用 Netlify 的 Rewrites and proxies 功能[^3]，在 `netlify.toml` 中添加如下代码，即可实现相同的效果。
    
    ```toml
    [[redirects]]
    from = "/hugo-deploy"
    to = "/script.js"
    status = 200
    force = true
    ```
    
    这里展示的是最基础的实现，更具体的配置可以参考 Netlify 的文档。

## 迁移 Waline

之前在[更换博客评论系统：Waline](/note/waline/)中，我没有提到数据库的选择，当时为了快速部署，直接选用了官方推荐的 LeanCloud。

Umami 使用 Supabase，而 Waline 使用 LeanCloud，显得有些复杂，更多的平台在维护上也不方便。Waline 支持多种数据库，其中就包括 Supabase 使用的 PostgreSQL，于是我顺手迁移了 Waline 的数据。

在 LeanCloud 导出的 `.csv` 有些错位，需要我手动调整数据。Supabase 导出的 `.csv` 也会产生错位，这个问题大概率与平台无关，或许是文件格式的缺陷，又或者是我的打开方式有误。

与 Umami 不同，Waline 连接 Supabase 的数据库时，需要使用 `Transaction pooler` 的方式。

原本我开设评论区更多是为了好玩，没想到在我迁移的时候，看到了一位访客的 3 条留言。原来真的有人在看我写的文章，并且跟我互动，这种体验很奇妙。

## 后续

目前部署了 Umami，可以在仪表盘上看到各项站点数据，基本满足我的需求，但是要跳转到 Umami 的仪表盘上，毕竟不是很优雅。

Umami 提供了一系列 API，供我们获取数据，我的下一个目标或许是使用 API，直接在页脚显示数据，让博客的元素丰富起来。

[^1]:[局部模板(Partials) · Blowfish](https://blowfish.page/zh-cn/docs/partials/)
[^2]:[Umami](https://umami.is/)
[^3]:[Rewrites and proxies | Netlify Docs](https://docs.netlify.com/routing/redirects/rewrites-proxies/)
