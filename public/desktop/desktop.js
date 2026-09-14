(() => {
  "use strict";

  const root = document.getElementById("hypr-desktop");
  const viewport = document.getElementById("workspace-viewport");
  const layer = document.getElementById("windows-layer");
  const template = document.getElementById("window-template");
  const titleLabel = document.getElementById("waybar-title");
  const launcher = document.getElementById("launcher");
  const launcherInput = document.getElementById("launcher-input");
  const launcherGrid = document.getElementById("launcher-grid");
  const layoutToggle = document.querySelector("[data-layout-toggle]");
  const quickSettings = document.getElementById("quick-settings");
  const calendarPanel = document.getElementById("calendar-panel");
  const contextMenu = document.getElementById("desktop-context");
  const selectionBox = document.getElementById("desktop-selection");
  const toastRegion = document.getElementById("toast-region");
  const wallpaperImage = document.getElementById("wallpaper-image");
  const wallpaperMobile = document.getElementById("wallpaper-mobile");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const archLogo = `<svg class="archlinux-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4c-1.3 3.2-2.1 5.3-3.6 8.5.9-.9 2.1-1.6 3.6-1.6s2.7.7 3.6 1.6C14.1 7.7 13.3 5.6 12 2.4Zm-5.2 12c-1.1 2-2.5 4.3-4.8 7.2 3.2-1.8 6-2.7 8.2-2.8-.7-.6-1.2-1.4-1.2-2.3 0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5c0 .9-.5 1.7-1.2 2.3 2.2.1 5 .9 8.2 2.8-2.3-2.9-3.7-5.2-4.8-7.2-1.4-1.3-3.2-2.1-5.2-2.1s-3.8.8-5.2 2.1Z"/></svg>`;

  const apps = {
    welcome: { title: "欢迎", subtitle: "Hyprland Desktop", icon: "△", kind: "welcome" },
    home: { title: "首页", subtitle: "vmss.cn", icon: "⌂", kind: "home" },
    blog: { title: "博客", subtitle: "文章与笔记", icon: "▤", kind: "blog" },
    tools: { title: "工具箱", subtitle: "本地实用工具", icon: "⌘", kind: "tools" },
    friends: { title: "友情链接", subtitle: "朋友们的站点", icon: "⌁", kind: "friends" },
    guestbook: { title: "留言板", subtitle: "访客留言", icon: "◌", kind: "guestbook" },
    archive: { title: "文章归档", subtitle: "时间轴", icon: "◫", kind: "archive" },
    terminal: { title: "终端", subtitle: "zsh · mumu@arch", icon: ">_", kind: "terminal" }
  };
  const launcherOrder = ["home", "blog", "tools", "friends", "guestbook", "archive", "terminal", "welcome"];
  const terminalCommands = [
    "help", "commands", "man", "neofetch", "fastfetch", "ls", "tree", "pwd", "date", "whoami",
    "hostname", "id", "uname", "uptime", "free", "df", "ps", "ip", "ping", "cat", "which",
    "pacman", "sudo", "echo", "printf", "history", "open", "xdg-open", "cd", "workspace", "ws",
    "layout", "tile", "wallpaper", "wall", "fortune", "quote", "matrix", "about", "clear", "close",
    "exit", "home", "classic", "logout",
  ];
  const wallpaperCount = 6;
  const windows = new Map();
  const focusStack = new Map();
  let activeWorkspace = 1;
  let activeWindowId = null;
  let serial = 0;
  let topZ = 20;
  let toastLayoutFrame = 0;
  let layoutMode = "stacked";
  let wallpaperIndex = clamp(Number(localStorage.getItem("hypr-wallpaper") || 3), 1, wallpaperCount);
  let launcherMatches = launcherOrder.slice();
  let launcherCursor = 0;
  const localDataCache = new Map();
  const toolEntries = [
    { icon: "{}", title: "JSON 格式化", description: "校验、格式化或压缩 JSON 数据。", url: "/tools/json-formatter/" },
    { icon: "64", title: "Base64 编解码", description: "支持中文和 Emoji 的本地编码、解码。", url: "/tools/base64/" },
    { icon: "字", title: "文本统计", description: "实时统计字符、字词、行数和段落。", url: "/tools/text-stats/" },
    { icon: "时", title: "时间戳转换", description: "Unix 时间戳与本地日期双向转换。", url: "/tools/timestamp/" },
    { icon: "ID", title: "UUID 生成器", description: "一次生成指定数量的随机 UUID。", url: "/tools/uuid/" },
    { icon: "⇄", title: "GitHub / Docker 加速", description: "使用镜像加速服务。", url: "/tools/docker-accelerator/" },
    { icon: "兽", title: "兽音译者", description: "普通文本与四字符兽音双向转换。", url: "/tools/beast-translator/" },
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function appForWindow(element) {
    return apps[element?.dataset.app || "welcome"] || apps.welcome;
  }

  function currentWindows(workspace = activeWorkspace) {
    return [...windows.values()].filter(element => Number(element.dataset.workspace) === Number(workspace) && !element.classList.contains("is-closing"));
  }

  function focusedWindow(workspace = activeWorkspace) {
    const remembered = focusStack.get(Number(workspace));
    const rememberedWindow = remembered && windows.get(remembered);
    if (rememberedWindow && !rememberedWindow.classList.contains("is-closing")) return rememberedWindow;
    return currentWindows(workspace).at(-1) || null;
  }

  function updateWaybar() {
    const active = windows.get(activeWindowId) || focusedWindow();
    const app = active ? appForWindow(active) : null;
    titleLabel.querySelector("strong").textContent = app ? `${app.title} — ${app.subtitle}` : `Hyprland Desktop · 工作区 ${activeWorkspace}`;
    root.dataset.workspace = String(activeWorkspace);
    root.dataset.activeWorkspace = String(activeWorkspace);
    root.dataset.windowCount = String(windows.size);
    document.querySelectorAll("[data-workspace-target]").forEach(button => {
      const workspace = Number(button.dataset.workspaceTarget);
      button.classList.toggle("is-active", workspace === activeWorkspace);
      button.classList.toggle("has-windows", currentWindows(workspace).length > 0);
      button.setAttribute("aria-current", workspace === activeWorkspace ? "true" : "false");
    });
    document.querySelectorAll(".hypr-dock [data-app]").forEach(button => {
      const matching = [...windows.values()].filter(element => element.dataset.app === button.dataset.app);
      button.classList.toggle("is-running", matching.length > 0);
      button.classList.toggle("is-focused", matching.some(element => element.dataset.windowId === activeWindowId));
    });
    if (layoutToggle) {
      const stacked = layoutMode === "stacked";
      layoutToggle.setAttribute("aria-pressed", String(stacked));
      layoutToggle.setAttribute("aria-label", stacked ? "切换为液态平铺布局" : "切换为集中堆叠布局");
      layoutToggle.querySelector(".layout-mode-label").textContent = stacked ? "集中堆叠" : "液态平铺";
    }
  }

  function setRect(element, rect) {
    element.style.left = `${Math.round(rect.x)}px`;
    element.style.top = `${Math.round(rect.y)}px`;
    element.style.width = `${Math.max(1, Math.round(rect.width))}px`;
    element.style.height = `${Math.max(1, Math.round(rect.height))}px`;
  }

  function dwindle(items, rect, gap = Math.max(0, Number.parseFloat(getComputedStyle(root).getPropertyValue("--window-gap")) || 0)) {
    if (!items.length) return;
    if (items.length === 1) {
      setRect(items[0], rect);
      return;
    }
    const vertical = rect.width > rect.height * 1.08;
    const ratio = items.length === 2 ? .5 : .54;
    if (vertical) {
      const firstWidth = (rect.width - gap) * ratio;
      setRect(items[0], { x: rect.x, y: rect.y, width: firstWidth, height: rect.height });
      dwindle(items.slice(1), { x: rect.x + firstWidth + gap, y: rect.y, width: rect.width - firstWidth - gap, height: rect.height }, gap);
    } else {
      const firstHeight = (rect.height - gap) * ratio;
      setRect(items[0], { x: rect.x, y: rect.y, width: rect.width, height: firstHeight });
      dwindle(items.slice(1), { x: rect.x, y: rect.y + firstHeight + gap, width: rect.width, height: rect.height - firstHeight - gap }, gap);
    }
  }

  function focusWindow(element) {
    if (!element || element.classList.contains("is-closing")) return;
    const workspace = Number(element.dataset.workspace);
    if (workspace !== activeWorkspace) switchWorkspace(workspace);
    activeWindowId = element.dataset.windowId;
    focusStack.set(activeWorkspace, activeWindowId);
    currentWindows().forEach(windowElement => windowElement.classList.toggle("is-focused", windowElement === element));
    element.style.zIndex = String(++topZ);
    updateWaybar();
  }

  function switchWorkspace(target) {
    const next = clamp(Number(target) || 1, 1, 5);
    if (next === activeWorkspace) {
      focusWindow(focusedWindow(next));
      return;
    }
    const previous = activeWorkspace;
    activeWorkspace = next;
    windows.forEach(element => {
      const workspace = Number(element.dataset.workspace);
      const isCurrent = workspace === activeWorkspace;
      const direction = workspace < activeWorkspace ? -1 : 1;
      element.style.setProperty("--workspace-x", `${direction * Math.min(window.innerWidth * .22, 260)}px`);
      element.classList.toggle("is-workspace-hidden", !isCurrent);
      element.setAttribute("aria-hidden", isCurrent ? "false" : "true");
    });
    activeWindowId = focusedWindow(next)?.dataset.windowId || null;
    currentWindows().forEach(element => element.classList.toggle("is-focused", element.dataset.windowId === activeWindowId));
    applyLayoutMode(next);
    updateWaybar();
    if (!reducedMotion.matches) {
      viewport.animate(
        [{ transform: `translateX(${next > previous ? 10 : -10}px)` }, { transform: "translateX(0)" }],
        { duration: 390, easing: "cubic-bezier(.22,.88,.25,1)" }
      );
    }
  }

  function welcomeMarkup() {
    return `
      <div class="welcome-app">
        <div class="welcome-heading"><div class="welcome-mark">${archLogo}</div><div><p>ARCH LINUX · HYPRLAND</p><h1>木木em哈哈的桌面工作区</h1></div></div>
        <p class="welcome-copy">这是一个启发于 Arch Linux + Hyprland，让你更加方便地浏览博客中的各个网页（甚至可以做到嵌套运行）。</p>
        <div class="shortcut-row"><span><kbd>Alt</kbd><kbd>Space</kbd> 启动器</span><span><kbd>Alt</kbd><kbd>Enter</kbd> 终端</span><span><kbd>Alt</kbd><kbd>1–5</kbd> 工作区</span><span><kbd>Alt</kbd><kbd>G</kbd> 堆叠/平铺</span><span><kbd>Alt</kbd><kbd>Q</kbd> 关闭</span><span><kbd>Alt</kbd><kbd>B</kbd> 返回经典模式</span></div>
      </div>`;
  }

  function safeLocalURL(value, allowedPrefixes = ["/"]) {
    try {
      const url = new URL(String(value || "/"), location.origin);
      if (url.origin !== location.origin || !allowedPrefixes.some(prefix => url.pathname.startsWith(prefix))) return null;
      return url;
    } catch (_) {
      return null;
    }
  }

  async function fetchLocalJSON(path) {
    const url = safeLocalURL(path, ["/api/"]);
    if (!url) throw new Error("已拒绝非本站数据地址");
    if (!localDataCache.has(url.pathname)) {
      localDataCache.set(url.pathname, fetch(url, { credentials: "same-origin" }).then(response => {
        if (!response.ok) throw new Error(`读取失败（${response.status}）`);
        return response.json();
      }).catch(error => {
        localDataCache.delete(url.pathname);
        throw error;
      }));
    }
    return localDataCache.get(url.pathname);
  }

  function localAssetPath(value) {
    const url = safeLocalURL(value);
    return url ? `${url.pathname}${url.search}` : "";
  }

  function formatPostDate(post) {
    if (post.date) return String(post.date).replaceAll("-", ".");
    const date = new Date(Number(post.published));
    return Number.isNaN(date.valueOf()) ? "" : date.toLocaleDateString("zh-CN").replaceAll("/", ".");
  }

  function nativePostCard(post) {
    const image = localAssetPath(post.image);
    const tags = (Array.isArray(post.tags) ? post.tags : []).slice(0, 3);
    return `<article class="native-post-card${post.pinned ? " is-pinned" : ""}">
      <button type="button" data-post-url="${escapeHTML(post.url)}" aria-label="阅读 ${escapeHTML(post.title)}">
        <span class="native-post-cover">${image ? `<img src="${escapeHTML(image)}" alt="" loading="lazy" decoding="async">` : "<span>▤</span>"}</span>
        <span class="native-post-body">
          <span class="native-post-meta">${post.pinned ? "置顶 · " : ""}${escapeHTML(formatPostDate(post))}${post.category ? ` · ${escapeHTML(post.category)}` : ""}</span>
          <strong>${escapeHTML(post.title)}</strong>
          <span class="native-post-description">${escapeHTML(post.description || "打开阅读全文")}</span>
          <span class="native-post-foot"><span>${tags.map(tag => `#${escapeHTML(tag)}`).join("　")}</span><i aria-hidden="true">→</i></span>
        </span>
      </button>
    </article>`;
  }

  function nativePageShell(className, eyebrow, title, actions = "") {
    const wrapper = document.createElement("section");
    wrapper.className = `native-app ${className}`;
    wrapper.innerHTML = `<header class="native-page-header"><div><p>${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1></div>${actions}</header><div class="native-scroll" data-native-scroll></div>`;
    return wrapper;
  }

  function setWindowHeading(element, title, subtitle) {
    element.querySelector(".window-app-title").textContent = title;
    element.querySelector(".window-app-subtitle").textContent = subtitle;
  }

  function bindPostLinks(wrapper, element, restore) {
    wrapper.addEventListener("click", event => {
      const target = event.target.closest("[data-post-url]");
      if (!target) return;
      event.preventDefault();
      renderNativeArticle(element, target.dataset.postUrl, restore);
    });
  }

  async function createHomeApp(element) {
    const wrapper = nativePageShell("native-home-app", "WELCOME / 2026", "木木em哈哈", '<button class="native-header-action" type="button" data-open-app="blog">全部文章 →</button>');
    const scroll = wrapper.querySelector("[data-native-scroll]");
    scroll.innerHTML = '<div class="native-loading-state"><span></span><p>正在读取本站内容</p></div>';
    wrapper.addEventListener("click", event => {
      const appButton = event.target.closest("[data-open-app]");
      if (appButton) openApp(appButton.dataset.openApp);
    });
    bindPostLinks(wrapper, element, () => createHomeApp(element));
    try {
      const posts = await fetchLocalJSON("/api/allPostMeta.json");
      scroll.innerHTML = `<section class="native-home-intro"><p>不乱于心，不困于情，不畏将来，不惧过去</p><strong>${posts.length}</strong><span>篇文章</span></section>
        <div class="native-section-heading"><h2>最近更新</h2><span>${escapeHTML(posts[0]?.date || "")}</span></div>
        <div class="native-post-grid">${posts.slice(0, 6).map(nativePostCard).join("")}</div>`;
    } catch (error) {
      scroll.innerHTML = `<div class="native-error-state"><strong>内容暂时无法读取</strong><p>${escapeHTML(error.message)}</p><button type="button" data-native-retry>重新加载</button></div>`;
      scroll.querySelector("[data-native-retry]")?.addEventListener("click", () => createHomeApp(element).then(next => wrapper.replaceWith(next)));
    }
    return wrapper;
  }

  async function createBlogApp(element) {
    const wrapper = nativePageShell("native-blog-app", "WRITING / NOTES", "博客");
    const scroll = wrapper.querySelector("[data-native-scroll]");
    scroll.innerHTML = '<div class="native-loading-state"><span></span><p>正在读取文章列表</p></div>';
    try {
      const posts = await fetchLocalJSON("/api/allPostMeta.json");
      const categories = [...new Set(posts.map(post => post.category).filter(Boolean))];
      let query = "";
      let category = "";
      let page = 1;
      const restore = () => createBlogApp(element);
      const render = () => {
        const pageSize = matchMedia("(max-width: 680px)").matches ? 10 : 30;
        const normalized = query.trim().toLowerCase();
        const filtered = posts.filter(post => {
          const searchable = `${post.title} ${post.description || ""} ${post.category || ""} ${(post.tags || []).join(" ")}`.toLowerCase();
          return (!normalized || searchable.includes(normalized)) && (!category || post.category === category);
        });
        const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
        page = clamp(page, 1, pageCount);
        const pagePosts = filtered.slice((page - 1) * pageSize, page * pageSize);
        scroll.innerHTML = `<div class="native-blog-tools">
            <label class="native-search"><span aria-hidden="true">⌕</span><input type="search" value="${escapeHTML(query)}" placeholder="搜索文章" aria-label="搜索文章"></label>
            <label class="native-select"><span>分类</span><select aria-label="筛选分类"><option value="">全部</option>${categories.map(item => `<option value="${escapeHTML(item)}"${item === category ? " selected" : ""}>${escapeHTML(item)}</option>`).join("")}</select></label>
          </div>
          <div class="native-result-line"><span>共 ${filtered.length} 篇</span><span>第 ${page} / ${pageCount} 页</span></div>
          <div class="native-post-grid">${pagePosts.map(nativePostCard).join("") || '<p class="native-empty-state">没有匹配的文章</p>'}</div>
          <nav class="native-pagination" aria-label="文章分页"><button type="button" data-page="prev" ${page <= 1 ? "disabled" : ""} aria-label="上一页">←</button><span>${page} / ${pageCount}</span><button type="button" data-page="next" ${page >= pageCount ? "disabled" : ""} aria-label="下一页">→</button></nav>`;
      };
      wrapper.addEventListener("input", event => {
        if (!event.target.matches(".native-search input")) return;
        query = event.target.value;
        page = 1;
        render();
        scroll.querySelector(".native-search input")?.focus();
      });
      wrapper.addEventListener("change", event => {
        if (!event.target.matches(".native-select select")) return;
        category = event.target.value;
        page = 1;
        render();
      });
      wrapper.addEventListener("click", event => {
        const pager = event.target.closest("[data-page]");
        if (!pager || pager.disabled) return;
        page += pager.dataset.page === "next" ? 1 : -1;
        render();
        scroll.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
      });
      bindPostLinks(wrapper, element, restore);
      render();
    } catch (error) {
      scroll.innerHTML = `<div class="native-error-state"><strong>文章列表读取失败</strong><p>${escapeHTML(error.message)}</p></div>`;
    }
    return wrapper;
  }

  async function createArchiveApp(element) {
    const wrapper = nativePageShell("native-archive-app", "ARCHIVE", "文章归档");
    const scroll = wrapper.querySelector("[data-native-scroll]");
    scroll.innerHTML = '<div class="native-loading-state"><span></span><p>正在整理归档</p></div>';
    try {
      const posts = await fetchLocalJSON("/api/allPostMeta.json");
      const years = posts.reduce((groups, post) => {
        const year = String(post.date || "未标注").slice(0, 4);
        if (!groups.has(year)) groups.set(year, []);
        groups.get(year).push(post);
        return groups;
      }, new Map());
      scroll.innerHTML = [...years].map(([year, items]) => `<section class="native-archive-year"><header><strong>${escapeHTML(year)}</strong><span>${items.length} 篇</span></header><div>${items.map(post => `<button type="button" data-post-url="${escapeHTML(post.url)}"><time>${escapeHTML((post.date || "").slice(5).replace("-", "."))}</time><span>${post.pinned ? "⌖ " : ""}${escapeHTML(post.title)}</span><i>→</i></button>`).join("")}</div></section>`).join("");
      bindPostLinks(wrapper, element, () => createArchiveApp(element));
    } catch (error) {
      scroll.innerHTML = `<div class="native-error-state"><strong>归档读取失败</strong><p>${escapeHTML(error.message)}</p></div>`;
    }
    return wrapper;
  }

  async function createFriendsApp() {
    const wrapper = nativePageShell("native-friends-app", "CONNECTIONS", "友情链接", '<a class="native-header-action" href="/friends/">申请友链 →</a>');
    const scroll = wrapper.querySelector("[data-native-scroll]");
    scroll.innerHTML = '<div class="native-loading-state"><span></span><p>正在读取友链</p></div>';
    try {
      const data = await fetchLocalJSON("/api/friends.json");
      scroll.innerHTML = `<div class="native-friend-grid">${data.items.map(friend => `<a class="native-friend" href="${escapeHTML(friend.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHTML(friend.name.slice(0, 1).toUpperCase())}</span><strong>${escapeHTML(friend.name)}</strong><small>${escapeHTML(friend.description || "访问站点")}</small><i>↗</i></a>`).join("")}</div>`;
    } catch (error) {
      scroll.innerHTML = `<div class="native-error-state"><strong>友链读取失败</strong><p>${escapeHTML(error.message)}</p></div>`;
    }
    return wrapper;
  }

  function createToolsApp() {
    const wrapper = nativePageShell("native-tools-app", "LOCAL UTILITIES", "工具箱");
    wrapper.querySelector("[data-native-scroll]").innerHTML = `<div class="native-tool-grid">${toolEntries.map(tool => `<a class="native-tool" href="${tool.url}"><span>${escapeHTML(tool.icon)}</span><strong>${escapeHTML(tool.title)}</strong><small>${escapeHTML(tool.description)}</small><i>→</i></a>`).join("")}</div>`;
    return wrapper;
  }

  function createGuestbookApp() {
    const wrapper = nativePageShell("native-guestbook-app", "MESSAGES", "留言板");
    wrapper.querySelector("[data-native-scroll]").innerHTML = '<div class="native-route-panel"><span>◌</span><strong>访客留言</strong><p>留言验证与提交将在站内完整页面中完成。</p><a href="/guestbook/">进入留言板 →</a></div>';
    return wrapper;
  }

  function sanitizeArticleFragment(fragment) {
    fragment.querySelectorAll("script, style, link, meta, base, form, object, embed").forEach(node => node.remove());
    fragment.querySelectorAll("*").forEach(node => {
      [...node.attributes].forEach(attribute => {
        if (/^on/i.test(attribute.name) || attribute.name === "srcdoc") node.removeAttribute(attribute.name);
        if (attribute.name === "style" && /url\s*\(/i.test(attribute.value)) node.removeAttribute("style");
      });
      if (node.matches("iframe")) {
        const source = safeLocalURL(node.getAttribute("src"));
        if (!source) node.remove();
        else {
          node.src = `${source.pathname}${source.search}`;
          node.setAttribute("sandbox", "allow-scripts allow-forms allow-pointer-lock allow-popups");
          node.setAttribute("loading", "lazy");
        }
      }
      if (node.matches("img, source, video, audio")) {
        const source = safeLocalURL(node.getAttribute("src"));
        if (node.hasAttribute("src") && !source) node.remove();
        else if (source) node.setAttribute("src", `${source.pathname}${source.search}`);
        node.removeAttribute("srcset");
        if (node.hasAttribute("poster")) {
          const poster = safeLocalURL(node.getAttribute("poster"));
          if (poster) node.setAttribute("poster", `${poster.pathname}${poster.search}`);
          else node.removeAttribute("poster");
        }
      }
      if (node.matches("a")) {
        const href = node.getAttribute("href") || "";
        if (/^(?:javascript|data):/i.test(href)) node.removeAttribute("href");
        else {
          try {
            const target = new URL(href || "/", location.origin);
            if (target.origin === location.origin) node.setAttribute("href", `${target.pathname}${target.search}${target.hash}`);
            else if (/^https?:$/.test(target.protocol)) {
              node.setAttribute("target", "_blank");
              node.setAttribute("rel", "noopener noreferrer");
            } else node.removeAttribute("href");
          } catch (_) {
            node.removeAttribute("href");
          }
        }
      }
    });
    return fragment;
  }

  async function renderNativeArticle(element, path, restore) {
    const url = safeLocalURL(path, ["/posts/"]);
    if (!url) {
      showToast("无法打开", "只允许读取本站文章");
      return;
    }
    const content = element.querySelector(".window-content");
    content.innerHTML = '<section class="native-app native-reader"><div class="native-loading-state"><span></span><p>正在读取文章</p></div></section>';
    try {
      const response = await fetch(url, { credentials: "same-origin" });
      if (!response.ok) throw new Error(`文章读取失败（${response.status}）`);
      const documentPage = new DOMParser().parseFromString(await response.text(), "text/html");
      const source = documentPage.querySelector("#hugo-article-content");
      if (!source) throw new Error("文章正文不存在");
      const fragment = sanitizeArticleFragment(source.cloneNode(true));
      const title = documentPage.querySelector(".article-header h1")?.textContent?.trim() || documentPage.title || "文章";
      const meta = documentPage.querySelector(".article-meta")?.textContent?.replace(/\s+/g, " ").trim() || "本站文章";
      const reader = nativePageShell("native-reader", "ARTICLE", title, '<button class="native-header-action" type="button" data-reader-back>← 返回</button>');
      const scroll = reader.querySelector("[data-native-scroll]");
      scroll.innerHTML = `<p class="native-reader-meta">${escapeHTML(meta)}</p><article class="native-article-body markdown-content"></article>`;
      scroll.querySelector(".native-article-body").append(...fragment.childNodes);
      reader.querySelector("[data-reader-back]").addEventListener("click", async () => {
        const restored = await restore();
        content.replaceChildren(restored);
        setWindowHeading(element, apps[element.dataset.app].title, apps[element.dataset.app].subtitle);
      });
      reader.addEventListener("click", event => {
        const anchor = event.target.closest("a[href]");
        if (!anchor) return;
        const target = new URL(anchor.href, location.origin);
        if (target.origin === location.origin && target.pathname.startsWith("/posts/")) {
          event.preventDefault();
          renderNativeArticle(element, target.pathname, restore);
        }
      });
      content.replaceChildren(reader);
      setWindowHeading(element, title, "本站文章");
    } catch (error) {
      content.innerHTML = `<section class="native-app native-reader"><div class="native-error-state"><strong>文章无法打开</strong><p>${escapeHTML(error.message)}</p><button type="button" data-reader-back>返回列表</button></div></section>`;
      content.querySelector("[data-reader-back]")?.addEventListener("click", async () => content.replaceChildren(await restore()));
    }
  }

  function createTerminalContent(element) {
    const wrapper = document.createElement("div");
    wrapper.className = "terminal-app";
    wrapper.innerHTML = `<div class="terminal-output"><span class="term-accent">mumu-desktop</span> <span class="term-green">ready</span>\n输入 <span class="term-pink">help</span> 查看命令。支持应用别名、工作区和桌面控制。\n\n</div><form class="terminal-command"><span class="terminal-prompt">mumu@arch ~ ❯</span><input aria-label="终端命令" autocomplete="off" spellcheck="false"></form>`;
    const output = wrapper.querySelector(".terminal-output");
    const form = wrapper.querySelector("form");
    const input = wrapper.querySelector("input");
    const commandHistory = [];
    let historyIndex = 0;
    form.addEventListener("submit", event => {
      event.preventDefault();
      const command = input.value.trim();
      input.value = "";
      if (!command) return;
      if (commandHistory.at(-1) !== command) commandHistory.push(command);
      historyIndex = commandHistory.length;
      const commandLine = document.createElement("div");
      commandLine.textContent = `mumu@arch ~ ❯ ${command}`;
      output.append(commandLine);
      runTerminalCommand(command, output, element, commandHistory);
      output.scrollTop = output.scrollHeight;
    });
    input.addEventListener("keydown", event => {
      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        output.textContent = "";
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (!commandHistory.length) return;
        event.preventDefault();
        historyIndex = event.key === "ArrowUp"
          ? Math.max(0, historyIndex - 1)
          : Math.min(commandHistory.length, historyIndex + 1);
        input.value = historyIndex === commandHistory.length ? "" : commandHistory[historyIndex];
        input.setSelectionRange(input.value.length, input.value.length);
        return;
      }
      if (event.key === "Tab") {
        const prefix = input.value.slice(0, input.selectionStart ?? input.value.length).trim().toLowerCase();
        if (!prefix || /\s/.test(prefix)) return;
        event.preventDefault();
        const matches = terminalCommands.filter(command => command.startsWith(prefix));
        if (matches.length === 1) {
          input.value = `${matches[0]} `;
          input.setSelectionRange(input.value.length, input.value.length);
        } else if (matches.length > 1) {
          appendTerminal(output, matches.join("  "));
          output.scrollTop = output.scrollHeight;
        }
      }
    });
    wrapper.addEventListener("pointerdown", () => setTimeout(() => input.focus(), 0));
    return wrapper;
  }

  function appendTerminal(output, value) {
    const line = document.createElement("div");
    line.textContent = value;
    output.append(line);
  }

  function returnToClassic() {
    if (root.dataset.returnState === "collapsing") return;
    sessionStorage.setItem("desktop-returned-to-classic", "true");
    root.dataset.returnState = "collapsing";
    const trigger = document.activeElement?.closest?.("[data-return-classic]") || document.querySelector(".hypr-dock [data-return-classic]");
    const triggerRect = trigger?.getBoundingClientRect();
    const target = {
      x: triggerRect ? triggerRect.left + triggerRect.width / 2 : window.innerWidth / 2,
      y: triggerRect ? triggerRect.top + triggerRect.height / 2 : window.innerHeight - 34,
    };
    const overlay = document.createElement("div");
    overlay.className = "classic-return-transition";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-label", "正在切回原来的样式");
    overlay.style.setProperty("--return-x", `${target.x}px`);
    overlay.style.setProperty("--return-y", `${target.y}px`);
    overlay.innerHTML = `<div class="classic-return-target">${archLogo}<span></span></div><div class="classic-return-message"><strong>RETURNING TO CLASSIC</strong><small>正在切回原来的样式</small></div>`;
    root.append(overlay);

    currentWindows().forEach((windowElement, index) => {
      const rect = windowElement.getBoundingClientRect();
      const ghost = document.createElement("span");
      ghost.className = "classic-return-window";
      Object.assign(ghost.style, {
        left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
        "--return-dx": `${target.x - (rect.left + rect.width / 2)}px`,
        "--return-dy": `${target.y - (rect.top + rect.height / 2)}px`,
        "--return-rotate": `${(index % 2 ? 1 : -1) * (4 + index * 1.5)}deg`,
        "--return-delay": `${index * 45}ms`,
      });
      overlay.prepend(ghost);
    });

    if (reducedMotion.matches) {
      overlay.classList.add("is-reduced-motion");
      setTimeout(() => window.location.assign("/"), 220);
      return;
    }
    requestAnimationFrame(() => overlay.classList.add("is-active"));
    setTimeout(() => { overlay.dataset.phase = "ready"; }, 720);
    setTimeout(() => window.location.assign("/"), 1_180);
  }

  function terminalHelp(output) {
    appendTerminal(output, "可用命令：");
    appendTerminal(output, "  help / commands / man           查看帮助");
    appendTerminal(output, "  neofetch / fastfetch            查看桌面环境信息");
    appendTerminal(output, "  ls [apps|workspaces] · tree     浏览应用与工作区");
    appendTerminal(output, "  open <应用> · cd <应用|~>       打开页面；cd ~ 返回经典模式");
    appendTerminal(output, "  workspace <1-5> / ws <1-5>     切换工作区");
    appendTerminal(output, "  layout [stacked|tiled]          设置或切换窗口布局");
    appendTerminal(output, "  wallpaper [next|1-6]            切换壁纸");
    appendTerminal(output, "  cat <文件> · which <命令>       查看静态文件与命令路径");
    appendTerminal(output, "  free -h · df -h · ps · ip a    常用 Linux 状态格式");
    appendTerminal(output, "  pacman [-Q|-Syu] · sudo         Arch 命令静态演示");
    appendTerminal(output, "  fortune · quote · matrix        趣味内容");
    appendTerminal(output, "  pwd · date · whoami · hostname · id · uname · uptime");
    appendTerminal(output, "  echo · printf · ping · history · clear · about");
    appendTerminal(output, "  close / exit                    关闭终端窗口");
    appendTerminal(output, "  home / classic / logout         返回经典博客模式");
    appendTerminal(output, "快捷键：↑/↓ 回看历史 · Tab 补全 · Ctrl+L 清屏");
  }

  function resolveApp(value = "") {
    const normalized = value.trim().toLowerCase();
    const aliases = {
      首页: "home", 博客: "blog", 工具: "tools", 工具箱: "tools", 友链: "friends", 友情链接: "friends",
      留言: "guestbook", 留言板: "guestbook", 归档: "archive", 文章归档: "archive", 终端: "terminal", 欢迎: "welcome",
    };
    return apps[normalized] ? normalized : aliases[normalized] || "";
  }

  function runTerminalCommand(command, output, element, commandHistory = []) {
    const [rawName, ...args] = command.trim().split(/\s+/);
    const name = rawName.toLowerCase();
    const argument = args.join(" ");
    if (name === "clear") {
      output.textContent = "";
    } else if (name === "help" || name === "commands" || name === "man") {
      terminalHelp(output);
    } else if (name === "neofetch" || name === "fastfetch") {
      appendTerminal(output, "       /\\        mumu@arch\n      /  \\       OS: Arch Linux (web)\n     /\\   \\      WM: Hyprland Desktop\n    /      \\     Shell: zsh\n   /   ,,   \\    Resolution: " + `${window.innerWidth}x${window.innerHeight}` + "\n  /   |  |  -\\   CPU: " + `${navigator.hardwareConcurrency || "?"} logical cores`);
    } else if (name === "ls") {
      if (args[0] === "workspaces" || args[0] === "ws") appendTerminal(output, "1  2  3  4  5");
      else appendTerminal(output, "home  blog  tools  friends  guestbook  archive  terminal  welcome");
    } else if (name === "tree") {
      appendTerminal(output, ".\n├── home\n├── blog\n├── tools\n├── friends\n├── guestbook\n├── archive\n├── terminal\n└── welcome");
    } else if (name === "pwd") {
      appendTerminal(output, `/home/mumu/workspace-${activeWorkspace}`);
    } else if (name === "date") {
      appendTerminal(output, new Date().toLocaleString("zh-CN", { hour12: false }));
    } else if (name === "whoami") {
      appendTerminal(output, "mumu");
    } else if (name === "hostname") {
      appendTerminal(output, "mumu-hypr");
    } else if (name === "id") {
      appendTerminal(output, "uid=1000(mumu) gid=1000(mumu) groups=1000(mumu),998(wheel)");
    } else if (name === "uname") {
      appendTerminal(output, args.includes("-a") ? "Arch Linux web 6.12-hyprliquid x86_64 GNU/Linux" : "Arch Linux");
    } else if (name === "uptime") {
      appendTerminal(output, `up ${Math.max(1, Math.floor(performance.now() / 60000))} min, 1 user, load average: 0.08, 0.05, 0.03`);
    } else if (name === "free") {
      appendTerminal(output, "               total        used        free      shared  buff/cache   available\nMem:            16Gi       3.2Gi       8.7Gi       128Mi       4.1Gi        12Gi\nSwap:          4.0Gi          0B       4.0Gi");
    } else if (name === "df") {
      appendTerminal(output, "Filesystem      Size  Used Avail Use% Mounted on\n/dev/web          64G   11G   50G  18% /\ntmpfs            7.8G  128K  7.8G   1% /tmp");
    } else if (name === "ps") {
      appendTerminal(output, "  PID TTY          TIME CMD\n 1000 pts/0    00:00:00 zsh\n 1024 pts/0    00:00:01 hypr-desktop\n 1058 pts/0    00:00:00 ps");
    } else if (name === "ip") {
      appendTerminal(output, "1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: web0: <BROWSER,UP> mtu 1500\n    inet 浏览器沙盒（静态演示）");
    } else if (name === "ping") {
      const host = argument || "vmss.cn";
      appendTerminal(output, `PING ${host}（静态演示）\n64 bytes from edge: time=12.4 ms\n64 bytes from edge: time=11.8 ms\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`);
    } else if (name === "cat") {
      const target = argument.replace(/^['"]|['"]$/g, "");
      if (target === "/etc/os-release" || target === "etc/os-release") {
        appendTerminal(output, 'NAME="Arch Linux"\nPRETTY_NAME="Arch Linux"\nID=arch\nBUILD_ID=rolling\nHOME_URL="https://archlinux.org/"');
      } else if (target.toLowerCase() === "readme.md" || target.toLowerCase() === "readme") {
        appendTerminal(output, "# Mumu Hyprland Desktop\n这是一个启发于 Arch Linux + Hyprland 的浏览器动态窗口工作区。");
      } else if (target === "shortcuts" || target === "shortcuts.txt") {
        appendTerminal(output, "Alt+Space 启动器\nAlt+Enter 终端\nAlt+1–5 工作区\nAlt+G 堆叠/平铺\nAlt+B 返回经典模式\nAlt+Q 关闭窗口");
      } else {
        appendTerminal(output, `cat: ${target || "(空)"}: No such static file；可查看 /etc/os-release、README.md 或 shortcuts`);
      }
    } else if (name === "which") {
      const requested = (args[0] || "").toLowerCase();
      appendTerminal(output, terminalCommands.includes(requested) ? `/usr/bin/${requested}` : `${requested || "(空)"} not found`);
    } else if (name === "pacman") {
      if (args.includes("-Q") || args.includes("-Qe")) {
        appendTerminal(output, "hyprland 0.51.1-1\nwaybar 0.13.0-1\nzsh 5.9-5\nastro-blog current");
      } else if (args.some(value => value === "-Syu" || value === "-S")) {
        appendTerminal(output, ":: 正在同步软件包数据库…（静态演示）\n core、extra、multilib 均为最新；浏览器终端不会安装或修改本机软件。");
      } else {
        appendTerminal(output, "用法：pacman -Q 查看静态软件清单；pacman -Syu 查看更新演示");
      }
    } else if (name === "sudo") {
      appendTerminal(output, "sudo: 此终端运行在浏览器沙盒中，不会申请系统权限或执行真实命令。");
    } else if (name === "echo" || name === "printf") {
      appendTerminal(output, argument);
    } else if (name === "history") {
      appendTerminal(output, commandHistory.map((entry, index) => `${index + 1}  ${entry}`).join("\n") || "history: 当前会话还没有命令");
    } else if (name === "fortune" || name === "quote") {
      const quotes = [
        "保持好奇，让每一次打开都通向新的页面。",
        "清晰的目录让知识可被再次找到。",
        "今天写下的一小段，可能正是明天需要的答案。",
      ];
      appendTerminal(output, quotes[commandHistory.length % quotes.length]);
    } else if (name === "matrix") {
      appendTerminal(output, "01001000 01111001 01110000 01110010\n00100000 01101100 01101001 01110001\n浏览器矩阵已连接：工作区保持稳定。");
    } else if (name === "about") {
      appendTerminal(output, "Mumu Hyprland Desktop\n启发于 Arch Linux + Hyprland，用窗口化方式浏览博客、工具、友链与归档页面。");
    } else if (name === "open" || name === "xdg-open") {
      const appName = resolveApp(args[0]);
      if (appName) openApp(appName);
      else appendTerminal(output, `未找到应用：${args[0] || "(空)"}；输入 ls 查看名称`);
    } else if (name === "cd") {
      if (!argument || argument === "~" || argument === "/" || argument === "/home" || argument === "/home/mumu") {
        returnToClassic();
        return;
      }
      else {
        const appName = resolveApp(argument.replace(/^\/+|\/+$/g, ""));
        if (appName) openApp(appName);
        else appendTerminal(output, `cd: no such app or directory: ${argument}`);
      }
    } else if (name === "workspace" || name === "ws") {
      const workspace = Number(args[0]);
      if (workspace >= 1 && workspace <= 5) switchWorkspace(workspace);
      else appendTerminal(output, "工作区编号应为 1–5");
    } else if (name === "layout" || name === "tile") {
      const requested = (args[0] || "toggle").toLowerCase();
      const targetMode = requested === "stack" || requested === "stacked" ? "stacked" : requested === "tile" || requested === "tiled" ? "tiled" : "";
      if (requested === "toggle") toggleLayoutMode();
      else if (!targetMode) appendTerminal(output, "用法：layout [stacked|tiled]；不带参数时切换布局");
      else if (targetMode !== layoutMode) toggleLayoutMode();
      else appendTerminal(output, `当前已经是${layoutMode === "stacked" ? "集中堆叠" : "液态平铺"}布局`);
    } else if (name === "wallpaper" || name === "wall") {
      const requested = args[0];
      if (!requested || requested === "next") setWallpaper(wallpaperIndex + 1);
      else if (/^[1-6]$/.test(requested)) setWallpaper(Number(requested));
      else appendTerminal(output, "壁纸编号应为 1–6，或使用 wallpaper next");
    } else if (name === "close" || name === "exit") {
      closeWindow(element);
      return;
    } else if (name === "home" || name === "classic" || name === "logout") {
      returnToClassic();
      return;
    } else {
      appendTerminal(output, `zsh: command not found: ${name}`);
    }
    focusWindow(element);
  }

  async function attachWindowContent(element, app) {
    const content = element.querySelector(".window-content");
    if (app.kind === "welcome") {
      content.innerHTML = welcomeMarkup();
      element.classList.add("is-loaded");
      return;
    }
    if (app.kind === "terminal") {
      content.append(createTerminalContent(element));
      element.classList.add("is-loaded");
      setTimeout(() => content.querySelector("input")?.focus(), 350);
      return;
    }
    const factories = {
      home: () => createHomeApp(element),
      blog: () => createBlogApp(element),
      tools: () => createToolsApp(),
      friends: () => createFriendsApp(),
      guestbook: () => createGuestbookApp(),
      archive: () => createArchiveApp(element),
    };
    try {
      const view = await factories[app.kind]?.();
      if (!view) throw new Error("应用视图不存在");
      content.replaceChildren(view);
    } catch (error) {
      content.innerHTML = `<div class="native-error-state"><strong>应用无法打开</strong><p>${escapeHTML(error.message)}</p></div>`;
    }
    element.classList.add("is-loaded");
  }

  function applyLayoutMode(workspace = activeWorkspace) {
    const items = currentWindows(workspace);
    if (!items.length) return;
    const bounds = layer.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    if (layoutMode === "tiled") {
      items.forEach((element, index) => {
        element.classList.remove("is-floating", "is-maximized");
        element.style.zIndex = String(20 + index);
      });
      dwindle(items, { x: 0, y: 0, width: bounds.width, height: bounds.height });
    } else if (innerWidth <= 680) {
      items.forEach((element, index) => {
        element.classList.add("is-floating");
        element.classList.remove("is-maximized");
        setRect(element, { x: 0, y: 0, width: bounds.width, height: bounds.height });
        element.style.zIndex = String(20 + index);
      });
    } else {
      items.forEach(element => {
        element.classList.add("is-floating");
        element.classList.remove("is-maximized");
      });
      const width = clamp(bounds.width * .72, Math.min(620, bounds.width - 16), bounds.width - 16);
      const height = clamp(bounds.height * .76, Math.min(430, bounds.height - 16), bounds.height - 16);
      const count = items.length;
      const shiftX = count > 1 ? Math.min(32, Math.max(0, (bounds.width - width - 18) / (count - 1))) : 0;
      const shiftY = count > 1 ? Math.min(25, Math.max(0, (bounds.height - height - 18) / (count - 1))) : 0;
      const startX = Math.max(8, (bounds.width - width - shiftX * (count - 1)) / 2);
      const startY = Math.max(8, (bounds.height - height - shiftY * (count - 1)) / 2);
      items.forEach((element, index) => {
        setRect(element, { x: startX + shiftX * index, y: startY + shiftY * index, width, height });
        element.style.zIndex = String(20 + index);
      });
    }
    const active = windows.get(activeWindowId) || focusedWindow(workspace);
    if (active) active.style.zIndex = String(++topZ);
  }

  function toggleLayoutMode() {
    layoutMode = layoutMode === "stacked" ? "tiled" : "stacked";
    root.dataset.layoutMode = layoutMode;
    applyLayoutMode(activeWorkspace);
    updateWaybar();
    showToast("窗口布局", layoutMode === "stacked" ? "已集中堆叠；再按 Alt + G 平铺" : "已液态平铺并填满工作区");
  }

  function openApp(appId, options = {}) {
    const app = apps[appId];
    if (!app) return;
    const existing = [...windows.values()].find(element => element.dataset.app === appId && !element.classList.contains("is-closing"));
    if (existing && options.allowDuplicate !== true) {
      focusWindow(existing);
      return existing;
    }
    const fragment = template.content.cloneNode(true);
    const element = fragment.querySelector(".hypr-window");
    const id = `${appId}-${++serial}`;
    element.dataset.windowId = id;
    element.dataset.app = appId;
    element.dataset.workspace = String(options.workspace || activeWorkspace);
    element.querySelector(".window-app-icon").textContent = app.icon;
    element.querySelector(".window-app-title").textContent = app.title;
    element.querySelector(".window-app-subtitle").textContent = app.subtitle;
    element.setAttribute("aria-label", `${app.title}窗口`);
    if (Number(element.dataset.workspace) !== activeWorkspace) element.classList.add("is-workspace-hidden");
    layer.append(element);
    windows.set(id, element);
    bindWindow(element);
    attachWindowContent(element, app);
    element.classList.add("is-opening");
    setTimeout(() => element.classList.remove("is-opening"), 520);
    applyLayoutMode(Number(element.dataset.workspace));
    focusWindow(element);
    updateWaybar();
    return element;
  }

  function closeWindow(element) {
    if (!element || element.classList.contains("is-closing")) return;
    const id = element.dataset.windowId;
    const workspace = Number(element.dataset.workspace);
    element.classList.add("is-closing");
    if (activeWindowId === id) activeWindowId = null;
    setTimeout(() => {
      windows.delete(id);
      element.remove();
      const next = focusedWindow(workspace);
      if (workspace === activeWorkspace && next) focusWindow(next);
      else updateWaybar();
      applyLayoutMode(workspace);
    }, reducedMotion.matches ? 10 : 270);
  }

  function bindWindow(element) {
    element.addEventListener("pointerdown", () => focusWindow(element));
    element.querySelector(".window-controls").addEventListener("click", event => {
      const action = event.target.closest("[data-window-action]")?.dataset.windowAction;
      if (action === "close") closeWindow(element);
      if (action === "layout") toggleLayoutMode();
    });
    const titlebar = element.querySelector(".window-titlebar");
    titlebar.addEventListener("dblclick", event => {
      if (!event.target.closest("button")) toggleLayoutMode();
    });
    titlebar.addEventListener("pointerdown", event => {
      if (event.button !== 0 || event.target.closest("button") || layoutMode !== "stacked") return;
      event.preventDefault();
      focusWindow(element);
      const layerRect = layer.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const start = { x: event.clientX, y: event.clientY, left: rect.left - layerRect.left, top: rect.top - layerRect.top };
      titlebar.setPointerCapture(event.pointerId);
      element.style.transition = "none";
      const move = moveEvent => {
        const left = clamp(start.left + moveEvent.clientX - start.x, 0, Math.max(0, layerRect.width - rect.width));
        const top = clamp(start.top + moveEvent.clientY - start.y, 0, Math.max(0, layerRect.height - rect.height));
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
      };
      const finish = () => {
        titlebar.removeEventListener("pointermove", move);
        titlebar.removeEventListener("pointerup", finish);
        titlebar.removeEventListener("pointercancel", finish);
        element.style.transition = "";
      };
      titlebar.addEventListener("pointermove", move);
      titlebar.addEventListener("pointerup", finish);
      titlebar.addEventListener("pointercancel", finish);
    });
  }

  function cycleFocus(direction) {
    const items = currentWindows();
    if (!items.length) return;
    const index = items.findIndex(element => element.dataset.windowId === activeWindowId);
    focusWindow(items[(index + direction + items.length) % items.length]);
  }

  function syncToastViewport() {
    const hasToast = toastRegion.childElementCount > 0;
    root.classList.toggle("has-active-toast", hasToast);
    if (hasToast) {
      const toastRect = toastRegion.getBoundingClientRect();
      const bottomOffset = Math.max(0, window.innerHeight - toastRect.bottom);
      root.style.setProperty("--mobile-toast-reserve", `${Math.ceil(toastRect.height + bottomOffset + 8)}px`);
    } else {
      root.style.removeProperty("--mobile-toast-reserve");
    }
    if (window.innerWidth <= 680) {
      if (hasToast) root.classList.add("is-toast-layout-sync");
      cancelAnimationFrame(toastLayoutFrame);
      toastLayoutFrame = requestAnimationFrame(() => {
        applyLayoutMode(activeWorkspace);
        toastLayoutFrame = requestAnimationFrame(() => root.classList.remove("is-toast-layout-sync"));
      });
    }
  }

  function showToast(title, message, duration = 2600) {
    const toast = document.createElement("div");
    toast.className = "desktop-toast";
    toast.innerHTML = `<span>△</span><div><strong>${escapeHTML(title)}</strong><small>${escapeHTML(message)}</small></div>`;
    toastRegion.append(toast);
    syncToastViewport();
    setTimeout(() => toast.classList.add("is-leaving"), duration);
    setTimeout(() => {
      toast.remove();
      syncToastViewport();
    }, duration + 320);
  }

  function renderLauncher(query = "") {
    const normalized = query.trim().toLowerCase();
    launcherMatches = launcherOrder.filter(id => {
      const app = apps[id];
      return !normalized || `${id} ${app.title} ${app.subtitle}`.toLowerCase().includes(normalized);
    });
    launcherCursor = clamp(launcherCursor, 0, Math.max(0, launcherMatches.length - 1));
    launcherGrid.replaceChildren(...launcherMatches.map((id, index) => {
      const app = apps[id];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `launcher-app${index === launcherCursor ? " is-keyboard-active" : ""}`;
      button.dataset.launcherApp = id;
      button.innerHTML = `<span class="launcher-app-icon">${escapeHTML(app.icon)}</span><strong>${escapeHTML(app.title)}</strong><small>${escapeHTML(app.subtitle)}</small>`;
      return button;
    }));
  }

  function openLauncher() {
    closePanels();
    launcher.hidden = false;
    launcherCursor = 0;
    launcherInput.value = "";
    renderLauncher();
    requestAnimationFrame(() => launcherInput.focus());
  }

  function closeLauncher() {
    launcher.hidden = true;
  }

  function closePanels(except = null) {
    if (except !== quickSettings) quickSettings.hidden = true;
    if (except !== calendarPanel) calendarPanel.hidden = true;
    contextMenu.hidden = true;
  }

  function togglePanel(panel) {
    const willOpen = panel.hidden;
    closePanels(panel);
    panel.hidden = !willOpen;
  }

  function setWallpaper(index, announce = true) {
    wallpaperIndex = ((Number(index) - 1 + wallpaperCount) % wallpaperCount) + 1;
    wallpaperImage.classList.add("is-changing");
    const desktopSrc = `/assets/desktop-banner/${wallpaperIndex}.webp`;
    const mobileSrc = `/assets/mobile-banner/${wallpaperIndex}.webp`;
    const preload = new Image();
    preload.onload = () => {
      wallpaperImage.src = desktopSrc;
      wallpaperMobile.srcset = mobileSrc;
      requestAnimationFrame(() => wallpaperImage.classList.remove("is-changing"));
    };
    preload.onerror = () => wallpaperImage.classList.remove("is-changing");
    preload.src = coarsePointer.matches ? mobileSrc : desktopSrc;
    localStorage.setItem("hypr-wallpaper", String(wallpaperIndex));
    if (announce) showToast("壁纸已切换", `桌面背景 ${wallpaperIndex} / ${wallpaperCount}`);
  }

  function updateClock() {
    const now = new Date();
    document.getElementById("bar-clock").textContent = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
    document.getElementById("bar-date").textContent = now.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
    document.getElementById("calendar-time").textContent = now.toLocaleTimeString("zh-CN", { hour12: false });
    document.getElementById("calendar-date").textContent = now.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
    document.getElementById("calendar-week").textContent = now.toLocaleDateString("zh-CN", { weekday: "long" });
  }

  function updateConnection() {
    const online = navigator.onLine;
    document.getElementById("network-label").textContent = online ? "在线" : "离线";
    document.querySelector(".connection-pill").classList.toggle("is-offline", !online);
    if (!online) showToast("网络已断开", "本地桌面仍可继续操作");
  }

  function initEntrySequence() {
    const entry = document.getElementById("desktop-entry-sequence");
    if (!document.documentElement.classList.contains("from-classic")) {
      entry?.remove();
      return;
    }
    root.dataset.entryState = "barrage";
    setTimeout(() => {
      entry?.remove();
      document.documentElement.classList.remove("from-classic");
      root.dataset.entryState = "complete";
      const cleanUrl = new URL(location.href);
      cleanUrl.searchParams.delete("from");
      history.replaceState(null, "", cleanUrl);
    }, 1_950);
  }

  document.querySelectorAll("[data-workspace-target]").forEach(button => button.addEventListener("click", () => switchWorkspace(button.dataset.workspaceTarget)));
  layoutToggle?.addEventListener("click", toggleLayoutMode);
  document.querySelectorAll("[data-return-classic]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault();
      returnToClassic();
    }));
  document.querySelectorAll("[data-launcher-open]").forEach(button => button.addEventListener("click", openLauncher));
  document.querySelectorAll(".hypr-dock [data-app]").forEach(button => button.addEventListener("click", () => openApp(button.dataset.app)));
  document.querySelectorAll(".desktop-icon").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".desktop-icon").forEach(icon => icon.classList.remove("is-selected"));
      button.classList.add("is-selected");
      if (coarsePointer.matches || innerWidth <= 680) openApp(button.dataset.app);
    });
    button.addEventListener("dblclick", () => openApp(button.dataset.app));
    button.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") openApp(button.dataset.app);
    });
  });
  document.querySelector("[data-quick-settings]").addEventListener("click", () => togglePanel(quickSettings));
  document.querySelector("[data-calendar-toggle]").addEventListener("click", () => togglePanel(calendarPanel));
  document.querySelectorAll("[data-panel-close]").forEach(button => button.addEventListener("click", closePanels));
  document.querySelector("[data-wallpaper-next]").addEventListener("click", () => setWallpaper(wallpaperIndex + 1));
  document.querySelector("[data-brightness]").addEventListener("input", event => {
    const value = Number(event.target.value);
    root.style.setProperty("--wallpaper-brightness", String(value / 100));
    event.target.nextElementSibling.value = `${value}%`;
  });
  document.querySelector("[data-volume-toggle]").addEventListener("click", event => {
    const label = document.getElementById("volume-label");
    const muted = label.textContent === "静音";
    label.textContent = muted ? "68%" : "静音";
    event.currentTarget.classList.toggle("is-muted", !muted);
    showToast("声音", muted ? "音量已恢复至 68%" : "已静音界面音效");
  });

  launcher.addEventListener("pointerdown", event => {
    if (event.target === launcher) closeLauncher();
  });
  launcherInput.addEventListener("input", () => { launcherCursor = 0; renderLauncher(launcherInput.value); });
  launcherGrid.addEventListener("click", event => {
    const appButton = event.target.closest("[data-launcher-app]");
    if (!appButton) return;
    closeLauncher();
    openApp(appButton.dataset.launcherApp);
  });
  launcherInput.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      launcherCursor = (launcherCursor + (event.key === "ArrowDown" ? 1 : -1) + launcherMatches.length) % Math.max(1, launcherMatches.length);
      renderLauncher(launcherInput.value);
    } else if (event.key === "Enter" && launcherMatches[launcherCursor]) {
      closeLauncher();
      openApp(launcherMatches[launcherCursor]);
    }
  });

  viewport.addEventListener("contextmenu", event => {
    if (event.target.closest(".hypr-window, .desktop-icon")) return;
    event.preventDefault();
    closePanels();
    const width = 225;
    const height = 170;
    contextMenu.style.left = `${clamp(event.clientX, 8, window.innerWidth - width - 8)}px`;
    contextMenu.style.top = `${clamp(event.clientY, 56, window.innerHeight - height - 8)}px`;
    contextMenu.hidden = false;
  });
  contextMenu.addEventListener("click", event => {
    const action = event.target.closest("[data-context-action]")?.dataset.contextAction;
    contextMenu.hidden = true;
    if (action === "terminal") openApp("terminal");
    if (action === "launcher") openLauncher();
    if (action === "wallpaper") setWallpaper(wallpaperIndex + 1);
    if (action === "home") returnToClassic();
  });

  viewport.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.target.closest("button, .hypr-window, .hypr-dock")) return;
    closePanels();
    document.querySelectorAll(".desktop-icon").forEach(icon => icon.classList.remove("is-selected"));
    const rect = viewport.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    selectionBox.hidden = false;
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = "0";
    selectionBox.style.height = "0";
    viewport.setPointerCapture(event.pointerId);
    const move = moveEvent => {
      const x = clamp(moveEvent.clientX - rect.left, 0, rect.width);
      const y = clamp(moveEvent.clientY - rect.top, 0, rect.height);
      selectionBox.style.left = `${Math.min(startX, x)}px`;
      selectionBox.style.top = `${Math.min(startY, y)}px`;
      selectionBox.style.width = `${Math.abs(x - startX)}px`;
      selectionBox.style.height = `${Math.abs(y - startY)}px`;
    };
    const finish = () => {
      selectionBox.hidden = true;
      viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", finish);
      viewport.removeEventListener("pointercancel", finish);
    };
    viewport.addEventListener("pointermove", move);
    viewport.addEventListener("pointerup", finish);
    viewport.addEventListener("pointercancel", finish);
  });

  document.addEventListener("pointerdown", event => {
    if (!event.target.closest(".desktop-context")) contextMenu.hidden = true;
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeLauncher();
      closePanels();
      return;
    }
    if (!event.altKey) return;
    const key = event.key.toLowerCase();
    if (/^[1-5]$/.test(key)) {
      event.preventDefault();
      switchWorkspace(Number(key));
    } else if (key === " ") {
      event.preventDefault();
      openLauncher();
    } else if (key === "enter") {
      event.preventDefault();
      openApp("terminal");
    } else if (key === "q") {
      event.preventDefault();
      closeWindow(windows.get(activeWindowId));
    } else if (key === "g") {
      event.preventDefault();
      toggleLayoutMode();
    } else if (key === "b") {
      event.preventDefault();
      returnToClassic();
    } else if (key === "arrowright" || key === "arrowdown") {
      event.preventDefault();
      cycleFocus(1);
    } else if (key === "arrowleft" || key === "arrowup") {
      event.preventDefault();
      cycleFocus(-1);
    }
  });

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      for (let workspace = 1; workspace <= 5; workspace += 1) applyLayoutMode(workspace);
    });
  });
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);

  updateClock();
  updateConnection();
  initEntrySequence();
  setInterval(updateClock, 1000);
  document.getElementById("hardware-label").textContent = `Hyprland · ${navigator.hardwareConcurrency || "?"}T`;
  setWallpaper(wallpaperIndex, false);
  renderLauncher();
  updateWaybar();
  requestAnimationFrame(() => {
    openApp("welcome");
    root.dataset.desktopReady = "true";
    setTimeout(() => document.getElementById("desktop-hint").classList.add("is-dismissed"), 7000);
    setTimeout(() => showToast("桌面已就绪", "双击图标，或按 Alt + Space 打开应用"), 650);
  });
})();
