(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function initCategoryBar() {
    const bar = $("#category-bar");
    if (!bar) return;
    const pathname = location.pathname.replace(/\/$/, "") || "/";
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "";
    const isArchive = pathname === "/archive";
    $$(".category-pill", bar).forEach((pill) => {
      const name = pill.dataset.categoryName || "";
      pill.toggleAttribute("data-active", isArchive ? (category ? name === category : name === "__archive__") : name === "");
    });
    const scroll = $(".category-scroll", bar);
    if (!scroll || scroll.dataset.hugoReady) return;
    scroll.dataset.hugoReady = "true";
    const update = () => {
      const overflow = scroll.scrollWidth > scroll.clientWidth + 1;
      $(".scroll-fade-left", bar)?.toggleAttribute("data-visible", overflow && scroll.scrollLeft > 1);
      $(".scroll-fade-right", bar)?.toggleAttribute("data-visible", overflow && scroll.scrollLeft + scroll.clientWidth < scroll.scrollWidth - 1);
    };
    scroll.addEventListener("wheel", (event) => {
      if (scroll.scrollWidth <= scroll.clientWidth) return;
      event.preventDefault();
      scroll.scrollLeft += event.deltaY;
    }, { passive: false });
    scroll.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  function initPostLayout() {
    const container = $("#post-list-container");
    if (!container) return;
    const update = (layout) => {
      const next = layout === "grid" && innerWidth >= 769 ? "grid" : "list";
      container.classList.toggle("grid-mode", next === "grid");
      container.classList.toggle("list-mode", next !== "grid");
      $("#main-grid")?.setAttribute("data-layout-mode", next);
      $(".right-sidebar-container")?.classList.toggle("hidden-in-grid-mode", next === "grid");
    };
    update(localStorage.getItem("postListLayout") || container.dataset.defaultLayout || "list");
    addEventListener("layoutChange", (event) => update(event.detail?.layout));
  }

  function initArchive() {
    const archive = $(".hugo-archive");
    if (!archive) return;
    const params = new URLSearchParams(location.search);
    const categories = params.getAll("category");
    const tags = params.getAll("tag");
    let visibleTotal = 0;
    $$(".archive-year", archive).forEach((year) => {
      let count = 0;
      $$(".archive-entry", year).forEach((entry) => {
        const entryTags = (entry.dataset.tags || "").split("|").filter(Boolean);
        const visible = (!categories.length || categories.includes(entry.dataset.category || "")) && (!tags.length || tags.some((tag) => entryTags.includes(tag)));
        entry.hidden = !visible;
        if (visible) count += 1;
      });
      year.hidden = count === 0;
      const countNode = $("[data-year-count]", year);
      if (countNode) countNode.textContent = String(count);
      visibleTotal += count;
    });
    $("#archive-empty", archive)?.classList.toggle("hidden", visibleTotal !== 0);
  }

  function initArticleBanner() {
    const image = document.documentElement.dataset.articleBanner;
    if (!image) return;
    const carousel = $("#banner-carousel");
    if (!carousel) return;
    carousel.dataset.mobileCount = "1";
    carousel.dataset.desktopCount = "1";
    $$("template", carousel).forEach((template) => template.remove());
    $$("img", carousel).forEach((img) => { img.src = image; img.alt = document.title; });
  }

  function initArticleTools() {
    const share = $("[data-hugo-share]");
    if (share && !share.dataset.hugoReady) {
      share.dataset.hugoReady = "true";
      share.addEventListener("click", async () => {
        const data = { title: document.title, url: location.href };
        if (navigator.share) await navigator.share(data).catch(() => {});
        else await navigator.clipboard?.writeText(location.href);
      });
    }
    const toc = $("#hugo-toc-template");
    const target = $("#toc-container");
    if (toc && target && toc.innerHTML.trim()) target.innerHTML = toc.innerHTML;
    $$("[data-lastmod]").forEach((node) => {
      const elapsed = Math.max(0, Date.now() - new Date(node.dataset.lastmod).getTime());
      const days = Math.floor(elapsed / 86_400_000);
      node.textContent = days ? `${days} 天前` : "今天";
    });
    $$("[data-license-url]").forEach((node) => {
      try { node.textContent = decodeURI(node.dataset.licenseUrl); } catch {}
    });
  }

  function decodeBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  async function decryptArticle(payload, password) {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({
      name: "PBKDF2",
      hash: "SHA-256",
      salt: decodeBase64(payload.salt),
      iterations: payload.iterations,
    }, material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decodeBase64(payload.iv) }, key, decodeBase64(payload.ciphertext));
    return new TextDecoder().decode(plaintext);
  }

  function initEncryptedArticle() {
    const content = $("#hugo-article-content");
    const panel = $("[data-hugo-encrypted-panel]", content || document);
    const payloadNode = $("[data-hugo-encrypted-payload]", content || document);
    if (!content || !panel || !payloadNode || panel.dataset.hugoReady) return;
    panel.dataset.hugoReady = "true";
    const form = $("form", panel);
    const input = $("input", panel);
    const button = $("button", panel);
    const error = $("[role=alert]", panel);
    const storageKey = `hugo-password-${location.pathname}`;
    let payload;
    try { payload = JSON.parse(payloadNode.textContent || "{}"); } catch { return; }

    const unlock = async (password, remember = true) => {
      if (!password) return;
      button.disabled = true;
      button.textContent = "解锁中...";
      error.textContent = "";
      try {
        const html = await decryptArticle(payload, password);
        content.innerHTML = html;
        if (remember) sessionStorage.setItem(storageKey, password);
        $$(".hugo-protected-extras").forEach((node) => { node.hidden = false; });
        document.dispatchEvent(new CustomEvent("password:decrypted"));
      } catch {
        error.textContent = "密码错误，请重试";
        button.disabled = false;
        button.textContent = "解锁";
        if (remember) sessionStorage.removeItem(storageKey);
      }
    };
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      unlock(input?.value || "");
    });
    const saved = sessionStorage.getItem(storageKey);
    if (saved) unlock(saved, false);
  }

  function createVisitorRow(label, id, icon) {
    const row = document.createElement("div");
    row.className = "hugo-visitor-row flex items-center justify-between px-2 py-2";
    row.innerHTML = `<div class="flex items-center gap-2.5 flex-1 min-w-0"><div class="text-[var(--primary)] text-xl shrink-0" aria-hidden="true">${icon}</div><span class="text-neutral-700 dark:text-neutral-300 font-medium text-sm break-words leading-tight">${label}</span></div><div class="flex items-center ml-3 shrink-0"><span class="visitor-state text-base font-bold text-neutral-900 dark:text-neutral-100" data-visitor-stat="${id}">--</span></div>`;
    return row;
  }

  async function updateVisitors() {
    const stats = $("#site-stats .flex.flex-col.gap-1");
    if (!stats) return;
    if (!$("[data-visitor-stat]", stats)) {
      stats.append(createVisitorRow("当前访客", "online", "◉"), createVisitorRow("累计访客", "total", "◎"));
    }
    const visitorId = localStorage.getItem("mumuemhaha-visitor-id") || crypto.randomUUID();
    const sessionId = sessionStorage.getItem("mumuemhaha-session-id") || crypto.randomUUID();
    localStorage.setItem("mumuemhaha-visitor-id", visitorId);
    sessionStorage.setItem("mumuemhaha-session-id", sessionId);
    try {
      const response = await fetch("/api/visitors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ visitorId, sessionId }), cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      $$("[data-visitor-stat=online]").forEach((node) => { node.textContent = Number(data.online || 0).toLocaleString(); });
      $$("[data-visitor-stat=total]").forEach((node) => { node.textContent = Number(data.total || 0).toLocaleString(); });
    } catch {
      $$("[data-visitor-stat]").forEach((node) => { node.textContent = "--"; });
    }
  }

  function init() {
    initCategoryBar();
    initPostLayout();
    initArchive();
    initArticleBanner();
    initArticleTools();
    initEncryptedArticle();
    updateVisitors();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  document.addEventListener("astro:page-load", init);
  document.addEventListener("swup:contentReplaced", init);
  setInterval(updateVisitors, 45_000);
})();
