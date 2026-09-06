(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const section = document.body.dataset.section || "home";
  const language = document.body.dataset.lang || "zh";
  const locale = language === "ja" ? "ja-JP" : language === "en" ? "en-US" : "zh-CN";
  const messages = {
    zh: {
      searchLoading: "正在搜索...", searchHint: "输入关键词开始搜索", searchCount: (count) => `找到 ${count} 个结果`,
      searchEmpty: "没有找到相关内容", searchError: "搜索索引暂时不可用，请稍后重试",
      previous: "上一页", next: "下一页", page: (page) => `第 ${page} 页`, pageSummary: (page, total) => `第 ${page} / ${total} 页`,
      articlePagination: "文章分页", passwordError: "密码错误，请重试",
    },
    en: {
      searchLoading: "Searching...", searchHint: "Enter a keyword to search", searchCount: (count) => `${count} results found`,
      searchEmpty: "No matching content", searchError: "The search index is temporarily unavailable",
      previous: "Previous page", next: "Next page", page: (page) => `Page ${page}`, pageSummary: (page, total) => `Page ${page} of ${total}`,
      articlePagination: "Article pages", passwordError: "Incorrect password. Please try again.",
    },
    ja: {
      searchLoading: "検索中...", searchHint: "キーワードを入力してください", searchCount: (count) => `${count} 件見つかりました`,
      searchEmpty: "該当する内容がありません", searchError: "検索インデックスを一時的に利用できません",
      previous: "前のページ", next: "次のページ", page: (page) => `${page} ページ`, pageSummary: (page, total) => `${page} / ${total} ページ`,
      articlePagination: "記事ページ", passwordError: "パスワードが違います。もう一度お試しください。",
    },
  }[language] || null;
  const text = messages || {
    searchLoading: "Searching...", searchHint: "Enter a keyword to search", searchCount: (count) => `${count} results found`,
    searchEmpty: "No matching content", searchError: "The search index is temporarily unavailable",
    previous: "Previous page", next: "Next page", page: (page) => `Page ${page}`, pageSummary: (page, total) => `Page ${page} of ${total}`,
    articlePagination: "Article pages", passwordError: "Incorrect password. Please try again.",
  };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const numberFormatter = new Intl.NumberFormat(locale);
  const statAnimations = new WeakMap();
  const umami = {
    origin: "https://umami.vmss.cn",
    shareId: "hJgv7MWzlfs3JTnu",
    websiteId: "993c6970-8f42-4804-a055-38b6b9c01810",
    cacheKey: "mumu-umami-share-v1",
    cacheLifetime: 30 * 60 * 1000,
    shareRequest: null,
  };

  $$(`[data-nav="${section === "posts" ? "blog" : section}"]`).forEach((node) => node.classList.add("active"));

  const openSidebar = () => document.body.classList.add("sidebar-open", "no-scroll");
  const closeSidebar = () => document.body.classList.remove("sidebar-open", "no-scroll");
  $$("[data-sidebar-open]").forEach((button) => button.addEventListener("click", openSidebar));
  $$("[data-sidebar-close]").forEach((button) => button.addEventListener("click", closeSidebar));

  function initCursor() {
    if (!matchMedia("(pointer:fine)").matches || reducedMotion.matches) return;
    const dot = $(".cursor-dot");
    if (!dot) return;
    document.body.classList.add("has-custom-cursor");
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
    if (rain && !reducedMotion.matches) {
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
      const update = () => { clock.textContent = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium", hour12: false }).format(new Date()); };
      update();
      setInterval(update, 1000);
    }
    initTypewriter();
    if ($("#home-visitors")) {
      $$('[data-umami-stat]').forEach((node) => { node.textContent = "0"; });
      updateUmamiStats();
      setInterval(updateUmamiStats, 60_000);
    }
  }

  function initTypewriter() {
    $$('[data-typewriter]').forEach((node) => {
      const output = $("[data-typewriter-output]", node);
      const characters = [...(node.dataset.typewriter || "")];
      if (!output || !characters.length || reducedMotion.matches) return;
      const typeInterval = 500;
      const eraseInterval = 60;
      let position = 0;
      node.classList.add("is-typing");
      output.textContent = "";
      const type = () => {
        position += 1;
        output.textContent = characters.slice(0, position).join("");
        if (position < characters.length) setTimeout(type, typeInterval);
        else setTimeout(erase, 2_000);
      };
      const erase = () => {
        position -= 1;
        output.textContent = characters.slice(0, Math.max(0, position)).join("");
        if (position > 0) setTimeout(erase, eraseInterval);
        else setTimeout(type, typeInterval);
      };
      setTimeout(type, typeInterval);
    });
  }

  function readCachedUmamiShare() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(umami.cacheKey) || "null");
      if (cached?.websiteId === umami.websiteId && cached.token && Date.now() - cached.cachedAt < umami.cacheLifetime) return cached;
    } catch {}
    return null;
  }

  function getUmamiShare() {
    const cached = readCachedUmamiShare();
    if (cached) return Promise.resolve(cached);
    if (!umami.shareRequest) {
      umami.shareRequest = fetch(`${umami.origin}/api/share/${umami.shareId}`, { cache: "force-cache" })
        .then(async (response) => {
          if (!response.ok) throw new Error(String(response.status));
          const share = await response.json();
          if (share.websiteId !== umami.websiteId || !share.token) throw new Error("Invalid Umami share response");
          const cachedShare = { websiteId: share.websiteId, token: share.token, cachedAt: Date.now() };
          try { sessionStorage.setItem(umami.cacheKey, JSON.stringify(cachedShare)); } catch {}
          return cachedShare;
        })
        .catch((error) => { umami.shareRequest = null; throw error; });
    }
    return umami.shareRequest;
  }

  function animateStatistic(node, target) {
    const safeTarget = Math.max(0, Number(target) || 0);
    const previous = Number(node.dataset.umamiValue || 0);
    const startValue = node.dataset.umamiReady === "true" ? previous : 0;
    node.dataset.umamiValue = String(safeTarget);
    node.dataset.umamiReady = "false";
    const activeAnimation = statAnimations.get(node);
    if (activeAnimation) cancelAnimationFrame(activeAnimation);
    if (reducedMotion.matches || startValue === safeTarget) {
      node.textContent = numberFormatter.format(safeTarget);
      node.dataset.umamiReady = "true";
      return;
    }
    const startedAt = performance.now();
    const render = (now) => {
      const progress = Math.min(1, (now - startedAt) / 3_000);
      const eased = 1 - (1 - progress) ** 3;
      const value = Math.round(startValue + (safeTarget - startValue) * eased);
      node.textContent = numberFormatter.format(value);
      if (progress < 1) statAnimations.set(node, requestAnimationFrame(render));
      else {
        statAnimations.delete(node);
        node.dataset.umamiReady = "true";
      }
    };
    statAnimations.set(node, requestAnimationFrame(render));
  }

  async function updateUmamiStats() {
    try {
      const share = await getUmamiShare();
      const headers = { "x-umami-share-token": share.token };
      const endAt = Date.now();
      const [activeResponse, statsResponse] = await Promise.all([
        fetch(`${umami.origin}/api/websites/${umami.websiteId}/active`, { headers, cache: "no-store" }),
        fetch(`${umami.origin}/api/websites/${umami.websiteId}/stats?startAt=0&endAt=${endAt}&timezone=Asia%2FShanghai&compare=false`, { headers, cache: "no-store" }),
      ]);
      if (!activeResponse.ok || !statsResponse.ok) throw new Error("Umami statistics are unavailable");
      const [active, stats] = await Promise.all([activeResponse.json(), statsResponse.json()]);
      const values = { active: active.visitors, visitors: stats.visitors, visits: stats.visits };
      Object.entries(values).forEach(([key, value]) => {
        $$(`[data-umami-stat="${key}"]`).forEach((node) => animateStatistic(node, value));
      });
    } catch {
      $$('[data-umami-stat]').forEach((node) => { node.textContent = "--"; node.dataset.umamiReady = "false"; });
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
    const pagination = $("#search-pagination");
    const pageStatus = $("#search-page-status");
    const previousButton = $("[data-search-prev]");
    const nextButton = $("[data-search-next]");
    if (!dialog || !input || !results || !hint || !pagination || !pageStatus || !previousButton || !nextButton) return;
    const open = () => { dialog.showModal(); window.loadPagefind().catch(() => {}); setTimeout(() => input.focus(), 20); };
    $("#search-open")?.addEventListener("click", open);
    $$("[data-search-trigger]").forEach((button) => button.addEventListener("click", open));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    let request = 0;
    let renderRequest = 0;
    let searchResults = [];
    let searchPage = 1;
    const pageSize = 10;

    const renderSearchPage = async (expectedRequest) => {
      const currentRender = ++renderRequest;
      const page = searchPage;
      const totalPages = Math.ceil(searchResults.length / pageSize);
      const start = (page - 1) * pageSize;
      const items = await Promise.all(searchResults.slice(start, start + pageSize).map((result) => result.data()));
      if (expectedRequest !== request || currentRender !== renderRequest || page !== searchPage) return;
      results.replaceChildren();
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
      pagination.hidden = totalPages <= 1;
      pageStatus.textContent = text.pageSummary(page, Math.max(1, totalPages));
      previousButton.disabled = page <= 1;
      nextButton.disabled = page >= totalPages;
      results.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    };

    previousButton.addEventListener("click", () => {
      if (searchPage <= 1) return;
      searchPage -= 1;
      renderSearchPage(request);
    });
    nextButton.addEventListener("click", () => {
      if (searchPage * pageSize >= searchResults.length) return;
      searchPage += 1;
      renderSearchPage(request);
    });
    input.addEventListener("input", async () => {
      const query = input.value.trim();
      const current = ++request;
      renderRequest += 1;
      searchResults = [];
      searchPage = 1;
      results.replaceChildren();
      pagination.hidden = true;
      hint.textContent = query ? text.searchLoading : text.searchHint;
      if (!query) return;
      try {
        const pagefind = await window.loadPagefind();
        const search = await pagefind.search(query);
        if (current !== request) return;
        searchResults = search.results;
        hint.textContent = searchResults.length ? text.searchCount(searchResults.length) : text.searchEmpty;
        await renderSearchPage(current);
      } catch {
        if (current !== request) return;
        hint.textContent = text.searchError;
      }
    });
  }

  function initResponsivePostPagination() {
    const mobileViewport = matchMedia("(max-width: 760px)");
    const serverPageSize = 30;
    const mobilePageSize = 10;
    const serverPagesPerMobileGroup = serverPageSize / mobilePageSize;

    $$('[data-responsive-post-list]').forEach((root) => {
      const grid = $(".post-grid", root);
      const cards = grid ? [...grid.children].filter((node) => node.matches(".post-card")) : [];
      const totalItems = Number(root.dataset.postListTotal);
      const serverPage = Number(root.dataset.postListPage) || 1;
      if (!grid || !cards.length || !Number.isFinite(totalItems)) return;

      let navigation = $(".hugo-pagination", root);
      const hasServerNavigation = Boolean(navigation);
      const serverNavigation = navigation?.innerHTML || "";
      if (!navigation && totalItems > mobilePageSize) {
        navigation = document.createElement("nav");
        navigation.className = "hugo-pagination";
        navigation.setAttribute("aria-label", text.articlePagination);
        grid.after(navigation);
      }

      const pageUrl = (mobilePage) => {
        const group = Math.ceil(mobilePage / serverPagesPerMobileGroup);
        const url = new URL(location.href);
        let basePath = url.pathname.replace(/page\/\d+\/?$/, "");
        if (!basePath.endsWith("/")) basePath += "/";
        url.pathname = group === 1 ? basePath : `${basePath}page/${group}/`;
        url.searchParams.delete("verify");
        url.searchParams.delete("mobile-page");
        if (mobilePage > 1) url.searchParams.set("mobile-page", String(mobilePage));
        return `${url.pathname}${url.search}`;
      };

      const icon = (name) => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "icon");
        svg.setAttribute("aria-hidden", "true");
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", `/icons/lucide-sprite.svg#${name}`);
        svg.append(use);
        return svg;
      };

      const control = (direction, page, disabled) => {
        const label = direction === "prev" ? text.previous : text.next;
        const node = document.createElement(disabled ? "span" : "a");
        node.className = `pagination-control${disabled ? " disabled" : ""}`;
        if (disabled) node.setAttribute("aria-hidden", "true");
        else {
          node.href = pageUrl(page);
          node.rel = direction;
          node.setAttribute("aria-label", label);
        }
        node.append(icon(direction === "prev" ? "chevron-left" : "chevron-right"));
        return node;
      };

      const renderMobileNavigation = (current, total) => {
        if (!navigation) return;
        navigation.hidden = total <= 1;
        navigation.dataset.currentPage = String(current);
        navigation.dataset.totalPages = String(total);
        if (total <= 1) return;

        const pages = document.createElement("div");
        pages.className = "pagination-pages";
        const visiblePages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
        let previousPage = 0;
        [...visiblePages].sort((a, b) => a - b).forEach((page) => {
          if (previousPage && page - previousPage > 1) {
            const gap = document.createElement("span");
            gap.className = "pagination-gap";
            gap.setAttribute("aria-hidden", "true");
            gap.textContent = "...";
            pages.append(gap);
          }
          const node = document.createElement(page === current ? "span" : "a");
          node.className = `pagination-page${page === current ? " active" : ""}`;
          node.textContent = String(page);
          if (page === current) node.setAttribute("aria-current", "page");
          else {
            node.href = pageUrl(page);
            node.setAttribute("aria-label", text.page(page));
          }
          pages.append(node);
          previousPage = page;
        });

        const summary = document.createElement("span");
        summary.className = "pagination-summary";
        summary.textContent = text.pageSummary(current, total);
        navigation.replaceChildren(
          control("prev", current - 1, current <= 1),
          pages,
          control("next", current + 1, current >= total),
          summary,
        );
      };

      const render = () => {
        if (!mobileViewport.matches) {
          cards.forEach((card) => { card.hidden = false; });
          if (navigation) {
            navigation.hidden = !hasServerNavigation;
            if (hasServerNavigation) navigation.innerHTML = serverNavigation;
          }
          root.classList.add("responsive-pagination-ready");
          return;
        }

        const totalMobilePages = Math.ceil(totalItems / mobilePageSize);
        const firstMobilePage = ((serverPage - 1) * serverPagesPerMobileGroup) + 1;
        const requestedPage = Number(new URL(location.href).searchParams.get("mobile-page"));
        const requestedGroup = Math.ceil(requestedPage / serverPagesPerMobileGroup);
        const currentPage = Number.isInteger(requestedPage)
          && requestedPage >= 1
          && requestedPage <= totalMobilePages
          && requestedGroup === serverPage
          ? requestedPage
          : firstMobilePage;
        const localPage = (currentPage - 1) % serverPagesPerMobileGroup;
        const start = localPage * mobilePageSize;
        cards.forEach((card, index) => { card.hidden = index < start || index >= start + mobilePageSize; });
        renderMobileNavigation(currentPage, totalMobilePages);
        root.classList.add("responsive-pagination-ready");
      };

      render();
      mobileViewport.addEventListener?.("change", render);
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
      catch { error.textContent = text.passwordError; button.disabled = false; }
    });
  }

  initCursor();
  initHome();
  initResponsivePostPagination();
  initSearch();
  initTools();
  initArticle();
})();
