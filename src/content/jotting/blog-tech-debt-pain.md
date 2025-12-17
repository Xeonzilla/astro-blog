---
title: 博客的技术债之痛
timestamp: 2025-12-17 19:49:25+08:00
tags: [Blog]
---

## 旧时代的回响

今天我在查看站点日志的时候，发现了一个 `GET /post/pon_no_michi` 请求，它得到了一个 404 响应。

404 Not Found 是再正常不过了，毕竟博客使用这种 URL 格式已经是很久以前的事了，但是我又想，是不是有一些我看不到的地方，仍以旧链接的格式抓取或是转载我的文章？对我而言，读者当然是多多益善，我不应该拒绝任何一位访客的请求。读者见到站点陌生的 404 页面，多少会有些茫然和不适吧。于是我决定为博客所有曾用的 URL 格式设置一个重定向。

重定向的实现并不困难，Cloudflare Workers 贴心地为用户准备了重定向功能[^1]，我们只需在 `public/_redirects` 配置需要重定向的路径。之所以不使用代码进行重定向，是因为官方提供的重定向最简单，不需要设计代码逻辑，只需要配置规则。

## 屎山堆积

很幸运，我没有删除旧博客，包括 Hugo 时期的代码和 Markdown，这让我得以一窥旧时的 URL 设计。

第一版格式采用了“post + 下划线”的方案，看到这种设计时，我不禁笑出声来。很显然，最开始搭建博客的我没有对 SEO 和其他博客进行任何研究，只是凭空想象出了这样一套完全经不起推敲的格式。使用下划线，是因为当时的我认为用户看到下划线会比较接近看到空格，连字符不太方便用户辨认；使用 `post` 而非 `posts` 作为路径，也是觉得在构成完整 URL 后，“/post/文章 Slug”这样的 URL 才对应单篇文章的含义，用复数反而不好。

第二版格式变成了“posts + 下划线”，因为 Fuwari 主题本身存在 `src/content/posts/` 这一路径，我直接沿用了。将 posts 作为路径是大部分博客设计者们的共识，可惜我当时没有进行事先调查。第三版格式进化为“posts + 连字符”，因为我开始设法优化博客，SEO 是优化的重要一环。经过一番学习的我终于知道：比起让读者读懂我的 URL，还是让搜索引擎和爬虫读懂更重要。

第四版就是现在的模样，跟随博客主题，`note` 与 `jotting` 的组合取代了 `posts` 。

除了大规模的变更，针对部分文章的改动也不时进行。最终留给我的，就是一个巨大无比且经过多次更改的链接系统。

那么对于最复杂的情况，我需要多少重定向规则呢？答案是 7 条。

```shell
/post/hime-sama_goumon_no_jikan_desu/        /note/himesama-goumon        301
/post/hime-sama_goumon_no_jikan_desu         /note/himesama-goumon        301
/post/himesama_goumon/                       /note/himesama-goumon        301
/post/himesama_goumon                        /note/himesama-goumon        301
/posts/himesama_goumon/                      /note/himesama-goumon        301
/posts/himesama_goumon                       /note/himesama-goumon        301
/posts/himesama-goumon/                      /note/himesama-goumon        301
```

文章 Slug 的变动、`post` 与 `posts` 的变化、下划线到连字符的迭代。除此之外，要涵盖各种托管平台对 URL 末尾斜杠的处理，还必须给出含斜杠与不含斜杠的两种版本。最后需要一个 `/posts/* /note/:splat 301` 的动态规则托底。

## Slug 之妙

我是很不喜欢设计文章 Slug 的人。让我为文章设计一个标题已经足够困难了，文章描述可以干脆直接不写，偏偏这个作为 Slug 的别名它不得不写，而且还对 SEO 很重要。

对于二次元内容，以前的我直接照搬作品的罗马音，这很快，而且方便辨认，简直是天生为我这种不想设计 Slug 的人准备的。直到我遇到了[「轮回七次的恶役千金，在前敌国享受随心所欲的新婚生活」](/note/7th-timeloop)。它的译名很长，它的罗马音更长，而当时的我居然直接采用了，现在想来简直不可思议。出于对 SEO 的考量，它的别名最终由下面的一长串变成了“loopnana”，最后变成了现在的“7th-timeloop”。

```plaintext
loop_7-kaime_no_akuyaku_reijou_wa_moto_tekikoku_de_jiyuu_kimama_na_hanayome_seikatsu_wo_mankitsu_suru
```

当时的我没有研究罗马音的长音，所以上面的的 Slug 不仅长，还有可能是错的。

现在的我倒是学会了新的招式，照搬动画或者作品官网的 URL。由官方设计的别名，不仅短，而且肯定不会出错。

至于非二次元内容的别名，我到现在还是不擅长设计。最近写的随笔，其 Slug“the-bumpy-road-to-thought-lite”，其实也不太符合规范，问了问 ChatGPT，可能改为“thought-lite-bumpy-road”会更好，但是现在这个也不至于长得离谱，就随它去了。

## 避免技术债

在翻阅多个提交，确定了所有的 URL 后，我得到了一个三百多行的 `_redirects` 文件，规则的数量还可能在未来继续增长。

翻阅以前的提交相当痛苦，因为没有遵守任何规范，提交说明几乎没有有效信息；寻找各种可能的 URL 也十分复杂，因为 URL 的变化与博客的内容变更混杂，需要逐个文章对照，定制具体的重定向需求。查看了几个时期的博客内容，最大的感想是：以前的我怎么这么能写，竟然给我留下了这么多文章要处理？

显然这些工作都是本可避免的，所以现在的我也学会了事前规划与调查，仿照其他成熟博客的设计，查看代码实现，遵守约定式提交规范，尽可能让博客在不增加技术债的情况下走得更远。

还债这种事，还是不要再经历一次为好。

[^1]:[Redirects · Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/redirects/)
