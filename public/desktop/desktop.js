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
  const quickSettings = document.getElementById("quick-settings");
  const calendarPanel = document.getElementById("calendar-panel");
  const contextMenu = document.getElementById("desktop-context");
  const selectionBox = document.getElementById("desktop-selection");
  const toastRegion = document.getElementById("toast-region");
  const wallpaperImage = document.getElementById("wallpaper-image");
  const wallpaperMobile = document.getElementById("wallpaper-mobile");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");

  const apps = {
    welcome: { title: "欢迎", subtitle: "Hyprland Desktop", icon: "△", kind: "welcome" },
    home: { title: "首页", subtitle: "vmss.cn", icon: "⌂", url: "/" },
    blog: { title: "博客", subtitle: "文章与笔记", icon: "▤", url: "/blog/" },
    tools: { title: "工具箱", subtitle: "本地实用工具", icon: "⌘", url: "/tools/" },
    friends: { title: "友情链接", subtitle: "朋友们的站点", icon: "⌁", url: "/friends/" },
    guestbook: { title: "留言板", subtitle: "访客留言", icon: "◌", url: "/guestbook/" },
    archive: { title: "文章归档", subtitle: "时间轴", icon: "◫", url: "/archive/" },
    terminal: { title: "终端", subtitle: "zsh · mumu@arch", icon: ">_", kind: "terminal" }
  };
  const launcherOrder = ["home", "blog", "tools", "friends", "guestbook", "archive", "terminal", "welcome"];
  const wallpaperCount = 6;
  const windows = new Map();
  const focusStack = new Map();
  let activeWorkspace = 1;
  let activeWindowId = null;
  let serial = 0;
  let topZ = 20;
  let wallpaperIndex = clamp(Number(localStorage.getItem("hypr-wallpaper") || 3), 1, wallpaperCount);
  let launcherMatches = launcherOrder.slice();
  let launcherCursor = 0;

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
  }

  function setRect(element, rect) {
    element.style.left = `${Math.round(rect.x)}px`;
    element.style.top = `${Math.round(rect.y)}px`;
    element.style.width = `${Math.max(1, Math.round(rect.width))}px`;
    element.style.height = `${Math.max(1, Math.round(rect.height))}px`;
  }

  function dwindle(items, rect, depth = 0) {
    if (!items.length) return;
    if (items.length === 1) {
      setRect(items[0], rect);
      return;
    }
    const gap = 10;
    const vertical = rect.width > rect.height * 1.08;
    const ratio = items.length === 2 ? .5 : .54;
    if (vertical) {
      const firstWidth = (rect.width - gap) * ratio;
      setRect(items[0], { x: rect.x, y: rect.y, width: firstWidth, height: rect.height });
      dwindle(items.slice(1), { x: rect.x + firstWidth + gap, y: rect.y, width: rect.width - firstWidth - gap, height: rect.height }, depth + 1);
    } else {
      const firstHeight = (rect.height - gap) * ratio;
      setRect(items[0], { x: rect.x, y: rect.y, width: rect.width, height: firstHeight });
      dwindle(items.slice(1), { x: rect.x, y: rect.y + firstHeight + gap, width: rect.width, height: rect.height - firstHeight - gap }, depth + 1);
    }
  }

  function layoutWorkspace(workspace) {
    const all = currentWindows(workspace);
    const maximized = all.filter(element => element.classList.contains("is-maximized"));
    const tiled = all.filter(element => !element.classList.contains("is-floating") && !element.classList.contains("is-maximized"));
    const width = layer.clientWidth;
    const height = layer.clientHeight;
    if (!width || !height) return;
    dwindle(tiled, { x: 0, y: 0, width, height });
    maximized.forEach(element => setRect(element, { x: 0, y: 0, width, height }));
  }

  function layoutAll() {
    for (let workspace = 1; workspace <= 5; workspace += 1) layoutWorkspace(workspace);
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
        <div class="welcome-heading"><div class="welcome-mark">△</div><div><p>ARCH LINUX · HYPRLAND</p><h1>木木em哈哈的桌面工作区</h1></div></div>
        <p class="welcome-copy">这里不是一张静态“桌面皮肤”，而是一套可以操作的动态窗口工作区。打开多个应用会自动平铺；切换工作区、浮动窗口、最大化和关闭都有连续动画。博客原有内容仍使用真实页面，只是被放进桌面窗口中。</p>
        <div class="welcome-grid">
          <section class="welcome-card"><span>01 / DYNAMIC TILING</span><h2>动态平铺</h2><p>新窗口根据可用空间自动分割，布局随窗口数量和屏幕尺寸实时调整。</p></section>
          <section class="welcome-card"><span>02 / WORKSPACES</span><h2>多工作区</h2><p>顶部 1–5 是独立工作区，使用 Alt + 数字键可以快速切换。</p></section>
          <section class="welcome-card"><span>03 / FLOATING</span><h2>平铺与浮动</h2><p>窗口右上角菱形按钮或 Alt + F 可切换浮动；浮动窗口支持拖动与缩放。</p></section>
        </div>
        <div class="shortcut-row"><span><kbd>Alt</kbd><kbd>Space</kbd> 启动器</span><span><kbd>Alt</kbd><kbd>Enter</kbd> 终端</span><span><kbd>Alt</kbd><kbd>1–5</kbd> 工作区</span><span><kbd>Alt</kbd><kbd>Q</kbd> 关闭</span><span><kbd>Alt</kbd><kbd>F</kbd> 浮动</span></div>
      </div>`;
  }

  function createTerminalContent(element) {
    const wrapper = document.createElement("div");
    wrapper.className = "terminal-app";
    wrapper.innerHTML = `<div class="terminal-output"><span class="term-accent">mumu-desktop</span> <span class="term-green">ready</span>\n输入 <span class="term-pink">help</span> 查看命令。\n\n</div><form class="terminal-command"><span class="terminal-prompt">mumu@arch ~ ❯</span><input aria-label="终端命令" autocomplete="off" spellcheck="false"></form>`;
    const output = wrapper.querySelector(".terminal-output");
    const form = wrapper.querySelector("form");
    const input = wrapper.querySelector("input");
    form.addEventListener("submit", event => {
      event.preventDefault();
      const command = input.value.trim();
      input.value = "";
      if (!command) return;
      const commandLine = document.createElement("div");
      commandLine.textContent = `mumu@arch ~ ❯ ${command}`;
      output.append(commandLine);
      runTerminalCommand(command, output, element);
      output.scrollTop = output.scrollHeight;
    });
    wrapper.addEventListener("pointerdown", () => setTimeout(() => input.focus(), 0));
    return wrapper;
  }

  function appendTerminal(output, value) {
    const line = document.createElement("div");
    line.textContent = value;
    output.append(line);
  }

  function runTerminalCommand(command, output, element) {
    const [name, ...args] = command.split(/\s+/);
    if (name === "clear") {
      output.textContent = "";
    } else if (name === "help") {
      appendTerminal(output, "help · neofetch · ls · pwd · date · clear · open <app> · workspace <1-5>");
    } else if (name === "neofetch") {
      appendTerminal(output, "       /\\        mumu@arch\n      /  \\       OS: Arch Linux (web)\n     /\\   \\      WM: Hyprland Desktop\n    /      \\     Shell: zsh\n   /   ,,   \\    Resolution: " + `${window.innerWidth}x${window.innerHeight}` + "\n  /   |  |  -\\   CPU: " + `${navigator.hardwareConcurrency || "?"} logical cores`);
    } else if (name === "ls") {
      appendTerminal(output, "首页  博客  工具箱  友情链接  留言板  文章归档");
    } else if (name === "pwd") {
      appendTerminal(output, "/home/mumu/desktop");
    } else if (name === "date") {
      appendTerminal(output, new Date().toLocaleString("zh-CN", { hour12: false }));
    } else if (name === "open") {
      const appName = args[0];
      if (apps[appName]) openApp(appName);
      else appendTerminal(output, `未找到应用：${appName || "(空)"}`);
    } else if (name === "workspace") {
      const workspace = Number(args[0]);
      if (workspace >= 1 && workspace <= 5) switchWorkspace(workspace);
      else appendTerminal(output, "工作区编号应为 1–5");
    } else {
      appendTerminal(output, `zsh: command not found: ${name}`);
    }
    focusWindow(element);
  }

  function attachWindowContent(element, app) {
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
    const frame = document.createElement("iframe");
    frame.src = app.url;
    frame.title = app.title;
    frame.loading = "eager";
    frame.referrerPolicy = "same-origin";
    frame.addEventListener("load", () => {
      element.classList.add("is-loaded");
      try {
        const frameTitle = frame.contentDocument?.title;
        if (frameTitle) element.querySelector(".window-app-subtitle").textContent = frameTitle;
      } catch (_) {
        // Same-origin in production; title access is only a progressive enhancement.
      }
    });
    content.append(frame);
  }

  function makeFloating(element) {
    const bounds = layer.getBoundingClientRect();
    const order = currentWindows().indexOf(element);
    const width = clamp(bounds.width * .68, 360, Math.max(360, bounds.width - 30));
    const height = clamp(bounds.height * .72, 260, Math.max(260, bounds.height - 30));
    element.classList.add("is-floating");
    element.classList.remove("is-maximized");
    setRect(element, {
      x: clamp(36 + order * 22, 0, bounds.width - width),
      y: clamp(28 + order * 18, 0, bounds.height - height),
      width,
      height
    });
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
    if (options.floating) makeFloating(element);
    element.classList.add("is-opening");
    setTimeout(() => element.classList.remove("is-opening"), 520);
    layoutWorkspace(Number(element.dataset.workspace));
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
      layoutWorkspace(workspace);
    }, reducedMotion.matches ? 10 : 270);
  }

  function toggleFloating(element) {
    if (!element) return;
    if (element.classList.contains("is-floating")) {
      element.classList.remove("is-floating", "is-maximized");
      element.style.resize = "";
      layoutWorkspace(Number(element.dataset.workspace));
      showToast("窗口模式", "已回到动态平铺");
    } else {
      makeFloating(element);
      showToast("窗口模式", "已切换为浮动窗口");
    }
    focusWindow(element);
  }

  function toggleMaximize(element) {
    if (!element) return;
    if (element.classList.contains("is-maximized")) {
      element.classList.remove("is-maximized");
      if (element.dataset.wasFloating === "true") element.classList.add("is-floating");
      else element.classList.remove("is-floating");
      layoutWorkspace(Number(element.dataset.workspace));
    } else {
      element.dataset.wasFloating = String(element.classList.contains("is-floating"));
      element.classList.remove("is-floating");
      element.classList.add("is-maximized");
      layoutWorkspace(Number(element.dataset.workspace));
    }
    focusWindow(element);
  }

  function bindWindow(element) {
    element.addEventListener("pointerdown", () => focusWindow(element));
    element.querySelector(".window-controls").addEventListener("click", event => {
      const action = event.target.closest("[data-window-action]")?.dataset.windowAction;
      if (action === "close") closeWindow(element);
      if (action === "float") toggleFloating(element);
      if (action === "maximize") toggleMaximize(element);
    });
    const titlebar = element.querySelector(".window-titlebar");
    titlebar.addEventListener("dblclick", event => {
      if (!event.target.closest("button")) toggleMaximize(element);
    });
    titlebar.addEventListener("pointerdown", event => {
      if (event.button !== 0 || event.target.closest("button") || !element.classList.contains("is-floating") || element.classList.contains("is-maximized")) return;
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

  function showToast(title, message, duration = 2600) {
    const toast = document.createElement("div");
    toast.className = "desktop-toast";
    toast.innerHTML = `<span>△</span><div><strong>${escapeHTML(title)}</strong><small>${escapeHTML(message)}</small></div>`;
    toastRegion.append(toast);
    setTimeout(() => toast.classList.add("is-leaving"), duration);
    setTimeout(() => toast.remove(), duration + 320);
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

  document.querySelectorAll("[data-workspace-target]").forEach(button => button.addEventListener("click", () => switchWorkspace(button.dataset.workspaceTarget)));
  document.querySelectorAll("[data-launcher-open]").forEach(button => button.addEventListener("click", openLauncher));
  document.querySelectorAll(".hypr-dock [data-app]").forEach(button => button.addEventListener("click", () => openApp(button.dataset.app)));
  document.querySelectorAll(".desktop-icon").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".desktop-icon").forEach(icon => icon.classList.remove("is-selected"));
      button.classList.add("is-selected");
      if (coarsePointer.matches) openApp(button.dataset.app);
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
    if (action === "home") window.location.href = "/";
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
    } else if (key === "f") {
      event.preventDefault();
      toggleFloating(windows.get(activeWindowId));
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
    resizeFrame = requestAnimationFrame(layoutAll);
  });
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);

  updateClock();
  updateConnection();
  setInterval(updateClock, 1000);
  document.getElementById("hardware-label").textContent = `Hyprland · ${navigator.hardwareConcurrency || "?"}T`;
  setWallpaper(wallpaperIndex, false);
  renderLauncher();
  updateWaybar();
  requestAnimationFrame(() => {
    openApp("welcome", { floating: true });
    root.dataset.desktopReady = "true";
    setTimeout(() => document.getElementById("desktop-hint").classList.add("is-dismissed"), 7000);
    setTimeout(() => showToast("桌面已就绪", "双击图标，或按 Alt + Space 打开应用"), 650);
  });
})();
