(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const section = document.body.dataset.section || "home";

  $$(`[data-nav="${section === "posts" ? "blog" : section}"]`).forEach((node) => node.classList.add("active"));

  function initForumAccount() {
    if (section === "discuss") return;
    const accountButton = $("[data-forum-auth-button]");
    const adminButton = $("[data-forum-admin-nav]");
    if (!accountButton) return;
    let user = null;
    accountButton.addEventListener("click", () => { location.href = user ? "/discuss/" : "/discuss/?auth=1"; });
    adminButton?.addEventListener("click", () => { location.href = "/discuss/?admin=1"; });
    fetch("/api/forum/session", { credentials: "same-origin", cache: "no-store", headers: { accept: "application/json" } })
      .then((response) => response.ok ? response.json() : null)
      .then((session) => {
        user = session?.authenticated ? session.user : null;
        const label = accountButton.querySelector("span");
        if (label) label.textContent = user?.username || "论坛账户";
        if (adminButton) adminButton.hidden = user?.role !== "admin";
      })
      .catch(() => {});
  }

  const openSidebar = () => document.body.classList.add("sidebar-open", "no-scroll");
  const closeSidebar = () => document.body.classList.remove("sidebar-open", "no-scroll");
  $$("[data-sidebar-open]").forEach((button) => button.addEventListener("click", openSidebar));
  $$("[data-sidebar-close]").forEach((button) => button.addEventListener("click", closeSidebar));

  function initCursor() {
    if (!matchMedia("(pointer:fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = $(".cursor-dot");
    if (!dot) return;
    addEventListener("pointermove", (event) => {
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      dot.classList.add("visible");
    }, { passive: true });
    document.addEventListener("pointerover", (event) => dot.classList.toggle("active", Boolean(event.target.closest("a,button,input,textarea,select"))));
    document.addEventListener("pointerleave", () => dot.classList.remove("visible"));
  }

  function initHome() {
    const rain = $(".home-rain");
    if (rain && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < 20; index += 1) {
        const line = document.createElement("span");
        line.className = "rain-line";
        line.style.left = `${(index * 13 + 7) % 103}%`;
        line.style.animationDuration = `${3.8 + (index % 6) * .65}s`;
        line.style.animationDelay = `${-(index % 9) * .7}s`;
        fragment.append(line);
      }
      rain.append(fragment);
    }
    const clock = $("#home-clock");
    if (clock) {
      const update = () => { clock.textContent = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "medium", hour12: false }).format(new Date()); };
      update();
      setInterval(update, 1000);
    }
    if ($("#home-visitors")) updateVisitors();
  }

  async function updateVisitors() {
    const visitorId = localStorage.getItem("mumuemhaha-visitor-id") || crypto.randomUUID();
    const sessionId = sessionStorage.getItem("mumuemhaha-session-id") || crypto.randomUUID();
    localStorage.setItem("mumuemhaha-visitor-id", visitorId);
    sessionStorage.setItem("mumuemhaha-session-id", sessionId);
    try {
      const response = await fetch("/api/visitors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitorId, sessionId }), cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      $$('[data-visitor-stat="online"]').forEach((node) => { node.textContent = Number(data.online || 0).toLocaleString(); });
      $$('[data-visitor-stat="total"]').forEach((node) => { node.textContent = Number(data.total || 0).toLocaleString(); });
    } catch {
      $$('[data-visitor-stat]').forEach((node) => { node.textContent = "--"; });
    }
  }

  let pagefindPromise;
  window.loadPagefind = () => {
    if (!pagefindPromise) pagefindPromise = import("/pagefind/pagefind.js").then(async (module) => { await module.init(); return module; });
    return pagefindPromise;
  };

  function initSearch() {
    const dialog = $("#search-dialog");
    const input = $("#search-input");
    const results = $("#search-results");
    const hint = $("#search-hint");
    if (!dialog || !input || !results || !hint) return;
    const open = () => { dialog.showModal(); window.loadPagefind().catch(() => {}); setTimeout(() => input.focus(), 20); };
    $("#search-open")?.addEventListener("click", open);
    $$("[data-search-trigger]").forEach((button) => button.addEventListener("click", open));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    let request = 0;
    input.addEventListener("input", async () => {
      const query = input.value.trim();
      const current = ++request;
      results.replaceChildren();
      hint.textContent = query ? "正在搜索..." : "输入关键词开始搜索";
      if (!query) return;
      try {
        const pagefind = await window.loadPagefind();
        const search = await pagefind.search(query);
        if (current !== request) return;
        const items = await Promise.all(search.results.slice(0, 12).map((result) => result.data()));
        hint.textContent = items.length ? `找到 ${search.results.length} 个结果` : "没有找到相关内容";
        for (const item of items) {
          const link = document.createElement("a");
          link.className = "search-result";
          link.href = item.url;
          const title = document.createElement("strong");
          title.textContent = item.meta?.title || item.url;
          const excerpt = document.createElement("p");
          excerpt.innerHTML = item.excerpt || "";
          link.append(title, excerpt);
          results.append(link);
        }
      } catch {
        hint.textContent = "搜索索引暂时不可用，请稍后重试";
      }
    });
  }

  function initTools() {
    $$("[data-tool-tab]").forEach((button) => button.addEventListener("click", () => {
      $$("[data-tool-tab]").forEach((node) => node.classList.toggle("active", node === button));
      $$("[data-tool-panel]").forEach((node) => node.classList.toggle("active", node.dataset.toolPanel === button.dataset.toolTab));
    }));
    const jsonInput = $("[data-json-input]");
    const jsonMessage = $("[data-json-message]");
    const transformJson = (space) => {
      try { jsonInput.value = JSON.stringify(JSON.parse(jsonInput.value), null, space); jsonMessage.textContent = "JSON 有效"; jsonMessage.classList.remove("error"); }
      catch (error) { jsonMessage.textContent = `格式错误：${error.message}`; jsonMessage.classList.add("error"); }
    };
    $("[data-json-format]")?.addEventListener("click", () => transformJson(2));
    $("[data-json-minify]")?.addEventListener("click", () => transformJson(0));
    $("[data-time-to-date]")?.addEventListener("click", () => {
      const raw = Number($("[data-time-input]")?.value);
      const date = new Date(String(Math.trunc(raw)).length <= 10 ? raw * 1000 : raw);
      const message = $("[data-time-message]");
      if (!Number.isFinite(raw) || Number.isNaN(date.getTime())) { message.textContent = "请输入有效时间戳"; message.classList.add("error"); return; }
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      $("[data-date-input]").value = local;
      message.textContent = date.toLocaleString("zh-CN", { hour12: false });
      message.classList.remove("error");
    });
    $("[data-date-to-time]")?.addEventListener("click", () => {
      const date = new Date($("[data-date-input]")?.value || "");
      const message = $("[data-time-message]");
      if (Number.isNaN(date.getTime())) { message.textContent = "请选择有效日期"; message.classList.add("error"); return; }
      const seconds = Math.floor(date.getTime() / 1000);
      $("[data-time-input]").value = String(seconds);
      message.textContent = `${seconds}（秒） / ${date.getTime()}（毫秒）`;
      message.classList.remove("error");
    });
    $("[data-text-input]")?.addEventListener("input", (event) => {
      const value = event.target.value;
      const words = value.trim() ? (value.match(/[\p{Script=Han}]|[\p{L}\p{N}_'-]+/gu) || []).length : 0;
      const values = { chars: [...value].length, words, lines: value ? value.split(/\r?\n/).length : 0, paragraphs: value.trim() ? value.trim().split(/\n\s*\n/).length : 0 };
      Object.entries(values).forEach(([key, count]) => { const node = $(`[data-stat="${key}"]`); if (node) node.textContent = String(count); });
    });
  }

  function decodeBase64(value) { return Uint8Array.from(atob(value), (character) => character.charCodeAt(0)); }
  async function decryptArticle(payload, password) {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: decodeBase64(payload.salt), iterations: payload.iterations }, material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decodeBase64(payload.iv) }, key, decodeBase64(payload.ciphertext));
    return new TextDecoder().decode(plaintext);
  }
  function initArticle() {
    $("[data-hugo-share]")?.addEventListener("click", async () => {
      if (navigator.share) await navigator.share({ title: document.title, url: location.href }).catch(() => {});
      else await navigator.clipboard?.writeText(location.href);
    });
    const content = $("#hugo-article-content");
    const panel = $("[data-hugo-encrypted-panel]", content || document);
    const payloadNode = $("[data-hugo-encrypted-payload]", content || document);
    if (!content || !panel || !payloadNode) return;
    const form = $("form", panel); const input = $("input", panel); const button = $("button", panel); const error = $("[role=alert]", panel);
    let payload; try { payload = JSON.parse(payloadNode.textContent || "{}"); } catch { return; }
    form?.addEventListener("submit", async (event) => {
      event.preventDefault(); button.disabled = true; error.textContent = "";
      try { content.innerHTML = await decryptArticle(payload, input.value); }
      catch { error.textContent = "密码错误，请重试"; button.disabled = false; }
    });
  }

  initCursor();
  initForumAccount();
  initHome();
  initSearch();
  initTools();
  initArticle();
})();
