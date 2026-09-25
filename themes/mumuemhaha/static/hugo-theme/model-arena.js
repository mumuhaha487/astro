(() => {
  const root = document.querySelector("[data-arena]");
  if (!root) return;
  const all = (selector) => [...root.querySelectorAll(selector)];
  const tracks = all("[data-arena-track]");
  const projects = all("[data-arena-project]");
  const providers = all("[data-arena-provider]");
  const models = all("[data-arena-model]");
  const frame = root.querySelector("[data-arena-frame]");
  const title = root.querySelector("[data-arena-title]");
  const path = root.querySelector("[data-arena-path]");
  const placeholder = root.querySelector("[data-arena-placeholder]");
  const promptSection = root.querySelector("[data-arena-prompt]");
  const promptText = root.querySelector("[data-arena-prompt-text]");

  function render(choice, updateUrl = true) {
    const track = tracks.find((node) => node.dataset.arenaTrack === choice.track) || tracks[0];
    if (!track) return;
    const visibleProjects = projects.filter((node) => node.dataset.track === track.dataset.arenaTrack);
    const project = visibleProjects.find((node) => node.dataset.arenaProject === choice.project) || visibleProjects[0];
    const visibleProviders = providers.filter((node) => node.dataset.project === project?.dataset.arenaProject);
    const provider = visibleProviders.find((node) => node.dataset.arenaProvider === choice.provider);
    const visibleModels = models.filter((node) => node.dataset.provider === provider?.dataset.arenaProvider);
    const model = visibleModels.find((node) => node.dataset.arenaModel === choice.model);
    for (const node of tracks) {
      const active = node === track;
      node.setAttribute("aria-selected", String(active));
    }
    for (const [nodes, visible, selected] of [[projects, visibleProjects, project], [providers, visibleProviders, provider], [models, visibleModels, model]]) {
      for (const node of nodes) {
        node.hidden = !visible.includes(node);
        node.classList.toggle("active", node === selected);
        if (node === selected) node.setAttribute("aria-current", "true");
        else node.removeAttribute("aria-current");
      }
    }
    for (const [key, nodes] of [["projects", visibleProjects], ["providers", visibleProviders], ["models", visibleModels]]) {
      root.querySelector(`[data-empty="${key}"]`).hidden = nodes.length > 0;
    }
    promptSection.hidden = !project;
    promptText.textContent = project?.dataset.prompt || "尚未填写提示词";
    const url = model?.dataset.url || "";
    title.textContent = model?.dataset.name || "选择作品";
    path.textContent = [track.textContent, project?.textContent, provider?.textContent].filter(Boolean).join(" / ");
    if (url && /^\/model-arena\/submissions\/[0-9a-f-]{36}(?:\.html|\/(?:[^/?#]+\/)*[^/?#]+\.html?)$/.test(url)) {
      const source = `https://md.vmss.cn${url}?render=3`;
      if (frame.dataset.source !== source) {
        frame.src = source;
        frame.dataset.source = source;
      }
      frame.title = `${model.dataset.name} 作品`;
      frame.hidden = false;
      placeholder.hidden = true;
    } else {
      frame.hidden = true;
      if (frame.dataset.source) frame.src = "about:blank";
      delete frame.dataset.source;
      placeholder.hidden = false;
      placeholder.textContent = model ? "该模型暂无作品" : "选择模型查看作品";
    }
    if (updateUrl) {
      const next = new URL(window.location.href);
      for (const [key, value] of Object.entries({ track: track.dataset.arenaTrack, project: project?.dataset.arenaProject, provider: provider?.dataset.arenaProvider, model: model?.dataset.arenaModel })) {
        if (value) next.searchParams.set(key, value);
        else next.searchParams.delete(key);
      }
      history.pushState(null, "", next);
    }
  }

  function fromUrl() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(["track", "project", "provider", "model"].map((key) => [key, params.get(key)]));
  }
  tracks.forEach((node) => node.addEventListener("click", () => render({ track: node.dataset.arenaTrack })));
  projects.forEach((node) => node.addEventListener("click", () => render({ track: node.dataset.track, project: node.dataset.arenaProject })));
  providers.forEach((node) => node.addEventListener("click", () => {
    const project = projects.find((entry) => entry.dataset.arenaProject === node.dataset.project);
    render({ track: project?.dataset.track, project: node.dataset.project, provider: node.dataset.arenaProvider });
  }));
  models.forEach((node) => node.addEventListener("click", () => {
    const provider = providers.find((entry) => entry.dataset.arenaProvider === node.dataset.provider);
    const project = projects.find((entry) => entry.dataset.arenaProject === provider?.dataset.project);
    render({ track: project?.dataset.track, project: project?.dataset.arenaProject, provider: node.dataset.provider, model: node.dataset.arenaModel });
  }));
  window.addEventListener("popstate", () => render(fromUrl(), false));
  render(fromUrl(), false);
})();
