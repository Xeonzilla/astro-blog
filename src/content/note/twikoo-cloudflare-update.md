---
title: 升级你的 twikoo-cloudflare
timestamp: 2025-05-22 13:18:00+08:00
series: 站点建设
tags: [CommentSystem, CloudServices]
toc: true
---

![](https://blog-static.xeonzilla.top/img/twikoo-cloudflare-update/cover.avif)

## 前言

前面提到我的站点已经“All in Cloudflare”了，所以评论系统自然也要重新部署。好在主流的评论系统中，Twikoo 提供了在 Cloudflare Workers 部署的选项，于是我的评论系统也就从 Waline 过渡到了 Twikoo。

目前在 twikoo-cloudflare 的仓库[^1]中，代码还停留在 4 个月前（2025 年 1 月）的状态，twikoo 后端的版本也停在了 1.6.40，如果像我一样追求最新版，那么就需要自行更新。

## 更新依赖

twikoo-cloudflare 的 `package.json` 中，大部分的依赖都是可以直接更新到最新版的，经过试验并能稳定使用的 `package.json` 如下：

```json
{
  "name": "twikoo-cloudflare",
  "version": "1.6.43",
  "description": "A simple, safe, free comment system.",
  "author": "Tao Xin <tao@vanjs.org> (https://github.com/Tao-VanJS), Mingy <master@mingy.org> (https://github.com/wuzhengmao)",
  "license": "MIT",
  "type": "module",
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev",
    "start": "wrangler dev"
  },
  "homepage": "https://twikoo.js.org",
  "devDependencies": {
    "wrangler": "^3.114.8"
  },
  "dependencies": {
    "twikoo-func": "^1.6.43",
    "url": "^0.11.4",
    "uuid": "^11.1.0",
    "xss": "^1.0.15"
  },
  "overrides": {
    "axios": "git+https://github.com/wuzhengmao/axios-cf-worker.git#v0.x-cf"
  }
}
```

其中的 axios 并不是普通的版本，而是开发者进行了适配的 `axios-cf-worker`，很可惜的是作者也有一段时间没有更新或是合并上游更改了，对于这部分的更新，唯有等待。

如果像我一样更新了其中的 `version` 字段，则需要到 `src/index.js` 的 115 行左右同步更新。

## 小心 Wrangler

可能有细心的读者注意到，我还在使用 Wrangler3。为什么不进行升级呢？很简单，因为报错了。

在我进行试验的 Wrangler 中，`4.13.2` 会出现一个警告：

```log
▲ [WARNING] Import "default" will always be undefined because there is no matching export in "node_modules/unenv/dist/runtime/npm/whatwg-url.mjs" [import-is-undefined]

    required-unenv-alias:whatwg-url:6:27:
      6 │         "default" in esm ? esm.default : {}
        ╵                                ~~~~~~~
```

而更高的 `4.15.2` 更是会直接报错：

```log
✘ [ERROR] Build failed with 1 error:

  ✘ [ERROR] Could not resolve "./node/"
	 
      node_modules/axios/lib/platform/index.js:3:25:
        3 │ module.exports = require('./node/');
          ╵                          ~~~~~~~~~
```

考虑到 Wrangler4 进行了完全的重构，以达到对开发环境的完整模拟，属于破坏性更改，不兼容也在情理之中。

最后，为了保证系统的稳定，我还是选择了 Wrangler3。Cloudflare 官方并没有停止对 Wrangler3 的维护，所以对 Wrangler 大版本的升级也没有那么急切。

## 结语

升级了后端，前端的升级就非常简单了，只需在 CDN 引入的版本号稍作修改即可。

虽然我并不是开发者，但是从 twikoo-cloudflare 整体的结构来看，axios 是其中最复杂，最难以维护的一环。如果想要更新 axios-cf-worker，不仅要合并来自上游的更新、解决冲突，还要注意 Cloudflare Workers 是否有环境变化。或许放弃 axios，转向替代品，对维护会更友好？

Cloudflare Workers 即将上线容器托管服务，对于愿意付费的用户，往后在 Cloudflare 平台上，可供选择的评论系统就很多了。而对免费用户而言，twikoo-cloudflare 就是目前的最优解。

[^1]:[twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare)
