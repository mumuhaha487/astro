import { readdir, readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FRIEND_ENTRY_PATH_PATTERN,
  normalizeFriendName,
  normalizeFriendUrl,
  parseAndValidateFriendEntry,
} from "./lib/friends-validator.mjs";
import { verifyFriendBacklink } from "./lib/friends-backlink.mjs";

const MAX_JSON_FILE_BYTES = 4096;

export async function loadExistingFriends(entriesDir) {
  const existingUrls = new Set();
  const existingNames = new Set();
  const files = (await readdir(entriesDir)).filter((name) => name.endsWith(".json")).sort();
  for (const file of files) {
    const raw = await readFile(join(entriesDir, file), "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed?.url === "string") {
      try {
        existingUrls.add(normalizeFriendUrl(parsed.url));
      } catch {}
    }
    if (typeof parsed?.name === "string" && parsed.name.trim()) {
      existingNames.add(normalizeFriendName(parsed.name));
    }
  }
  return { existingUrls, existingNames, count: files.length };
}

export async function evaluateFriendPullRequest(options) {
  const {
    owner,
    repo,
    prNumber,
    token,
    entriesDir,
    fetchImpl = globalThis.fetch,
    backlinkVerifier = verifyFriendBacklink,
  } = options;

  const ghApi = async (path, init = {}) => {
    const response = await fetchImpl(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "vmss-cn-friends-bot",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    });
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {}
    if (!response.ok) {
      throw new Error(`GitHub API ${init.method || "GET"} ${path} failed (${response.status}): ${json?.message || text}`);
    }
    return json;
  };

  const postComment = async (body) => {
    await ghApi(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  };

  const closePr = async () => {
    await ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}`, {
      method: "PATCH",
      body: JSON.stringify({ state: "closed" }),
    });
  };

  const mergePr = async (headSha, title) => {
    await ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
      method: "PUT",
      body: JSON.stringify({
        sha: headSha,
        merge_method: "squash",
        commit_title: title,
      }),
    });
  };

  const pr = await ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  if (pr.state !== "open") {
    return { action: "skipped", reason: "PR is not open" };
  }
  if (pr.base?.ref !== "main") {
    return { action: "skipped", reason: "PR does not target main" };
  }

  const files = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    files.push(...batch);
    if (batch.length < 100) break;
  }

  const touchesFriendsDir = files.some((file) => String(file.filename || "").startsWith("friends/entries/"));
  if (!touchesFriendsDir) {
    return { action: "skipped", reason: "PR does not touch friends/entries/" };
  }

  const isRepoOwner = String(pr.user?.login || "").toLowerCase() === owner.toLowerCase();

  if (pr.draft) {
    await postComment([
      "### 友链自动审核提示",
      "",
      "当前 Pull Request 处于 Draft 状态，审核机器人暂未执行自动合并或关闭。准备好后请点击 **Ready for review** 触发自动审核。",
    ].join("\n"));
    return { action: "draft", reason: "Draft PR" };
  }

  // 1. Security isolation check
  const isolationErrors = [];
  const outsideFiles = files.filter((file) => !String(file.filename || "").startsWith("friends/entries/"));
  if (outsideFiles.length > 0) {
    isolationErrors.push(
      `安全隔离拦截：友链申请 PR 只能改动 \`friends/entries/\` 目录，检测到无关文件：${outsideFiles.map((f) => `\`${f.filename}\``).join("、")}。`,
    );
  }
  if (files.length !== 1) {
    isolationErrors.push(`安全隔离拦截：每次友链申请 PR 仅允许新增 **1** 个文件，当前包含 ${files.length} 个文件变更。`);
  }
  const targetFile = files[0];
  let matchedFilename = null;
  if (targetFile) {
    if (targetFile.status !== "added") {
      isolationErrors.push(`安全隔离拦截：仅允许**新增**友链文件，不允许修改、重命名或删除现有文件（\`${targetFile.filename}\` 状态为 \`${targetFile.status}\`）。`);
    }
    const match = FRIEND_ENTRY_PATH_PATTERN.exec(String(targetFile.filename || ""));
    if (!match) {
      isolationErrors.push(`文件路径或名称不合法：\`${targetFile.filename}\`。必须位于 \`friends/entries/<slug>.json\`，且文件名仅包含小写字母、数字和连字符。`);
    } else {
      matchedFilename = match[1];
    }
  }

  if (isolationErrors.length > 0) {
    if (isRepoOwner) {
      await postComment([
        "### 友链自动审核跳过（仓库维护 PR）",
        "",
        "检测到仓库所有者提交了包含多项变更的 PR，机器人不会自动合并或关闭，请手动处理。",
      ].join("\n"));
      return { action: "skipped-owner", errors: isolationErrors };
    }
    await postComment(renderRejectionComment({
      isolationOk: false,
      isolationErrors,
      formatOk: null,
      formatErrors: [],
      backlinkOk: null,
      backlinkReason: null,
    }));
    await closePr();
    return { action: "rejected", stage: "isolation", errors: isolationErrors };
  }

  // 2. Fetch raw file content at pinned head SHA via GitHub API (never checkout/execute PR code)
  const headSha = pr.head?.sha;
  const contentMeta = await ghApi(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(targetFile.filename).replace(/%2F/g, "/")}?ref=${encodeURIComponent(headSha)}`,
  );

  const formatErrors = [];
  let entry = null;

  if (contentMeta.type !== "file") {
    formatErrors.push(`安全隔离拦截：\`${targetFile.filename}\` 必须是普通文件（检测到类型：\`${contentMeta.type}\`）。`);
  } else if (typeof contentMeta.size === "number" && contentMeta.size > MAX_JSON_FILE_BYTES) {
    formatErrors.push(`文件体积超过限制（最大 ${MAX_JSON_FILE_BYTES} 字节，当前 ${contentMeta.size} 字节）。`);
  } else if (contentMeta.encoding !== "base64" || typeof contentMeta.content !== "string") {
    formatErrors.push("无法以 Base64 格式读取友链文件内容。");
  } else {
    const rawText = Buffer.from(contentMeta.content.replace(/\n/g, ""), "base64").toString("utf8");
    const { existingUrls, existingNames } = await loadExistingFriends(entriesDir);
    const validation = parseAndValidateFriendEntry(rawText, matchedFilename, {
      strictSchema: true,
      rejectPlaceholders: true,
      rejectSelfHost: true,
      existingUrls,
      existingNames,
    });
    if (!validation.ok) {
      formatErrors.push(...validation.errors);
    } else {
      entry = validation.entry;
    }
  }

  if (formatErrors.length > 0 || !entry) {
    await postComment(renderRejectionComment({
      isolationOk: true,
      isolationErrors: [],
      formatOk: false,
      formatErrors,
      backlinkOk: null,
      backlinkReason: null,
    }));
    await closePr();
    return { action: "rejected", stage: "format", errors: formatErrors };
  }

  // 3. Verify reciprocal backlink on applicant's /friends route
  const backlink = await backlinkVerifier(entry.url);
  if (!backlink.ok) {
    await postComment(renderRejectionComment({
      isolationOk: true,
      isolationErrors: [],
      formatOk: true,
      formatErrors: [],
      backlinkOk: false,
      backlinkReason: backlink.reason,
      checkedUrl: backlink.checkedUrl,
    }));
    await closePr();
    return { action: "rejected", stage: "backlink", reason: backlink.reason };
  }

  // 4. All checks passed -> approve summary comment + atomic squash merge pinned to headSha
  const commitTitle = `friends: add ${entry.name} (#${prNumber})`;
  await postComment([
    "### ✅ 友链自动审核通过",
    "",
    "| 检查项 | 结果 | 详情 |",
    "| --- | --- | --- |",
    `| 安全隔离 | ✅ 通过 | 仅新增 \`${targetFile.filename}\` |`,
    `| JSON 格式与重复项 | ✅ 通过 | 站点：**${escapeMarkdown(entry.name)}**（${entry.url}） |`,
    `| 互链校验（\`/friends\`） | ✅ 通过 | 在 ${backlink.finalUrl} 检测到 \`${backlink.matchedHref}\` |`,
    "",
    "机器人正在自动合并本 PR 到 `main` 分支；合并后 EdgeOne Pages 将自动重新构建并上线你的友链，感谢交换友链！",
  ].join("\n"));

  await mergePr(headSha, commitTitle);
  return {
    action: "merged",
    entry,
    filename: targetFile.filename,
    backlink,
  };
}

function renderRejectionComment({
  isolationOk,
  isolationErrors,
  formatOk,
  formatErrors,
  backlinkOk,
  backlinkReason,
  checkedUrl,
}) {
  const statusBadge = (value) => (value === true ? "✅ 通过" : value === false ? "❌ 未通过" : "⏭️ 未执行");
  const lines = [
    "### ❌ 友链自动审核未通过（PR 已自动关闭）",
    "",
    "| 检查项 | 结果 |",
    "| --- | --- |",
    `| 安全隔离（仅允许在 \`friends/entries/\` 新增单个合规 \`.json\`） | ${statusBadge(isolationOk)} |`,
    `| JSON 格式与重复项校验 | ${statusBadge(formatOk)} |`,
    `| 互链校验（申请域名 \`/friends\` 路由包含 \`https://vmss.cn\`） | ${statusBadge(backlinkOk)} |`,
    "",
    "#### 问题详情",
  ];

  for (const err of isolationErrors) lines.push(`- ${err}`);
  for (const err of formatErrors) lines.push(`- ${err}`);
  if (backlinkOk === false && backlinkReason) {
    lines.push(`- ${backlinkReason}`);
    if (checkedUrl) {
      lines.push(`- 检查地址：${checkedUrl}`);
    }
  }

  lines.push(
    "",
    "#### 修改后重新提交说明",
    "1. 请先在你自己站点的 `/friends` 页面添加指向 `https://vmss.cn` 的可见链接（`<a href=\"https://vmss.cn\">木哈文轩</a>`）。",
    "2. 仅在 `friends/entries/` 目录下新增一个不重复的小写 `.json` 文件（不要修改仓库中的其他任何文件），格式参见 [friends/README.md](friends/README.md)。",
    "3. 修正后重新打开或提交新的 Pull Request，审核机器人会自动重新检查并在全部通过后自动合并上线。",
  );

  return lines.join("\n");
}

function escapeMarkdown(value) {
  return String(value).replace(/[|\\`*_{}[\]()#+\-.!]/g, "\\$&");
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const [owner, repo] = repository.split("/");
  const prNumber = Number(process.env.PR_NUMBER);
  const token = process.env.GITHUB_TOKEN || "";

  if (!owner || !repo || !Number.isInteger(prNumber) || prNumber <= 0 || !token) {
    throw new Error("Missing required environment variables: GITHUB_REPOSITORY, PR_NUMBER, GITHUB_TOKEN");
  }

  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const entriesDir = join(repositoryRoot, "friends", "entries");

  const result = await evaluateFriendPullRequest({
    owner,
    repo,
    prNumber,
    token,
    entriesDir,
  });

  console.log("Friend PR review result:", JSON.stringify(result));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Friend PR review failed:", error);
    process.exit(1);
  });
}
