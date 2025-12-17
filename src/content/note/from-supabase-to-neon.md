---
title: 从 Supabase 迁移至 Neon
timestamp: 2025-02-28 23:13:00+08:00
tags: [CloudServices]
toc: true
---

![](https://blog-static.xeonzilla.top/img/from-supabase-to-neon/cover.avif)

## 最速迁移

就在我写完[上篇文章](/note/netlify-supabase-umami)没多久，在论坛查找资料的途中，我偶然发现了 Supabase 的新兴竞品，Neon[^1]。一番对比后，我决定火速将 Waline 和 Umami 的数据库迁移到 Neon。

Neon 和 Supabase 的免费计划额度各有千秋。虽说 Neon 非常慷慨，为免费计划用户提供最多 10 个项目，但是显然，我暂时用不了这么多；相比之下，它 compute hours 的计数方式就精细得多，每月 190h 的额度看上去岌岌可危，不过对于轻量用户，应该也是够用的。

Neon 最吸引我的，实际上并不在额度的限制，而是创建项目时，可以自行选择 Postgres 的版本，包括目前最新的版本 17；而 Supabase 并不提供这个选项，默认使用 Postgres 15。作为一位钟情于最新版和性能的用户，这个小细节深得我心。

另外，Neon 提供了 AWS 和 Azure 两种服务商，对于想使用 Azure 的用户也具有一定的优势。不过 Azure 能够选择的节点位置就很有限了。

## 注意事项

迁移至 Neon 时，我顺便修正了先前的一个小错误。在数据库的位置选择上，不应根据用户的地理位置，而应该关注 Netlify Functions 所在的区域，因为我的服务（Waline 和 Umami）部署在 Netlify 上，用户访问的是 Netlify Functions，而负责连接数据库的也是 Netlify Functions。

现在区域对齐，服务商也同为 AWS，他们间的连接表现极佳。甚至很有可能，两个服务正好位于同一数据中心，在内网中通信。

至于用户如何连接至 Netlify Functions，目前我没有优化的计划，一是 Netlify 在中国大陆的连通性尚可，二是大部分免费域名可靠性未知，或许比默认的 `netlify.app` 域名更容易被屏蔽。

连接 Umami 顺利完成，但是在连接 Waline 上，我遇到了连接超时的问题，一番调查后才发现，虽然 Neon 默认不显示端口，但是想要连接 Waline，端口是必选项。

Neon 的数据库端口藏在控制面板 Connect 中的 `Django` 选项里，为 `5432`，和 Supabase 的端口一致。此时填写 Waline 的环境变量 `PG_PORT` 并重新部署，即可解决超时问题。

## 总结

实际上，两个平台的定位就存在着差异：Neon 提供 Serverless Postgres，而 Supabase 专注于 BaaS。仅就我的需求而言，Neon 才是“专业对口”的那位。

Supabase 仍然是很好的服务平台，有一定的免费额度、社区活跃，如果哪天我需要云服务，它会是一个很好的选择。

[^1]:[Neon Serverless Postgres — Ship faster](https://neon.tech/home)
