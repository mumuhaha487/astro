(() => {
  const page = document.querySelector("[data-trending-page]");
  if (!page) return;
  const buttons = [...page.querySelectorAll("[data-trending-filter]")];
  const cards = [...page.querySelectorAll(".trending-card, .trending-feature")];
  const rows = [...page.querySelectorAll(".trending-repositories li")];
  const more = page.querySelector("[data-trending-more]");
  const empty = page.querySelector("[data-trending-featured-empty]");
  page.querySelectorAll("[data-trending-date-strip]").forEach((strip) => {
    const viewport = strip.querySelector("[data-trending-date-viewport]");
    const previous = strip.querySelector("[data-trending-date-prev]");
    const next = strip.querySelector("[data-trending-date-next]");
    if (!viewport || !previous || !next) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const current = viewport.querySelector('[aria-current="page"]');
    const maximum = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const clamp = (left) => Math.max(0, Math.min(left, maximum()));
    let pending = null;
    let width = viewport.clientWidth;
    let keepCurrentVisible = true;
    const currentBounds = () => {
      const bounds = current.getBoundingClientRect();
      const visibleLeft = viewport.getBoundingClientRect().left + viewport.clientLeft;
      const left = bounds.left - visibleLeft + viewport.scrollLeft;
      return { left, right: left + bounds.width, width: bounds.width };
    };
    const currentVisibleAt = (left) => {
      if (!current || viewport.clientWidth === 0) return false;
      const bounds = currentBounds();
      return bounds.left >= left - 1 && bounds.right <= left + viewport.clientWidth + 1;
    };
    const revealCurrentAt = (left) => {
      if (!current || viewport.clientWidth === 0) return left;
      const bounds = currentBounds();
      if (bounds.left < left || bounds.width > viewport.clientWidth) return clamp(bounds.left);
      if (bounds.right > left + viewport.clientWidth) return clamp(bounds.right - viewport.clientWidth);
      return left;
    };
    const update = () => {
      if (pending !== null) pending = clamp(pending);
      const position = pending ?? clamp(viewport.scrollLeft);
      previous.disabled = viewport.clientWidth === 0 || position <= 1;
      next.disabled = viewport.clientWidth === 0 || position >= maximum() - 1;
    };
    const scrollTo = (left, behavior = reducedMotion.matches ? "instant" : "smooth") => {
      const destination = clamp(left);
      pending = behavior === "smooth" && Math.abs(viewport.scrollLeft - destination) > 1 ? destination : null;
      viewport.scrollTo({ left: destination, behavior });
      update();
    };
    const navigate = (left) => {
      keepCurrentVisible = currentVisibleAt(clamp(left));
      scrollTo(left);
    };
    const move = (direction) => navigate((pending ?? clamp(viewport.scrollLeft)) + direction * viewport.clientWidth);
    const resize = () => {
      if (width !== viewport.clientWidth) {
        width = viewport.clientWidth;
        const destination = clamp(pending ?? viewport.scrollLeft);
        scrollTo(keepCurrentVisible ? revealCurrentAt(destination) : destination, "instant");
      }
      update();
    };
    const cancelPaging = () => {
      if (pending !== null) {
        pending = null;
        viewport.scrollTo({ left: clamp(viewport.scrollLeft), behavior: "instant" });
      }
      keepCurrentVisible = currentVisibleAt(clamp(viewport.scrollLeft));
      update();
    };
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    viewport.addEventListener("scroll", () => {
      // Resize can emit scroll before its observer; retain the previous visibility decision.
      if (width !== viewport.clientWidth) { resize(); return; }
      if (pending !== null && Math.abs(viewport.scrollLeft - pending) <= 1) pending = null;
      if (pending === null) keepCurrentVisible = currentVisibleAt(clamp(viewport.scrollLeft));
      update();
    }, { passive: true });
    viewport.addEventListener("scrollend", () => {
      if (width !== viewport.clientWidth) resize();
      pending = null;
      keepCurrentVisible = currentVisibleAt(clamp(viewport.scrollLeft));
      update();
    });
    for (const event of ["wheel", "touchstart", "pointerdown", "focusin"]) {
      viewport.addEventListener(event, cancelPaging, { passive: true });
    }
    viewport.addEventListener("keydown", (event) => {
      if (event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey) { cancelPaging(); return; }
      if (["ArrowLeft", "PageUp", "ArrowRight", "PageDown"].includes(event.key)) {
        event.preventDefault();
        move(event.key === "ArrowLeft" || event.key === "PageUp" ? -1 : 1);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        navigate(event.key === "Home" ? 0 : maximum());
      } else cancelPaging();
    });
    const initial = revealCurrentAt(clamp(viewport.scrollLeft));
    if (initial !== viewport.scrollLeft) scrollTo(initial, "instant");
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(resize).observe(viewport);
    window.addEventListener("resize", resize);
    update();
  });
  page.querySelector("[data-trending-date-select]")?.addEventListener("change", (event) => {
    location.href = event.target.value;
  });
  const search = page.querySelector("[data-trending-search]");
  const input = search?.querySelector("[data-trending-search-input]");
  const results = search?.querySelector("[data-trending-search-results]");
  const clear = search?.querySelector("[data-trending-search-clear]");
  let searchEntries;
  let searchVersion = 0;
  let debounce;
  const showResults = (message, entries = [], total = 0) => {
    results.replaceChildren();
    const status = document.createElement("p");
    status.className = "trending-search-status";
    status.textContent = message;
    results.append(status);
    for (const entry of entries) {
      const item = document.createElement("div");
      item.className = "trending-search-entry";
      const link = document.createElement("a");
      link.href = entry.dailyArticle || entry.periods?.weekly || entry.periods?.monthly || entry.periods?.yearly || entry.url;
      if (link.href.startsWith("https://github.com/")) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      const title = document.createElement("strong");
      title.textContent = entry.repo;
      const detail = document.createElement("span");
      detail.textContent = entry.summary || entry.description || "查看项目仓库";
      const meta = document.createElement("small");
      meta.textContent = `${(entry.tags || ["其他"]).join(" · ")} · 上榜 ${entry.days} 天 · 最近 ${entry.lastSeen}`;
      link.append(title, detail, meta);
      item.append(link);
      const alternatives = document.createElement("div");
      alternatives.className = "trending-search-alternatives";
      for (const [period, label] of [["weekly", "周评"], ["monthly", "月评"], ["yearly", "年评"]]) {
        if (!entry.periods?.[period]) continue;
        const alternative = document.createElement("a");
        alternative.href = entry.periods[period];
        alternative.textContent = label;
        alternatives.append(alternative);
      }
      if (alternatives.childElementCount) item.append(alternatives);
      results.append(item);
    }
    if (total > entries.length) {
      const remainder = document.createElement("p");
      remainder.className = "trending-search-status";
      remainder.textContent = `仅显示前 ${entries.length} 项，缩小关键词可继续查找。`;
      results.append(remainder);
    }
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };
  const hideResults = () => {
    results.hidden = true;
    input.setAttribute("aria-expanded", "false");
  };
  const runSearch = async () => {
    const query = input.value.trim().toLocaleLowerCase();
    const version = ++searchVersion;
    clear.hidden = !query;
    if (!query) { hideResults(); return; }
    showResults("正在搜索...");
    try {
      if (!searchEntries) {
        const response = await fetch("/api/github-trending-search.json", { cache: "no-cache" });
        if (!response.ok) throw new Error("Search index unavailable");
        searchEntries = (await response.json()).entries;
      }
      if (version !== searchVersion) return;
      const terms = query.split(/\s+/).filter(Boolean);
      const matches = searchEntries.filter((entry) => {
        const haystack = `${entry.repo} ${entry.summary || ""} ${entry.description} ${(entry.tags || []).join(" ")}`.toLocaleLowerCase();
        return terms.every((term) => haystack.includes(term));
      }).sort((a, b) => {
        const aName = a.repo.toLocaleLowerCase();
        const bName = b.repo.toLocaleLowerCase();
        return Number(bName === query) - Number(aName === query)
          || Number(bName.startsWith(query)) - Number(aName.startsWith(query))
          || b.days - a.days || b.peakStars - a.peakStars;
      });
      showResults(matches.length ? `找到 ${matches.length} 个项目` : "没有找到匹配的项目", matches.slice(0, 20), matches.length);
    } catch { if (version === searchVersion) showResults("搜索暂不可用，请稍后重试。"); }
  };
  input?.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(runSearch, 120); });
  search?.querySelector("[data-trending-search-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearTimeout(debounce);
    await runSearch();
    const first = results.querySelector("a");
    if (first && !results.hidden) location.href = first.href;
  });
  clear?.addEventListener("click", () => { input.value = ""; searchVersion++; hideResults(); clear.hidden = true; input.focus(); });
  input?.addEventListener("keydown", (event) => { if (event.key === "Escape") { input.value = ""; searchVersion++; hideResults(); clear.hidden = true; } });
  document.addEventListener("click", (event) => { if (search && !search.contains(event.target)) hideResults(); });
  const mobile = matchMedia("(max-width: 760px)");
  let activeTag = "all";
  let shown = mobile.matches ? 10 : 30;

  const render = () => {
    buttons.forEach((button) => {
      const active = button.dataset.trendingFilter === activeTag;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    let visibleCards = 0;
    cards.forEach((card) => {
      const match = activeTag === "all" || (card.dataset.tags || "").split("|").includes(activeTag);
      card.hidden = !match;
      if (match) visibleCards++;
    });
    if (empty) empty.hidden = visibleCards !== 0;
    let count = 0;
    rows.forEach((row) => {
      const match = activeTag === "all" || (row.dataset.tags || "").split("|").includes(activeTag);
      if (match) count++;
      row.hidden = !match || count > shown;
    });
    if (more) more.hidden = count <= shown;
  };

  buttons.forEach((button) => button.addEventListener("click", () => {
    activeTag = button.dataset.trendingFilter;
    shown = mobile.matches ? 10 : 30;
    render();
  }));
  more?.addEventListener("click", () => { shown += mobile.matches ? 10 : 30; render(); });
  mobile.addEventListener?.("change", () => { shown = mobile.matches ? 10 : 30; render(); });
  render();
})();
