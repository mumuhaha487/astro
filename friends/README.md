# 友情链接申请

本站把友链数据和博客放在同一个仓库中。申请者只需要修改 `friends/entries/`，不需要改动页面代码。

## 提交方式

1. Fork [mumuhaha487/astro](https://github.com/mumuhaha487/astro)。
2. 在 `friends/entries/` 自己填写一个尚未被占用的 `.json` 文件名，只保留小写字母、数字和连字符；链接不会预填文件名，以免多人申请时重名。
3. 按下面的格式填写并提交 Pull Request。
4. 仓库构建会自动校验格式、URL 和重复项；所有检查通过并由站长合并后，友链会自动上线。

```json
{
  "name": "木哈文轩",
  "url": "https://vmss.cn/",
  "avatar": "https://vmss.cn/images/demo-avatar.webp",
  "description": "一个建立在21世纪的边缘小站",
  "tags": ["博客"]
}
```

`name` 和 `url` 必填，`avatar` 可以为 `null`，`description` 与 `tags` 可选。请勿在一个 Pull Request 中修改无关文件。

[在 GitHub 新建友链文件](https://github.com/mumuhaha487/astro/new/main/friends/entries)
