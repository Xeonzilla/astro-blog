---
title: 部署 ThoughtLite 的曲折之路
timestamp: 2025-12-06 21:16:51+08:00
tags: [Blog]
---

将博客主题从 Fuwari 更换为 ThoughtLite 的过程，耗时约一周。除了必要的设置与文件整理，我将更多的时间投入到了与一些“棘手”问题的斗争上。

## 环境变量

ThoughtLite 的 cloudflare 分支预设了用于自动构建与部署的 GitHub Actions，只需配置必要的环境变量即可工作。

很可惜的是，我的图像全部放在 Cloudflare R2，为了开启 Astro 针对远程图像的优化，构建站点时必须拉取所有远程图像；又很不凑巧的是，Cloudflare 似乎对 GitHub Actions 容器的 IP 有极其严格的限制，即使我关闭了所有可疑的防护规则，使用了 `xiaotianxt/bypass-cloudflare-for-github-action`，也会遇到来自 Cloudflare 的 Bot Fight。

Astro 的图像优化能够避免 CLS（累积布局偏移），直接影响着用户体验，显然是不应该关闭的。不得已，只能将构建的工作重新交给 Workers Builds 了，简单依照以前的 `wrangler.jsonc` 与主题的 `wrangler.example.toml` 进行配置，第一个测试用的站点新鲜出炉。

基本的外观完全一致，但是 Turnstile 不工作，无法进行匿名评论，这就非常奇怪了。在多次尝试无果后，我只好向主题作者五月七日千緒寻求帮助。回复很快来了，不出所料地排除了代码的问题，那么问题一定就藏在一些我能够修改的地方。我把所有站点配置都进行了测试，构建了几十个测试站点，依旧找不到解决方案，而在 GitHub Actions 构建的站点，却总是能正常工作。

很令人沮丧，但这就是事实，我找不到问题出在哪里。一筹莫展之际，Gemini 罗列的众多可能中，不起眼的“变量和机密”提醒了我，原来问题正正就是我最开始就以为自己配置好的环境变量。Cloudflare Workers 和 Pages 的设置面板中，有两处可以设置环境变量的区域，一是“变量和机密”，二是“构建 - 变量和机密”，前者为运行时使用的 Worker 定义环境变量和机密，后者为构建过程中使用的 Worker 配置变量和机密。

我将所有的环境变量都放在了“构建 - 变量和机密”，这与主题 GitHub Actions 的设计似乎保持一致，但是 wrangler 在部署站点时，极可能存在自动处理环境变量的内部机制，因为本地构建与部署的站点同样工作正常，构建时使用的环境变量，自动成为了运行时的环境变量。Workers Builds 并没有这种处理机制，需要用户手动管理构建时和运行时的环境变量。

找到了问题所在，解决方案也就很明显了：把所有环境变量在“变量和机密”处也配置一遍。出于对变量使用情况的好奇，我又进行了若干次的测试，确定了一个目前能够正常工作的简化配置。

| 变量名称 | 构建时 | 运行时 |
| :-: | :-: | :-: |
| PUBLIC_TIMEZONE | 需要 | 不需要 |
| PASS_KEY | ^ | 需要 |
| NOTIFY_PUBLIC_KEY | ^ | 需要 |
| NOTIFY_PRIVATE_KEY | ^ | 需要 |
| AUTHOR_ID | ^ | 需要 |
| PLATFORM_CLIENT_ID | ^ | 需要 |
| PLATFORM_CLIENT_SECRET | ^ | 需要 |
| CLOUDFLARE_ACCOUNT_ID | ^ | 不需要 |
| CLOUDFLARE_DATABASE_ID | ^ | 不需要 |
| CLOUDFLARE_API_TOKEN | ^ | 不需要 |
| CLOUDFLARE_TURNSTILE_SITE_KEY | ^ | 需要 |
| CLOUDFLARE_TURNSTILE_SECRET_KEY | ^ | 需要 |

手工测试所得结果可能有误，具体的使用情况应该根据代码逻辑判断。

事后反思，许多我原以为仅在运行时使用的变量，例如 `PLATFORM_CLIENT_*` 与 `CLOUDFLARE_TURNSTILE_*_KEY`，实际上在构建阶段就会被用来判断相关功能是否启用。代码逻辑本该如此，如果我当初能先花时间阅读源码，或许就能避免测试花费的时间。

## 路径拼接

测试得差不多，终于可以迁移域名，将域名绑定至新项目后，还需要测试的就只有 OAuth 登录了。然后经过一番测试，OAuth 果然也是坏的。这一次我就淡定多了，没有急着向作者求助，从上面的经验看，这个问题大概率又是我的配置导致的。对着 `astro.config.ts` 调整了半天，没有任何恢复的迹象，我灵机一动：直接去观察示例站点的工作状态，一对比不就有结果了嘛！

对比响应 URL 的途中，我发现我的 URL 有两个 `%2F`，凭借不多的调试经验，我猜测大概是路径拼接有问题，多出了一个斜杠。最终在 `src/utils/oauth.ts` 中，我找到了答案。

```typescript
import { site } from "astro:config/server";

const REDIRECT_URI = `${site}/drifter/anchor`;

this.provider = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, `${REDIRECT_URI}/GitHub`);
```

最终的回调路径是使用配置中的链接生成的，而主题代码的实现默认了 `site` 链接末尾不带斜杠。偏偏我是一个喜欢复制浏览器地址栏链接的用户，随手一个复制粘贴，就输入了 `site: "https://xeonzilla.top/"`，最终导致了双斜杠的问题。

## 显式指定的错误页面

正当我以为解决了路径问题，OAuth 能够正常工作时，熟悉的 404 页面又显示在了屏幕上。而且这次，对比法也行不通了，除了我的响应码是 404，预期的响应码是 302 以外，一切看上去都是那么的正常。

我开始逐步回退所做的更改，把所有能想到的配置都恢复了原状，然而不起作用，最后剩下了我最熟悉的 `wrangler.jsonc`。我其实不太屑于测试它，因为我很明确地知道为什么我在使用 jsonc 而不是主题的 toml，他们之间仅有语法与功能支持情况的区别[^1]。

但是最后我还是把它回退了，因为我已经没有其他可回退的修改了。

重新使用 `wrangler.example.toml` 并在 GitHub Action 中拼接 `wrangler.toml` 的方案，OAuth 工作立马正常了。

这一变化令我大惊失色，`wrangler.jsonc` 明明只是变动了语法，怎么就出问题了呢？直到我的目光落在了 `"not_found_handling": "404-page"` 上。瞬间我便明白了问题所在。这个配置使得 Cloudflare 在处理一个无法匹配到任何静态文件的请求时，会直接返回 404 页面。而 OAuth 的回调正是一个没有对应静态文件的动态服务端请求，它被这个规则提前拦截并终止了。

从旧站点带来的一行小小的、看似无害的配置，又浪费了我的一天时间。

测试了很久的 GitHub OAuth 正常了，那么下面的 Google 和 X 呢？一看，两个 500 Internal Server Error。幸运的是，在深入排查前，我查看了使用同一主题的其他站点，发现存在同样的问题。这让我大概可以确认这是上游主题的 Bug，而非我的个人配置错误，避免了又一整天无谓的自我折磨。

## 完结感言

更换主题后的站点终于上线了，虽然曲折，但是还是很欣慰的。

![ThoughtLite](https://blog-static.xeonzilla.top/img/the-bumpy-road-to-thought-lite/01.avif "ThoughtLite")

经过迁移与部署之路，我深刻体会到了“不要相信你的用户”这句话的含金量，用户的使用情况往往会出乎意料，带来很多未知的问题。我要感谢主题作者五月七日千緒，坚定地相信自己的代码，而不是陪我一起排查问题，否则我不仅要浪费自己的时间，还要消耗别人的精力了；同时也要感谢坚持不懈的自己，让我得以避免成为开发者最讨厌的一类用户。

对于一般用户，默认的代码与配置就是最好的选择，开发者经过无数验证后的代码与配置，一定有其道理。如果你就是想要来点不一样的，不仅需要像我一样韧性十足的同时闲得发慌，还要祈求遇到一位愿意回复你的开发者。

[^1]:[Configuration - Wrangler · Cloudflare Workers docs](https://developers.cloudflare.com/workers/wrangler/configuration/)
