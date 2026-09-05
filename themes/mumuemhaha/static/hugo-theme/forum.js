(() => {
  const root = document.querySelector("#forum-app");
  if (!root) return;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const state = { session: null, topics: [], filter: "all", editorContent: "", editingTopic: null, currentTopic: null, adminTab: "users" };
  const authDialog = $("#forum-auth-dialog");
  const editorDialog = $("#forum-editor-dialog");
  const topicDialog = $("#forum-topic-dialog");
  const editorFrame = $(".forum-editor-frame");

  async function api(path, options = {}) {
    const response = await fetch(`/api/forum/${path}`, {
      credentials: "same-origin",
      headers: { "content-type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `请求失败 (${response.status})`);
    return data;
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function markdown(value) {
    const code = [];
    let source = escapeHtml(value).replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, language, body) => {
      const token = `@@CODE${code.length}@@`;
      code.push(`<pre><code data-language="${escapeHtml(language)}">${body.trim()}</code></pre>`);
      return token;
    });
    source = source
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/!\[([^\]]*)]\((https?:\/\/[^\s)]+|\/api\/forum\/media\/[a-f0-9]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
      .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .split(/\n{2,}/).map((block) => /^<(h[1-3]|pre|blockquote)/.test(block) || /^@@CODE\d+@@$/.test(block) ? block : `<p>${block.replaceAll("\n", "<br>")}</p>`).join("");
    return source.replace(/@@CODE(\d+)@@/g, (_, index) => code[Number(index)] || "");
  }

  function relativeTime(value) {
    const date = new Date(value); const diff = Date.now() - date.getTime();
    if (!Number.isFinite(diff)) return "";
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    return date.toLocaleDateString("zh-CN");
  }

  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="/icons/lucide-sprite.svg#${name}"></use></svg>`;
  const categoryName = (category) => ({ question: "问答", share: "分享", chat: "闲聊" }[category] || "讨论");
  const currentUser = () => state.session?.authenticated ? state.session.user : null;
  const canManage = (item) => Boolean(currentUser() && (currentUser().role === "admin" || currentUser().id === item.authorId));

  function setSession(session) {
    state.session = session;
    const user = currentUser();
    const login = $("[data-forum-login]"); const create = $("[data-forum-new]"); const account = $("[data-forum-account]");
    login.hidden = Boolean(user); create.hidden = !user; account.hidden = !user;
    if (user) account.innerHTML = `<strong>${escapeHtml(user.username)}</strong><span>${user.role === "admin" ? "管理员" : "社区成员"}${user.email ? ` · ${escapeHtml(user.email)}` : ""}</span><span class="forum-account-actions"><button class="button button-ghost" type="button" data-forum-logout>${icon("log-out")}退出</button>${user.role !== "admin" ? '<button class="button button-danger" type="button" data-forum-delete-account>注销账户</button>' : ""}</span>`;
    $("[data-forum-admin-nav]").hidden = user?.role !== "admin";
    const authButton = $("[data-forum-auth-button]");
    if (authButton) authButton.querySelector("span").textContent = user ? user.username : "论坛账户";
    $("[data-forum-logout]")?.addEventListener("click", logout);
    $("[data-forum-delete-account]")?.addEventListener("click", deleteAccount);
    Object.entries(session?.stats || {}).forEach(([key, value]) => { const node = $(`[data-forum-stat="${key}"]`); if (node) node.textContent = Number(value).toLocaleString(); });
  }

  function renderTopics() {
    const feed = $("[data-forum-feed]");
    const topics = state.filter === "all" ? state.topics : state.topics.filter((topic) => topic.category === state.filter);
    if (!topics.length) { feed.innerHTML = '<div class="empty-state">这个分类还没有主题。</div>'; return; }
    feed.innerHTML = topics.map((topic) => `<article class="forum-topic" data-topic-id="${topic.id}" tabindex="0">
      <div class="topic-avatar">${escapeHtml(topic.authorName.slice(0, 1).toUpperCase())}</div>
      <div class="topic-body"><h3>${topic.pinned ? icon("pin") : ""}${escapeHtml(topic.title)}${topic.locked ? icon("lock") : ""}</h3><p>${escapeHtml(topic.excerpt || "暂无摘要")}</p></div>
      <div class="topic-meta"><strong>${topic.commentCount} 回复</strong><span>${escapeHtml(topic.authorName)} · ${relativeTime(topic.updatedAt)}</span></div>
    </article>`).join("");
    $$("[data-topic-id]", feed).forEach((node) => {
      const open = () => openTopic(node.dataset.topicId);
      node.addEventListener("click", open); node.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
    });
  }

  async function loadTopics() {
    const data = await api("topics"); state.topics = data.topics || []; renderTopics();
  }

  function openAuth(mode = "login") {
    setAuthMode(mode); if (!authDialog.open) authDialog.showModal();
  }

  function setAuthMode(mode) {
    const register = mode === "register";
    $$("[data-auth-mode]").forEach((button) => button.classList.toggle("active", button.dataset.authMode === mode));
    $$("[data-auth-register]").forEach((node) => { node.hidden = !register; });
    $$("[data-auth-login]").forEach((node) => { node.hidden = register; });
    $("[data-auth-title]").textContent = register ? "注册论坛" : "登录论坛";
    $("[data-auth-submit]").textContent = register ? "创建账户" : "登录";
    $("[data-auth-form]").dataset.mode = mode; $("[data-auth-error]").textContent = "";
  }

  async function submitAuth(event) {
    event.preventDefault();
    const form = event.currentTarget; const mode = form.dataset.mode || "login"; const data = Object.fromEntries(new FormData(form)); const error = $("[data-auth-error]"); const button = $("[data-auth-submit]");
    if (mode === "register" && data.password !== data.confirmPassword) { error.textContent = "两次输入的密码不一致"; return; }
    button.disabled = true; button.textContent = mode === "register" ? "注册中..." : "登录中..."; error.textContent = "";
    try {
      await api(mode, { method: "POST", body: JSON.stringify(data) });
      const session = await api("session"); setSession(session); authDialog.close(); form.reset(); await loadTopics();
    } catch (exception) { error.textContent = exception.message; }
    finally { button.disabled = false; button.textContent = mode === "register" ? "创建账户" : "登录"; }
  }

  async function logout() { try { await api("logout", { method: "POST", body: "{}" }); setSession(await api("session")); } catch (error) { showFeedError(error.message); } }
  async function deleteAccount() { if (!confirm("确认永久注销论坛账户？历史主题和回复会保留署名。")) return; try { await api("account", { method: "DELETE", body: "{}" }); setSession(await api("session")); await loadTopics(); } catch (error) { alert(error.message); } }

  function postEditor(message) { editorFrame?.contentWindow?.postMessage({ source: "mumu-forum", ...message }, location.origin); }
  function openEditor(topic = null) {
    if (!currentUser()) return openAuth("login");
    state.editingTopic = topic; state.editorContent = topic?.content || "";
    $("[data-topic-editor-title]").textContent = topic ? "编辑主题" : "发表主题";
    $("[data-topic-title]").value = topic?.title || ""; $("[data-topic-category]").value = topic?.category || "question"; $("[data-topic-error]").textContent = "";
    updateEditorCount(); editorDialog.showModal(); setTimeout(() => postEditor({ type: "set-content", content: state.editorContent }), 80);
  }

  function updateEditorCount() { $("[data-topic-count]").textContent = `${state.editorContent.length} / 64000`; }
  async function submitTopic() {
    const title = $("[data-topic-title]").value.trim(); const category = $("[data-topic-category]").value; const error = $("[data-topic-error]"); const button = $("[data-topic-submit]");
    button.disabled = true; error.textContent = "";
    try {
      const path = state.editingTopic ? `topics/${state.editingTopic.id}` : "topics"; const method = state.editingTopic ? "PATCH" : "POST";
      const data = await api(path, { method, body: JSON.stringify({ title, category, content: state.editorContent }) });
      editorDialog.close(); await loadTopics(); if (state.editingTopic) await openTopic(data.topic.id);
    } catch (exception) { error.textContent = exception.message; }
    finally { button.disabled = false; }
  }

  async function openTopic(id) {
    try {
      const data = await api(`topics/${id}`); state.currentTopic = data.topic; renderTopic(data.topic, data.comments || []); topicDialog.showModal();
    } catch (error) { showFeedError(error.message); }
  }

  function renderTopic(topic, comments) {
    const view = $("[data-topic-view]"); const user = currentUser();
    view.innerHTML = `<div class="topic-view-head"><div><span class="badge">${categoryName(topic.category)}</span><h2>${escapeHtml(topic.title)}</h2><div class="topic-author">${escapeHtml(topic.authorName)} · ${relativeTime(topic.createdAt)}${topic.locked ? " · 已锁定" : ""}</div></div><div class="topic-view-actions"><button class="icon-button" type="button" data-topic-close aria-label="关闭">${icon("x")}</button></div></div>
      <div class="topic-content markdown-content">${markdown(topic.content)}</div>
      <div class="topic-view-actions">${canManage(topic) ? `<button class="button button-ghost" type="button" data-topic-edit>${icon("pencil")}编辑</button><button class="button button-danger" type="button" data-topic-delete>${icon("trash")}删除</button>` : ""}</div>
      <section class="comment-list"><div class="section-title">${comments.length} 条回复</div>${comments.length ? comments.map(renderComment).join("") : '<div class="modal-empty">暂无回复</div>'}</section>
      ${user && (!topic.locked || user.role === "admin") ? `<form class="comment-form"><textarea maxlength="8000" placeholder="写下你的回复..." required></textarea><p class="form-error" role="alert"></p><footer><button class="button button-primary" type="submit">${icon("send")}发布回复</button></footer></form>` : `<p class="form-note">${topic.locked ? "主题已锁定，暂时不能回复。" : "登录后可以参与讨论。"}</p>`}`;
    $("[data-topic-close]", view).addEventListener("click", () => topicDialog.close());
    $("[data-topic-edit]", view)?.addEventListener("click", () => { topicDialog.close(); openEditor(topic); });
    $("[data-topic-delete]", view)?.addEventListener("click", () => deleteTopic(topic.id));
    $$("[data-comment-edit]", view).forEach((button) => button.addEventListener("click", () => editComment(button.dataset.commentEdit, comments)));
    $$("[data-comment-delete]", view).forEach((button) => button.addEventListener("click", () => deleteComment(button.dataset.commentDelete)));
    $(".comment-form", view)?.addEventListener("submit", submitComment);
  }

  function renderComment(comment) {
    return `<article class="comment-item"><header><span><strong>${escapeHtml(comment.authorName)}</strong> · ${relativeTime(comment.createdAt)}</span>${canManage(comment) ? `<span class="comment-actions"><button class="icon-button" type="button" data-comment-edit="${comment.id}" aria-label="编辑评论">${icon("pencil")}</button><button class="icon-button" type="button" data-comment-delete="${comment.id}" aria-label="删除评论">${icon("trash")}</button></span>` : ""}</header><p>${escapeHtml(comment.content)}</p></article>`;
  }

  async function submitComment(event) {
    event.preventDefault(); const form = event.currentTarget; const content = $("textarea", form).value; const button = $("button", form); const error = $("[role=alert]", form); button.disabled = true;
    try { await api(`topics/${state.currentTopic.id}/comments`, { method: "POST", body: JSON.stringify({ content }) }); await openTopic(state.currentTopic.id); }
    catch (exception) { error.textContent = exception.message; }
    finally { button.disabled = false; }
  }
  async function editComment(id, comments) { const comment = comments.find((item) => item.id === id); const content = prompt("编辑评论", comment?.content || ""); if (content === null) return; try { await api(`comments/${id}`, { method: "PATCH", body: JSON.stringify({ content }) }); await openTopic(state.currentTopic.id); } catch (error) { alert(error.message); } }
  async function deleteComment(id) { if (!confirm("确认删除这条评论？")) return; try { await api(`comments/${id}`, { method: "DELETE", body: "{}" }); await openTopic(state.currentTopic.id); await loadTopics(); } catch (error) { alert(error.message); } }
  async function deleteTopic(id) { if (!confirm("确认删除这个主题及其全部回复？")) return; try { await api(`topics/${id}`, { method: "DELETE", body: "{}" }); topicDialog.close(); await loadTopics(); } catch (error) { alert(error.message); } }

  async function openAdmin(tab = "users") {
    if (currentUser()?.role !== "admin") return;
    state.adminTab = tab; $("[data-forum-admin]").hidden = false; document.body.classList.add("no-scroll");
    $$("[data-admin-tab]").forEach((button) => button.classList.toggle("active", button.dataset.adminTab === tab)); await renderAdmin();
  }
  function closeAdmin() { $("[data-forum-admin]").hidden = true; document.body.classList.remove("no-scroll"); }
  async function renderAdmin() {
    const content = $("[data-admin-content]"); content.innerHTML = '<div class="forum-loading">正在读取...</div>';
    try {
      if (state.adminTab === "users") {
        const data = await api("admin/users");
        content.innerHTML = `<form class="admin-create"><label>用户名<input name="username" required></label><label>邮箱<input name="email" type="email"></label><label>初始密码<input name="password" type="password" required></label><label>角色<select name="role"><option value="user">用户</option><option value="admin">管理员</option></select></label><button class="button button-primary" type="submit">添加用户</button></form>${adminTable(["用户名", "邮箱", "角色", "状态", "操作"], data.users.map((user) => [escapeHtml(user.username), escapeHtml(user.email || "-"), user.role, user.banned ? "已封禁" : "正常", `<span class="admin-row-actions"><button class="button button-ghost" data-user-ban="${user.id}" data-banned="${user.banned}">${user.banned ? "解封" : "封禁"}</button><button class="button button-danger" data-user-delete="${user.id}">删除</button></span>`]))}`;
        $(".admin-create", content).addEventListener("submit", adminCreateUser);
        $$("[data-user-ban]", content).forEach((button) => button.addEventListener("click", () => adminPatchUser(button.dataset.userBan, { banned: button.dataset.banned !== "true" })));
        $$("[data-user-delete]", content).forEach((button) => button.addEventListener("click", () => adminDeleteUser(button.dataset.userDelete)));
      } else if (state.adminTab === "topics") {
        const data = await api("topics");
        content.innerHTML = adminTable(["主题", "作者", "分类", "回复", "操作"], data.topics.map((topic) => [escapeHtml(topic.title), escapeHtml(topic.authorName), categoryName(topic.category), topic.commentCount, `<span class="admin-row-actions"><button class="button button-ghost" data-admin-topic-edit="${topic.id}">编辑</button><button class="button button-ghost" data-admin-pin="${topic.id}" data-pinned="${topic.pinned}">${topic.pinned ? "取消置顶" : "置顶"}</button><button class="button button-ghost" data-admin-lock="${topic.id}" data-locked="${topic.locked}">${topic.locked ? "解锁" : "锁定"}</button><button class="button button-danger" data-admin-topic-delete="${topic.id}">删除</button></span>`]));
        $$("[data-admin-topic-edit]", content).forEach((button) => button.addEventListener("click", async () => { const data = await api(`topics/${button.dataset.adminTopicEdit}`); closeAdmin(); openEditor(data.topic); }));
        $$("[data-admin-pin]", content).forEach((button) => button.addEventListener("click", () => adminPatchTopic(button.dataset.adminPin, { pinned: button.dataset.pinned !== "true" })));
        $$("[data-admin-lock]", content).forEach((button) => button.addEventListener("click", () => adminPatchTopic(button.dataset.adminLock, { locked: button.dataset.locked !== "true" })));
        $$("[data-admin-topic-delete]", content).forEach((button) => button.addEventListener("click", async () => { await deleteTopic(button.dataset.adminTopicDelete); await renderAdmin(); }));
      } else {
        const data = await api("admin/comments");
        content.innerHTML = adminTable(["评论", "作者", "主题 ID", "时间", "操作"], data.comments.map((comment) => [escapeHtml(comment.content.slice(0, 90)), escapeHtml(comment.authorName), comment.topicId, relativeTime(comment.createdAt), `<span class="admin-row-actions"><button class="button button-ghost" data-admin-comment-edit="${comment.id}">编辑</button><button class="button button-danger" data-admin-comment-delete="${comment.id}">删除</button></span>`]));
        $$("[data-admin-comment-edit]", content).forEach((button) => button.addEventListener("click", async () => { const comment = data.comments.find((item) => item.id === button.dataset.adminCommentEdit); const next = prompt("编辑评论", comment?.content || ""); if (next === null) return; await api(`comments/${button.dataset.adminCommentEdit}`, { method: "PATCH", body: JSON.stringify({ content: next }) }); await renderAdmin(); }));
        $$("[data-admin-comment-delete]", content).forEach((button) => button.addEventListener("click", async () => { await deleteComment(button.dataset.adminCommentDelete); await renderAdmin(); }));
      }
    } catch (error) { content.innerHTML = `<div class="forum-error">${escapeHtml(error.message)}</div>`; }
  }
  function adminTable(headers, rows) { return `<table class="admin-table"><thead><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((item) => `<td>${item}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${headers.length}">暂无数据</td></tr>`}</tbody></table>`; }
  async function adminCreateUser(event) { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { await api("admin/users", { method: "POST", body: JSON.stringify(data) }); await renderAdmin(); } catch (error) { alert(error.message); } }
  async function adminPatchUser(id, patch) { try { await api(`admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }); await renderAdmin(); } catch (error) { alert(error.message); } }
  async function adminDeleteUser(id) { if (!confirm("确认删除该用户？其历史帖子会保留。")) return; try { await api(`admin/users/${id}`, { method: "DELETE", body: "{}" }); await renderAdmin(); } catch (error) { alert(error.message); } }
  async function adminPatchTopic(id, patch) { try { await api(`topics/${id}`, { method: "PATCH", body: JSON.stringify(patch) }); await loadTopics(); await renderAdmin(); } catch (error) { alert(error.message); } }
  function showFeedError(message) { $("[data-forum-feed]").innerHTML = `<div class="forum-error">${escapeHtml(message)}</div>`; }

  $("[data-forum-login]").addEventListener("click", () => openAuth("login"));
  $("[data-forum-auth-button]")?.addEventListener("click", () => openAuth("login"));
  $$("[data-auth-mode]").forEach((button) => button.addEventListener("click", () => setAuthMode(button.dataset.authMode)));
  $("[data-auth-form]").addEventListener("submit", submitAuth);
  $("[data-forum-new]").addEventListener("click", () => openEditor());
  $("[data-editor-close]").addEventListener("click", () => editorDialog.close());
  $("[data-topic-submit]").addEventListener("click", submitTopic);
  $$("[data-forum-filter]").forEach((button) => button.addEventListener("click", () => { state.filter = button.dataset.forumFilter; $$("[data-forum-filter]").forEach((node) => node.classList.toggle("active", node === button)); renderTopics(); }));
  $("[data-forum-admin-nav]")?.addEventListener("click", () => openAdmin());
  $("[data-forum-admin-close]").addEventListener("click", closeAdmin);
  $$("[data-admin-tab]").forEach((button) => button.addEventListener("click", () => openAdmin(button.dataset.adminTab)));
  [authDialog, editorDialog, topicDialog].forEach((dialog) => dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }));
  addEventListener("message", (event) => { if (event.origin !== location.origin || event.source !== editorFrame?.contentWindow || event.data?.source !== "mumu-forum-editor") return; if (event.data.type === "ready") postEditor({ type: "set-content", content: state.editorContent }); if (event.data.type === "change") { state.editorContent = String(event.data.content || ""); updateEditorCount(); } });

  Promise.all([api("session"), api("topics")]).then(([session, data]) => { setSession(session); state.topics = data.topics || []; renderTopics(); if (new URLSearchParams(location.search).has("auth")) openAuth("login"); }).catch((error) => showFeedError(error.message));
})();
