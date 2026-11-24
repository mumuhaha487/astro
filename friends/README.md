# 友情链接申请

本站把友链数据和博客放在同一个仓库中。申请者只需要在 `friends/entries/` 新增一个 `.json` 文件，不需要改动任何页面或脚本代码。

## 提交前提与流程

1. **先添加本站友链**：请先在你申请的站点域名下的 `/friends` 路由（例如 `https://你的域名/friends` 或 `/friends/`）添加指向 **`https://vmss.cn`** 的可见链接。
2. Fork [mumuhaha487/astro](https://github.com/mumuhaha487/astro)。
3. 在 `friends/entries/` 自己填写一个尚未被占用的 `.json` 文件名，只保留小写字母、数字和连字符；链接不会预填文件名，以免多人申请时重名。
4. 按下面的格式填写并提交 Pull Request（请勿修改 `friends/entries/` 之外的任何文件，也不要修改或删除其他人的友链文件）。
5. **自动审核与上线**：GitHub 审核机器人（`.github/workflows/friends-review.yml`）会自动检查：
   - **安全隔离**：是否仅在 `friends/entries/` 新增了单个合规 `.json` 文件；
   - **格式与重复项**：JSON 语法、字段限制、URL 有效性以及是否与现有友链重复；
   - **互链校验**：访问申请站点域名的 `/friends` 页面，确认已添加可见的 `https://vmss.cn` 链接。
   - 全部通过后机器人会自动合并到 `main`，由 EdgeOne Pages 自动构建上线；任意一项未通过则会自动关闭 PR 并说明原因。

```json
{
  "name": "木哈文轩",
  "url": "https://vmss.cn/",
  "avatar": "https://vmss.cn/images/demo-avatar.webp",
  "description": "一个建立在21世纪的边缘小站",
  "tags": ["博客"]
}
```

`name` 和 `url` 必填，`avatar` 可以为 `null`，`description` 与 `tags` 可选。

[在 GitHub 新建友链文件](https://github.com/mumuhaha487/astro/new/main/friends/entries)
