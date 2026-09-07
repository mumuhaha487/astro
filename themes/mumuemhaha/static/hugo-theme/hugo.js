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
      copyCode: "复制全部代码", copied: "已复制", copyFailed: "复制失败",
      expandCode: "展开全部代码", collapseCode: "收起代码",
    },
    en: {
      searchLoading: "Searching...", searchHint: "Enter a keyword to search", searchCount: (count) => `${count} results found`,
      searchEmpty: "No matching content", searchError: "The search index is temporarily unavailable",
      previous: "Previous page", next: "Next page", page: (page) => `Page ${page}`, pageSummary: (page, total) => `Page ${page} of ${total}`,
      articlePagination: "Article pages", passwordError: "Incorrect password. Please try again.",
      copyCode: "Copy all code", copied: "Copied", copyFailed: "Copy failed",
      expandCode: "Expand code", collapseCode: "Collapse code",
    },
    ja: {
      searchLoading: "検索中...", searchHint: "キーワードを入力してください", searchCount: (count) => `${count} 件見つかりました`,
      searchEmpty: "該当する内容がありません", searchError: "検索インデックスを一時的に利用できません",
      previous: "前のページ", next: "次のページ", page: (page) => `${page} ページ`, pageSummary: (page, total) => `${page} / ${total} ページ`,
      articlePagination: "記事ページ", passwordError: "パスワードが違います。もう一度お試しください。",
      copyCode: "コードをすべてコピー", copied: "コピー済み", copyFailed: "コピーできませんでした",
      expandCode: "コードを展開", collapseCode: "コードを折りたたむ",
    },
  }[language] || null;
  const text = messages || {
    searchLoading: "Searching...", searchHint: "Enter a keyword to search", searchCount: (count) => `${count} results found`,
    searchEmpty: "No matching content", searchError: "The search index is temporarily unavailable",
    previous: "Previous page", next: "Next page", page: (page) => `Page ${page}`, pageSummary: (page, total) => `Page ${page} of ${total}`,
    articlePagination: "Article pages", passwordError: "Incorrect password. Please try again.",
    copyCode: "Copy all code", copied: "Copied", copyFailed: "Copy failed",
    expandCode: "Expand code", collapseCode: "Collapse code",
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

  function scheduleIdleWork(callback, timeout = 2_500) {
    const schedule = () => {
      if ("requestIdleCallback" in window) requestIdleCallback(callback, { timeout });
      else setTimeout(callback, Math.min(timeout, 1_200));
    };
    if (document.readyState === "complete") schedule();
    else addEventListener("load", schedule, { once: true });
  }

  function initPageVisibility() {
    const update = () => document.documentElement.classList.toggle("is-page-hidden", document.hidden);
    document.addEventListener("visibilitychange", update, { passive: true });
    update();
  }

  function initDeferredAnalytics() {
    const source = document.body.dataset.analyticsSrc;
    const websiteId = document.body.dataset.analyticsWebsiteId;
    if (!source || !websiteId) return;
    scheduleIdleWork(() => {
      if (document.querySelector(`script[src="${source}"]`)) return;
      const script = document.createElement("script");
      script.src = source;
      script.async = true;
      script.fetchPriority = "low";
      script.dataset.websiteId = websiteId;
      document.body.append(script);
    });
  }

  function makeIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `/icons/lucide-sprite.svg#${name}`);
    svg.append(use);
    return svg;
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try { await navigator.clipboard.writeText(value); return; } catch {}
    }
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.cssText = "position:fixed;inset:auto auto 0 -9999px";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    if (!copied) throw new Error("Clipboard unavailable");
  }

  $$(`[data-nav="${section === "posts" ? "blog" : section}"]`).forEach((node) => node.classList.add("active"));

  const openSidebar = () => document.body.classList.add("sidebar-open", "no-scroll");
  const closeSidebar = () => document.body.classList.remove("sidebar-open", "no-scroll");
  $$("[data-sidebar-open]").forEach((button) => button.addEventListener("click", openSidebar));
  $$("[data-sidebar-close]").forEach((button) => button.addEventListener("click", closeSidebar));

  function initCursor() {
    if (!matchMedia("(pointer:fine)").matches || reducedMotion.matches) return;
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    if (!dot || !ring) return;
    document.body.classList.add("has-custom-cursor");
    const followTime = 58;
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let initialized = false;
    let ringFrame = 0;
    let previousFrame = 0;
    ring.dataset.followMode = "straight-line";
    ring.dataset.followMs = String(followTime);
    const renderRing = (now) => {
      const elapsed = Math.min(48, Math.max(1, now - (previousFrame || now - 16)));
      previousFrame = now;
      const progress = 1 - Math.exp(-elapsed / followTime);
      current.x += (target.x - current.x) * progress;
      current.y += (target.y - current.y) * progress;
      const distance = Math.hypot(target.x - current.x, target.y - current.y);
      if (distance < 0.18) {
        current.x = target.x;
        current.y = target.y;
      }
      ring.style.transform = `translate3d(${current.x}px,${current.y}px,0) translate(-50%,-50%)`;
      if (distance >= 0.18) ringFrame = requestAnimationFrame(renderRing);
      else { ringFrame = 0; previousFrame = 0; }
    };
    addEventListener("pointermove", (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      dot.style.transform = `translate3d(${target.x}px,${target.y}px,0) translate(-50%,-50%)`;
      if (!initialized) {
        current.x = target.x;
        current.y = target.y;
        ring.style.transform = dot.style.transform;
        initialized = true;
      }
      dot.classList.add("visible"); ring.classList.add("visible");
      if (!ringFrame) ringFrame = requestAnimationFrame(renderRing);
    }, { passive: true });
    document.addEventListener("pointerover", (event) => ring.classList.toggle("active", Boolean(event.target.closest("a,button,input,textarea,select,iframe"))));
    document.addEventListener("pointerleave", () => { dot.classList.remove("visible"); ring.classList.remove("visible"); });
  }

  let randomPostCovers;
  function getRandomPostCovers() {
    if (randomPostCovers) return randomPostCovers;
    try {
      const configured = JSON.parse(document.body.dataset.randomPostCovers || "{}");
      const selected = Array.isArray(configured) ? configured : configured[innerWidth <= 760 ? "mobile" : "desktop"];
      randomPostCovers = (selected || []).filter((value) => typeof value === "string" && value.startsWith("/"));
    }
    catch { randomPostCovers = []; }
    return randomPostCovers;
  }

  function assignRandomPostCover(image, key) {
    const covers = getRandomPostCovers();
    if (!covers.length) return false;
    let hash = 2166136261;
    for (const character of key || location.pathname) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    image.src = covers[(hash >>> 0) % covers.length];
    image.dataset.coverSource = "random";
    return true;
  }

  function hydrateProgressiveCard(card) {
    const images = $$("img[data-progressive-src]", card);
    images.forEach((image) => {
      if (image.hasAttribute("src")) return;
      const source = image.dataset.progressiveSrc;
      if (image.hasAttribute("data-random-post-cover")) assignRandomPostCover(image, image.dataset.postCoverKey);
      else if (source) {
        image.src = source;
        image.dataset.coverSource = "article";
      }
      image.removeAttribute("data-progressive-src");
    });
    return images;
  }

  function revealCard(card, delay = 0) {
    if (!card) return;
    hydrateProgressiveCard(card);
    if (card.dataset.cardAnimated === "true" || reducedMotion.matches) return;
    card.dataset.cardAnimated = "true";
    card.style.animationDelay = `${Math.min(delay, 180)}ms`;
    card.classList.add("is-card-entering");
    card.addEventListener("animationend", () => {
      card.classList.remove("is-card-entering");
      card.style.removeProperty("animation-delay");
    }, { once: true });
  }

  function initCardFadeMotion() {
    const cards = $$(".home-doc-item, .tool-card, .friend-card, .guestbook-note, .guestbook-form, .guestbook-messages, .article-related .card-base");
    if (!cards.length) return;

    cards.forEach((card, index) => {
      card.dataset.fadeCard = "";
      card.style.setProperty("--card-fade-delay", `${Math.min(index % 4, 3) * 55}ms`);
    });

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      cards.forEach((card) => { card.dataset.cardMotion = "visible"; });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.cardMotion = "visible";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -4%", threshold: 0.08 });

    cards.forEach((card) => observer.observe(card));
  }

  function initHome() {
    const clock = $("#home-clock");
    if (clock) {
      const update = () => { clock.textContent = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium", hour12: false }).format(new Date()); };
      update();
      setInterval(() => { if (!document.hidden) update(); }, 1000);
    }
    initTypewriter();
    initAvatarParticles();
    if ($("#home-visitors")) {
      $$('[data-umami-stat]').forEach((node) => { node.textContent = "0"; });
      scheduleIdleWork(() => {
        updateUmamiStats();
        setInterval(() => { if (!document.hidden) updateUmamiStats(); }, 60_000);
      }, 1_800);
    }
  }

  function initAvatarParticles() {
    const stage = $("[data-avatar-particles]");
    const canvas = $(".profile-particles", stage || document);
    const image = $("[data-avatar-image]", stage || document);
    if (!stage || !canvas || !image) return;
    const showImage = (frames = 0) => {
      stage.dataset.particleFrames = String(frames);
      stage.dataset.particleState = "assembled";
      stage.classList.add("is-assembled");
      setTimeout(() => stage.classList.add("is-ready"), 680);
    };
    if (reducedMotion.matches) {
      stage.classList.add("is-assembled", "is-ready");
      stage.dataset.particleState = "reduced-motion";
      return;
    }
    const assemble = async () => {
      try { await image.decode(); } catch {
        if (!image.complete) await new Promise((resolve) => image.addEventListener("load", resolve, { once: true }));
      }
      const size = Math.max(1, Math.round(stage.clientWidth));
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { alpha: true });
      const sample = document.createElement("canvas");
      sample.width = size;
      sample.height = size;
      const sampleContext = sample.getContext("2d", { willReadFrequently: true });
      if (!context || !sampleContext || !image.naturalWidth) {
        showImage();
        return;
      }
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      sampleContext.drawImage(image, (image.naturalWidth - sourceSize) / 2, (image.naturalHeight - sourceSize) / 2, sourceSize, sourceSize, 0, 0, size, size);
      const pixels = sampleContext.getImageData(0, 0, size, size).data;
      const particles = [];
      let particleIndex = 0;
      for (let y = 2; y < size - 2; y += 3) {
        for (let x = 2; x < size - 2; x += 3) {
          const distanceFromCenter = Math.hypot(x - size / 2, y - size / 2);
          if (distanceFromCenter > size / 2 - 2) continue;
          const offset = (y * size + x) * 4;
          if (pixels[offset + 3] < 90) continue;
          const angle = ((particleIndex * 137.508) % 360) * Math.PI / 180;
          const radius = size * (.72 + ((particleIndex * 47) % 37) / 100);
          particles.push({
            x,
            y,
            startX: size / 2 + Math.cos(angle) * radius,
            startY: size / 2 + Math.sin(angle) * radius,
            color: `rgba(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]},${pixels[offset + 3] / 255})`,
            delay: (1 - Math.min(1, distanceFromCenter / (size / 2))) * 560,
          });
          particleIndex += 1;
        }
      }
      const startedAt = performance.now();
      const duration = 2_320;
      let frameCount = 0;
      stage.dataset.particleDuration = String(duration);
      stage.dataset.particleCount = String(particles.length);
      stage.dataset.particleState = "assembling";
      const render = (now) => {
        frameCount += 1;
        context.clearRect(0, 0, size, size);
        for (const particle of particles) {
          const linear = Math.max(0, Math.min(1, (now - startedAt - particle.delay) / 1_720));
          const eased = 1 - (1 - linear) ** 4;
          const x = particle.startX + (particle.x - particle.startX) * eased;
          const y = particle.startY + (particle.y - particle.startY) * eased;
          context.fillStyle = particle.color;
          context.fillRect(Math.round(x), Math.round(y), 2, 2);
        }
        if (now - startedAt < duration) requestAnimationFrame(render);
        else showImage(frameCount);
      };
      requestAnimationFrame(render);
    };
    void assemble();
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
        node.append(makeIcon(direction === "prev" ? "chevron-left" : "chevron-right"));
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
          root.dispatchEvent(new CustomEvent("responsive-post-page-rendered"));
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
        root.dispatchEvent(new CustomEvent("responsive-post-page-rendered"));
      };

      render();
      mobileViewport.addEventListener?.("change", render);
    });
  }

  function initProgressivePostLists() {
    const batchSize = 3;
    $$('[data-responsive-post-list]').forEach((root) => {
      const grid = $(".post-grid", root);
      const cards = grid ? [...grid.children].filter((node) => node.matches(".post-card")) : [];
      if (!grid || !cards.length) return;
      const sentinel = document.createElement("div");
      sentinel.className = "post-load-sentinel";
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.innerHTML = "<span></span><span></span><span></span>";
      grid.after(sentinel);
      root.dataset.postBatchSize = String(batchSize);
      let candidates = [];
      let revealed = 0;
      let interacted = false;
      let lastRevealAt = 0;
      let frame = 0;

      const updateState = () => {
        root.dataset.postVisibleCount = String(revealed);
        root.dataset.postBatchComplete = String(revealed >= candidates.length);
        sentinel.hidden = revealed >= candidates.length;
      };
      const revealNext = () => {
        if (revealed >= candidates.length || performance.now() - lastRevealAt < 360) return;
        const next = Math.min(candidates.length, revealed + batchSize);
        candidates.slice(revealed, next).forEach((card, index) => {
          card.classList.remove("is-progressive-hidden");
          card.removeAttribute("aria-hidden");
          revealCard(card, index * 60);
        });
        revealed = next;
        lastRevealAt = performance.now();
        updateState();
      };
      const maybeReveal = () => {
        frame = 0;
        if (!interacted || sentinel.hidden) return;
        if (sentinel.getBoundingClientRect().top <= innerHeight + 220) revealNext();
      };
      const queueRevealCheck = () => {
        if (!frame) frame = requestAnimationFrame(maybeReveal);
      };
      const reset = () => {
        candidates = cards.filter((card) => !card.hidden);
        revealed = Math.min(batchSize, candidates.length);
        interacted = false;
        lastRevealAt = 0;
        cards.forEach((card) => {
          const index = candidates.indexOf(card);
          const progressiveHidden = index >= revealed;
          card.classList.toggle("is-progressive-hidden", progressiveHidden);
          if (progressiveHidden) card.setAttribute("aria-hidden", "true");
          else if (!card.hidden) card.removeAttribute("aria-hidden");
        });
        candidates.slice(0, revealed).forEach((card, index) => revealCard(card, index * 60));
        updateState();
      };

      addEventListener("wheel", (event) => {
        if (event.deltaY <= 0 || root.getBoundingClientRect().bottom < 0 || root.getBoundingClientRect().top > innerHeight) return;
        interacted = true;
        queueRevealCheck();
      }, { passive: true });
      addEventListener("touchmove", () => { interacted = true; queueRevealCheck(); }, { passive: true });
      addEventListener("scroll", () => { interacted = true; queueRevealCheck(); }, { passive: true });
      root.addEventListener("progressive-post-reveal", () => {
        interacted = true;
        lastRevealAt = 0;
        revealNext();
      });
      root.addEventListener("responsive-post-page-rendered", reset);
      reset();
    });
  }

  function initTools() {
    const toolsPage = $("[data-tool-covers]");
    if (toolsPage) {
      let covers = [];
      try { covers = JSON.parse(toolsPage.dataset.toolCovers || "[]").filter((value) => typeof value === "string" && value.startsWith("/")); } catch {}
      const loadCover = (image, index) => {
        if (image.dataset.coverLoaded === "true") return;
        image.dataset.coverLoaded = "true";
        if (!covers.length) { image.classList.add("is-missing"); return; }
        const start = Math.floor(Math.random() * covers.length);
        let attempt = 0;
        image.addEventListener("error", () => {
          attempt += 1;
          if (attempt >= covers.length) { image.removeAttribute("src"); image.classList.add("is-missing"); return; }
          image.src = covers[(start + index + attempt) % covers.length];
        });
        image.src = covers[(start + index) % covers.length];
      };
      const coverImages = $$('[data-random-cover]', toolsPage);
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = coverImages.indexOf(entry.target);
            loadCover(entry.target, index);
            observer.unobserve(entry.target);
          });
        }, { rootMargin: "180px 0px" });
        coverImages.forEach((image) => observer.observe(image));
      } else coverImages.forEach(loadCover);
    }
    const jsonInput = $("[data-json-input]");
    const jsonMessage = $("[data-json-message]");
    const transformJson = (space) => {
      if (!jsonInput || !jsonMessage) return;
      try { jsonInput.value = JSON.stringify(JSON.parse(jsonInput.value), null, space); jsonMessage.textContent = "JSON 有效"; jsonMessage.classList.remove("error"); }
      catch (error) { jsonMessage.textContent = `格式错误：${error.message}`; jsonMessage.classList.add("error"); }
    };
    $("[data-json-format]")?.addEventListener("click", () => transformJson(2));
    $("[data-json-minify]")?.addEventListener("click", () => transformJson(0));
    $("[data-time-to-date]")?.addEventListener("click", () => {
      const timeInput = $("[data-time-input]"); const dateInput = $("[data-date-input]");
      const raw = Number(timeInput?.value);
      const date = new Date(String(Math.trunc(raw)).length <= 10 ? raw * 1000 : raw);
      const message = $("[data-time-message]");
      if (!message || !dateInput || !Number.isFinite(raw) || Number.isNaN(date.getTime())) { if (message) { message.textContent = "请输入有效时间戳"; message.classList.add("error"); } return; }
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      dateInput.value = local;
      message.textContent = date.toLocaleString("zh-CN", { hour12: false });
      message.classList.remove("error");
    });
    $("[data-date-to-time]")?.addEventListener("click", () => {
      const date = new Date($("[data-date-input]")?.value || "");
      const message = $("[data-time-message]");
      const timeInput = $("[data-time-input]");
      if (!message || !timeInput || Number.isNaN(date.getTime())) { if (message) { message.textContent = "请选择有效日期"; message.classList.add("error"); } return; }
      const seconds = Math.floor(date.getTime() / 1000);
      timeInput.value = String(seconds);
      message.textContent = `${seconds}（秒） / ${date.getTime()}（毫秒）`;
      message.classList.remove("error");
    });
    const updateTextStats = (value) => {
      const words = value.trim() ? (value.match(/[\p{Script=Han}]|[\p{L}\p{N}_'-]+/gu) || []).length : 0;
      const values = { chars: [...value].length, words, lines: value ? value.split(/\r?\n/).length : 0, paragraphs: value.trim() ? value.trim().split(/\n\s*\n/).length : 0 };
      Object.entries(values).forEach(([key, count]) => { const node = $(`[data-stat="${key}"]`); if (node) node.textContent = String(count); });
    };
    const textInput = $("[data-text-input]");
    if (textInput) { textInput.addEventListener("input", () => updateTextStats(textInput.value)); updateTextStats(textInput.value); }

    const base64Source = $("[data-base64-source]"); const base64Result = $("[data-base64-result]"); const base64Message = $("[data-base64-message]");
    const setBase64Result = (transform) => {
      if (!base64Source || !base64Result || !base64Message) return;
      try { base64Result.value = transform(base64Source.value.trim()); base64Message.textContent = "转换完成"; base64Message.classList.remove("error"); }
      catch { base64Result.value = ""; base64Message.textContent = "输入内容不是有效的 Base64 数据"; base64Message.classList.add("error"); }
    };
    $(`[data-base64-encode]`)?.addEventListener("click", () => setBase64Result((value) => {
      const bytes = new TextEncoder().encode(value); let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      return btoa(binary);
    }));
    $(`[data-base64-decode]`)?.addEventListener("click", () => setBase64Result((value) => new TextDecoder("utf-8", { fatal: true }).decode(decodeBase64(value.replace(/\s+/g, "")))));

    const uuidResult = $("[data-uuid-result]"); const uuidMessage = $("[data-uuid-message]");
    const generateUuid = () => {
      if (!uuidResult || !uuidMessage) return;
      const countNode = $("[data-uuid-count]");
      const count = Math.max(1, Math.min(100, Math.trunc(Number(countNode?.value) || 1)));
      if (countNode) countNode.value = String(count);
      uuidResult.value = Array.from({ length: count }, () => crypto.randomUUID()).join("\n");
      uuidMessage.textContent = `已生成 ${count} 个 UUID`;
    };
    $("[data-uuid-generate]")?.addEventListener("click", generateUuid);
    if (uuidResult) generateUuid();

    const beastSource = $("[data-beast-source]"); const beastResult = $("[data-beast-result]"); const beastMessage = $("[data-beast-message]");
    const beastDictionary = () => {
      const dictionary = [...($("[data-beast-dictionary]")?.value || "")];
      if (dictionary.length !== 4 || new Set(dictionary).size !== 4) throw new Error("字典必须是 4 个互不重复的字符");
      return dictionary;
    };
    const runBeast = (mode) => {
      if (!beastSource || !beastResult || !beastMessage) return;
      try {
        const dictionary = beastDictionary();
        if (mode === "encode") {
          let hexadecimal = "";
          for (let index = 0; index < beastSource.value.length; index += 1) hexadecimal += beastSource.value.charCodeAt(index).toString(16).padStart(4, "0");
          beastResult.value = [...hexadecimal].map((value, index) => {
            const shifted = (Number.parseInt(value, 16) + (index % 16)) % 16;
            return dictionary[Math.floor(shifted / 4)] + dictionary[shifted % 4];
          }).join("");
        } else {
          const symbols = [...beastSource.value.trim()];
          if (!symbols.length || symbols.length % 8 !== 0 || symbols.some((symbol) => !dictionary.includes(symbol))) throw new Error("密文与当前四字符字典不匹配");
          let hexadecimal = "";
          for (let index = 0; index < symbols.length; index += 2) {
            let value = (dictionary.indexOf(symbols[index]) * 4) + dictionary.indexOf(symbols[index + 1]) - ((index / 2) % 16);
            if (value < 0) value += 16;
            hexadecimal += value.toString(16);
          }
          let decoded = "";
          for (let index = 0; index < hexadecimal.length; index += 4) decoded += String.fromCharCode(Number.parseInt(hexadecimal.slice(index, index + 4), 16));
          beastResult.value = decoded;
        }
        beastMessage.textContent = mode === "encode" ? "已转换为兽音" : "已还原为普通文本";
        beastMessage.classList.remove("error");
      } catch (error) { beastResult.value = ""; beastMessage.textContent = error.message; beastMessage.classList.add("error"); }
    };
    $("[data-beast-encode]")?.addEventListener("click", () => runBeast("encode"));
    $("[data-beast-decode]")?.addEventListener("click", () => runBeast("decode"));

    $$('[data-copy-target]').forEach((button) => button.addEventListener("click", async () => {
      const target = $(button.dataset.copyTarget || "");
      if (!target) return;
      const original = button.innerHTML;
      try { await copyText(target.value || target.textContent || ""); button.textContent = text.copied; }
      catch { button.textContent = text.copyFailed; }
      setTimeout(() => { button.innerHTML = original; }, 1_500);
    }));
  }

  function initFriends() {
    const page = $("[data-friends-page]");
    if (!page) return;
    const search = $("[data-friends-search]", page);
    const cards = $$('[data-friend-card]', page);
    const empty = $("[data-friends-empty]", page);
    const dialog = $("[data-friends-apply-dialog]", page);
    const open = $("[data-friends-apply-open]", page);
    const copy = $("[data-friends-template-copy]", page);
    const template = $("[data-friends-template]", page);
    $$('[data-friend-avatar]', page).forEach((image) => image.addEventListener("error", () => image.remove(), { once: true }));
    const closeDialog = () => {
      dialog?.close();
      document.body.classList.remove("no-scroll");
    };
    open?.addEventListener("click", () => {
      if (!dialog) return;
      dialog.showModal();
      document.body.classList.add("no-scroll");
    });
    $$('[data-friends-apply-close]', page).forEach((button) => button.addEventListener("click", closeDialog));
    dialog?.addEventListener("cancel", () => document.body.classList.remove("no-scroll"));
    dialog?.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
    copy?.addEventListener("click", async () => {
      const label = $("span", copy);
      try {
        await copyText(template?.textContent || "");
        copy.replaceChildren(makeIcon("check"), Object.assign(document.createElement("span"), { textContent: page.dataset.friendsCopiedLabel || text.copied }));
      } catch {
        copy.replaceChildren(makeIcon("x"), Object.assign(document.createElement("span"), { textContent: text.copyFailed }));
      }
      setTimeout(() => copy.replaceChildren(makeIcon("copy"), Object.assign(document.createElement("span"), { textContent: page.dataset.friendsCopyLabel || label?.textContent || text.copyCode })), 1_500);
    });
    const filter = () => {
      const query = (search?.value || "").trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const matches = !query || (card.dataset.search || "").includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    };
    search?.addEventListener("input", filter);
    filter();
  }

  function initGuestbook() {
    const page = $("[data-guestbook]");
    if (!page) return;
    const api = (page.dataset.guestbookApi || "").replace(/\/$/, "");
    const siteKey = page.dataset.turnstileSiteKey || "";
    const verifier = page.dataset.turnstileVerifier || "";
    const form = $("[data-guestbook-form]", page);
    const list = $("[data-guestbook-list]", page);
    const count = $("[data-guestbook-count]", page);
    const turnstileContainer = $("[data-guestbook-turnstile]", page);
    const turnstileScript = $("[data-turnstile-script]");
    const status = $("[data-guestbook-status]", page);
    const submit = $('button[type="submit"]', form || document);
    let turnstileToken = "";
    let turnstileWidgetId;
    let messages = [];
    const request = async (path, options) => {
      const response = await fetch(`${api}${path}`, { cache: "no-store", ...options });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || page.dataset.error);
      return payload;
    };
    const exchangeTurnstileToken = async (token) => {
      if (!verifier) throw new Error(page.dataset.error || "");
      const response = await fetch(verifier, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken: token }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.ticket !== "string" || !payload.ticket) throw new Error(payload.error || page.dataset.error || "");
      return payload.ticket;
    };
    const renderMessages = () => {
      if (!list) return;
      if (count) count.textContent = String(messages.length);
      if (!messages.length) {
        const empty = document.createElement("p"); empty.className = "guestbook-list-state"; empty.textContent = page.dataset.empty || "";
        list.replaceChildren(empty); return;
      }
      const formatter = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      list.replaceChildren(...messages.map((message) => {
        const article = document.createElement("article"); article.className = "guestbook-message";
        const avatar = document.createElement("span"); avatar.className = "guestbook-message-avatar"; avatar.textContent = [...message.name][0]?.toUpperCase() || "?";
        const body = document.createElement("div");
        const header = document.createElement("header");
        const name = document.createElement("strong"); name.textContent = message.name;
        const time = document.createElement("time"); time.dateTime = message.createdAt; time.textContent = formatter.format(new Date(message.createdAt));
        const content = document.createElement("p"); content.textContent = message.content;
        header.append(name, time); body.append(header, content); article.append(avatar, body);
        return article;
      }));
    };
    const updateSubmit = () => { if (submit) submit.disabled = !turnstileToken; };
    const setTurnstileError = () => {
      turnstileToken = "";
      updateSubmit();
      if (turnstileContainer) { turnstileContainer.dataset.turnstileState = "error"; turnstileContainer.textContent = page.dataset.error || ""; }
    };
    const mountTurnstile = () => {
      const service = globalThis.turnstile;
      if (!service?.render || !turnstileContainer || !siteKey || turnstileWidgetId !== undefined) return false;
      try {
        turnstileContainer.replaceChildren();
        turnstileContainer.dataset.turnstileState = "rendered";
        turnstileWidgetId = service.render(turnstileContainer, {
          sitekey: siteKey,
          theme: "dark",
          action: "guestbook",
          callback(token) {
            turnstileToken = token;
            turnstileContainer.dataset.turnstileState = "ready";
            updateSubmit();
          },
          "expired-callback"() {
            turnstileToken = "";
            turnstileContainer.dataset.turnstileState = "expired";
            updateSubmit();
          },
          "error-callback"() { setTurnstileError(); },
        });
        return true;
      } catch { setTurnstileError(); return false; }
    };
    updateSubmit();
    if (!mountTurnstile()) {
      turnstileScript?.addEventListener("load", mountTurnstile, { once: true });
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (mountTurnstile() || attempts >= 100) {
          clearInterval(timer);
          if (attempts >= 100 && turnstileWidgetId === undefined) setTurnstileError();
        }
      }, 100);
    }
    const loadMessages = async () => {
      try {
        const result = await request("/api/guestbook/messages");
        messages = Array.isArray(result.messages) ? result.messages : [];
        renderMessages();
      } catch (error) {
        if (list) { const state = document.createElement("p"); state.className = "guestbook-list-state error"; state.textContent = error.message; list.replaceChildren(state); }
      } finally {
        if (list) list.dataset.guestbookReady = "true";
      }
    };
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!submit) return;
      if (!turnstileToken) {
        if (status) { status.textContent = page.dataset.verificationRequired || ""; status.className = "error"; }
        return;
      }
      const values = new FormData(form);
      const verificationToken = turnstileToken;
      turnstileToken = "";
      submit.disabled = true;
      if (status) { status.textContent = ""; status.className = ""; }
      try {
        const turnstileTicket = await exchangeTurnstileToken(verificationToken);
        const created = await request("/api/guestbook/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: values.get("name"), content: values.get("content"), turnstileTicket }),
        });
        messages = [created, ...messages.filter((message) => message.id !== created.id)].slice(0, 60);
        renderMessages();
        form.querySelector('textarea[name="content"]').value = "";
        if (status) { status.textContent = page.dataset.success || ""; status.className = "success"; }
      } catch (error) {
        if (status) { status.textContent = error.message; status.className = "error"; }
      } finally {
        globalThis.turnstile?.reset?.(turnstileWidgetId);
        updateSubmit();
      }
    });
    void loadMessages();
  }

  function initCodeBlocks(content) {
    $$('pre', content).forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block-shell")) return;
      const code = $("code", pre);
      const shell = document.createElement("div");
      shell.className = "code-block-shell";
      pre.before(shell); shell.append(pre);
      const copyButton = document.createElement("button");
      copyButton.className = "code-copy-button"; copyButton.type = "button"; copyButton.title = text.copyCode; copyButton.setAttribute("aria-label", text.copyCode);
      copyButton.append(makeIcon("copy"), document.createTextNode(text.copyCode));
      copyButton.addEventListener("click", async () => {
        try { await copyText(code?.textContent || pre.textContent || ""); copyButton.replaceChildren(makeIcon("check"), document.createTextNode(text.copied)); }
        catch { copyButton.textContent = text.copyFailed; }
        setTimeout(() => copyButton.replaceChildren(makeIcon("copy"), document.createTextNode(text.copyCode)), 1_500);
      });
      shell.append(copyButton);
      const lineCount = (code?.textContent || pre.textContent || "").split("\n").length;
      if (lineCount > 18 || pre.scrollHeight > 520) {
        shell.classList.add("is-collapsible", "is-collapsed");
        const toggle = document.createElement("button");
        toggle.className = "code-expand-button"; toggle.type = "button"; toggle.setAttribute("aria-expanded", "false");
        const render = () => {
          const collapsed = shell.classList.contains("is-collapsed");
          toggle.replaceChildren(makeIcon(collapsed ? "chevron-down" : "chevron-up"), document.createTextNode(collapsed ? text.expandCode : text.collapseCode));
          toggle.setAttribute("aria-expanded", String(!collapsed));
        };
        toggle.addEventListener("click", () => { shell.classList.toggle("is-collapsed"); render(); });
        render(); shell.append(toggle);
      }
    });
  }

  function initArticleNavigation(content) {
    const headings = $$('h1,h2', content);
    const desktopToc = $("[data-article-toc]"); const desktopNav = $("[data-article-toc-nav]"); const mobileNav = $("[data-mobile-toc-nav]");
    const tocDialog = $("#article-toc-dialog"); const floatControls = $("[data-article-float]");
    if (!headings.length) {
      desktopToc?.setAttribute("hidden", ""); tocDialog?.setAttribute("hidden", "");
      $$('[data-toc-open]').forEach((button) => button.setAttribute("hidden", ""));
    } else {
      desktopToc?.removeAttribute("hidden"); tocDialog?.removeAttribute("hidden");
      $$('[data-toc-open]').forEach((button) => button.removeAttribute("hidden"));
      const usedIds = new Set();
      headings.forEach((heading, index) => {
        let id = heading.id || `section-${index + 1}`;
        const base = id; let suffix = 2;
        while (usedIds.has(id)) id = `${base}-${suffix++}`;
        heading.id = id; usedIds.add(id);
      });
      const createNav = () => {
        const nav = document.createElement("nav"); nav.className = "generated-article-toc";
        headings.forEach((heading) => {
          const link = document.createElement("a"); link.href = `#${heading.id}`; link.textContent = heading.textContent.trim(); link.dataset.tocId = heading.id;
          link.className = heading.tagName === "H1" ? "toc-level-1" : "toc-level-2";
          link.addEventListener("click", (event) => { event.preventDefault(); heading.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" }); history.replaceState(null, "", `#${heading.id}`); tocDialog?.close(); document.body.classList.remove("mobile-article-actions-open"); });
          nav.append(link);
        });
        return nav;
      };
      desktopNav?.replaceChildren(createNav()); mobileNav?.replaceChildren(createNav());
      const updateActive = () => {
        let active = headings[0];
        headings.forEach((heading) => { if (heading.getBoundingClientRect().top <= 130) active = heading; });
        $$('[data-toc-id]').forEach((link) => { const current = link.dataset.tocId === active.id; link.classList.toggle("active", current); if (current) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
      };
      let pending = 0;
      addEventListener("scroll", () => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; updateActive(); }); }, { passive: true });
      updateActive();
    }
    if (document.body.dataset.articleNavigationBound !== "true") {
      document.body.dataset.articleNavigationBound = "true";
      $$('[data-toc-open]').forEach((button) => button.addEventListener("click", () => { if ($$('[data-toc-id]').length && tocDialog && !tocDialog.open) tocDialog.showModal(); }));
      $("[data-toc-close]")?.addEventListener("click", () => tocDialog?.close());
      tocDialog?.addEventListener("click", (event) => { if (event.target === tocDialog) tocDialog.close(); });
      $$('[data-back-to-top]').forEach((button) => button.addEventListener("click", () => scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" })));
      $("[data-mobile-actions-toggle]")?.addEventListener("click", (event) => {
        const open = document.body.classList.toggle("mobile-article-actions-open"); event.currentTarget.setAttribute("aria-expanded", String(open));
      });
      const updateFloat = () => floatControls?.classList.toggle("is-visible", scrollY > 240);
      addEventListener("scroll", updateFloat, { passive: true }); updateFloat();
    }
  }

  function enhanceArticle(content) {
    initCodeBlocks(content);
    initArticleNavigation(content);
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
    if (content) enhanceArticle(content);
    const panel = $("[data-hugo-encrypted-panel]", content || document);
    const payloadNode = $("[data-hugo-encrypted-payload]", content || document);
    if (!content || !panel || !payloadNode) return;
    const form = $("form", panel); const input = $("input", panel); const button = $("button", panel); const error = $("[role=alert]", panel);
    let payload; try { payload = JSON.parse(payloadNode.textContent || "{}"); } catch { return; }
    form?.addEventListener("submit", async (event) => {
      event.preventDefault(); button.disabled = true; error.textContent = "";
      try { content.innerHTML = await decryptArticle(payload, input.value); enhanceArticle(content); }
      catch { error.textContent = text.passwordError; button.disabled = false; }
    });
  }

  initPageVisibility();
  initDeferredAnalytics();
  initCursor();
  initCardFadeMotion();
  initHome();
  initResponsivePostPagination();
  initProgressivePostLists();
  initSearch();
  initTools();
  initFriends();
  initGuestbook();
  initArticle();
})();
