(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const section = document.body.dataset.section || "home";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const numberFormatter = new Intl.NumberFormat("zh-CN");
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
      const update = () => { clock.textContent = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "medium", hour12: false }).format(new Date()); };
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
  initHome();
  initSearch();
  initTools();
  initArticle();
})();
