(() => {
  const page = document.querySelector("[data-trending-page]");
  if (!page) return;
  const buttons = [...page.querySelectorAll("[data-trending-filter]")];
  const cards = [...page.querySelectorAll(".trending-card")];
  const rows = [...page.querySelectorAll(".trending-repositories li")];
  const more = page.querySelector("[data-trending-more]");
  const empty = page.querySelector("[data-trending-featured-empty]");
  page.querySelector("[data-trending-date-select]")?.addEventListener("change", (event) => {
    location.href = event.target.value;
  });
  const mobile = matchMedia("(max-width: 760px)");
  let language = "all";
  let shown = mobile.matches ? 10 : 30;

  const render = () => {
    buttons.forEach((button) => {
      const active = button.dataset.trendingFilter === language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    let visibleCards = 0;
    cards.forEach((card) => {
      const match = language === "all" || card.dataset.language === language;
      card.hidden = !match;
      if (match) visibleCards++;
    });
    if (empty) empty.hidden = visibleCards !== 0;
    let count = 0;
    rows.forEach((row) => {
      const match = language === "all" || row.dataset.language === language;
      if (match) count++;
      row.hidden = !match || count > shown;
    });
    if (more) more.hidden = count <= shown;
  };

  buttons.forEach((button) => button.addEventListener("click", () => {
    language = button.dataset.trendingFilter;
    shown = mobile.matches ? 10 : 30;
    render();
  }));
  more?.addEventListener("click", () => { shown += mobile.matches ? 10 : 30; render(); });
  mobile.addEventListener?.("change", () => { shown = mobile.matches ? 10 : 30; render(); });
  render();
})();
