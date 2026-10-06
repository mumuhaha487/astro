import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

class Element {
  constructor() {
    this.children = [];
    this.events = {};
    this.targets = {};
    this.lists = {};
    this.dataset = {};
    this.classList = { toggle() {} };
    this.hidden = false;
    this.value = "";
  }
  querySelector(selector) {
    if (this.targets[selector]) return this.targets[selector];
    if (selector === "a") return this.children.find((child) => child.tagName === "a")
      || this.children.map((child) => child.querySelector?.("a")).find(Boolean) || null;
    return null;
  }
  querySelectorAll(selector) { return this.lists[selector] || []; }
  addEventListener(name, callback) { this.events[name] = callback; }
  setAttribute(name, value) { this[name] = value; }
  replaceChildren(...children) { this.children = children; }
  append(...children) { this.children.push(...children); }
  get childElementCount() { return this.children.length; }
  focus() {}
}

test("project search loads on demand, exposes period articles, and clears", async () => {
  const document = new Element();
  document.createElement = (tagName) => Object.assign(new Element(), { tagName });
  const page = new Element();
  const search = new Element();
  const input = new Element();
  const results = new Element();
  const clear = new Element();
  const form = new Element();
  page.targets["[data-trending-search]"] = search;
  search.targets["[data-trending-search-input]"] = input;
  search.targets["[data-trending-search-results]"] = results;
  search.targets["[data-trending-search-clear]"] = clear;
  search.targets["[data-trending-search-form]"] = form;
  document.targets["[data-trending-page]"] = page;
  let calls = 0;
  const location = { href: "" };
  const source = readFileSync(new URL("../themes/mumuemhaha/static/hugo-theme/github-trending.js", import.meta.url), "utf8");
  vm.runInNewContext(source, {
    document, location, setTimeout, clearTimeout,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    fetch: async () => {
      calls++;
      return { ok: true, json: async () => ({ entries: [{
        repo: "owner/Alpha", description: "Build tool", summary: "项目工具",
        language: "Go", tags: ["AI", "Skill"], days: 3, lastSeen: "2026-09-16", peakStars: 100,
        url: "https://github.com/owner/Alpha", dailyArticle: "/github-trending/alpha/",
        periods: { weekly: "/github-trending/weekly/alpha/", monthly: "/github-trending/monthly/alpha/", yearly: "/github-trending/yearly/alpha/" },
      }] }) };
    },
  });
  assert.equal(calls, 0, "Search index must be lazy-loaded");
  input.value = "alpha";
  input.events.input();
  await new Promise((done) => setTimeout(done, 180));
  assert.equal(calls, 1);
  assert.equal(results.hidden, false);
  assert.equal(results.children[0].textContent, "找到 1 个项目");
  const result = results.children[1];
  assert.equal(result.children[0].href, "/github-trending/alpha/");
  assert.match(result.children[0].children[2].textContent, /AI · Skill/);
  assert.deepEqual(result.children[1].children.map((link) => link.textContent), ["周评", "月评", "年评"]);
  await form.events.submit({ preventDefault() {} });
  assert.equal(calls, 1, "Submitting should use the cached index");
  assert.equal(location.href, "/github-trending/alpha/");
  clear.events.click();
  assert.equal(input.value, "");
  assert.equal(results.hidden, true);
});

test("a category matches multi-tag projects and resets pagination", () => {
  const document = new Element();
  const page = new Element();
  const button = new Element();
  button.dataset.trendingFilter = "安全";
  const all = new Element();
  all.dataset.trendingFilter = "all";
  const matching = new Element();
  matching.dataset.tags = "AI|安全|Skill";
  const other = new Element();
  other.dataset.tags = "教程";
  const more = new Element();
  page.lists["[data-trending-filter]"] = [all, button];
  page.lists[".trending-repositories li"] = [matching, other];
  page.targets["[data-trending-more]"] = more;
  document.targets["[data-trending-page]"] = page;
  const source = readFileSync(new URL("../themes/mumuemhaha/static/hugo-theme/github-trending.js", import.meta.url), "utf8");
  vm.runInNewContext(source, { document, matchMedia: () => ({ matches: true, addEventListener() {} }) });
  button.events.click();
  assert.equal(matching.hidden, false);
  assert.equal(other.hidden, true);
  assert.equal(button["aria-pressed"], "true");
  assert.equal(more.hidden, true);
});

function dateStrip({ width = 320, contentWidth = 1100, currentStart, currentWidth = 112, smooth = false, observer = true } = {}) {
  const document = new Element();
  const page = new Element();
  const strip = new Element();
  const viewport = new Element();
  const previous = new Element();
  const next = new Element();
  const select = new Element();
  const window = new Element();
  const reducedMotion = { matches: false };
  const scrolls = [];
  const observers = [];
  Object.assign(viewport, { clientWidth: width, scrollWidth: contentWidth, scrollLeft: 0, clientLeft: 0 });
  viewport.getBoundingClientRect = () => ({ left: 53.5, right: 53.5 + viewport.clientWidth });
  viewport.scrollTo = (options) => {
    scrolls.push(options);
    if (smooth && options.behavior === "smooth") return;
    viewport.scrollLeft = Math.max(0, Math.min(options.left, viewport.scrollWidth - viewport.clientWidth));
    viewport.events.scroll?.();
  };
  let current;
  if (currentStart !== undefined) {
    current = new Element();
    current.href = "/github-trending/2026-09-16/";
    current.getBoundingClientRect = () => {
      const left = 53.5 + viewport.clientLeft + currentStart - viewport.scrollLeft;
      return { left, right: left + currentWidth, width: currentWidth };
    };
    viewport.targets['[aria-current="page"]'] = current;
  }
  strip.targets["[data-trending-date-viewport]"] = viewport;
  strip.targets["[data-trending-date-prev]"] = previous;
  strip.targets["[data-trending-date-next]"] = next;
  page.lists["[data-trending-date-strip]"] = [strip];
  page.targets["[data-trending-date-select]"] = select;
  document.targets["[data-trending-page]"] = page;
  const location = { href: "" };
  const context = {
    document, window, location,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reducedMotion : { matches: false, addEventListener() {} },
  };
  if (observer) context.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
  };
  vm.runInNewContext(readFileSync(new URL("../themes/mumuemhaha/static/hugo-theme/github-trending.js", import.meta.url), "utf8"), context);
  return { viewport, previous, next, scrolls, observers, window, reducedMotion, location, select, current };
}

for (const width of [246, 1040]) {
  test(`date arrows page by the visible width (${width}px), in both directions`, () => {
    const { viewport, previous, next, scrolls, location } = dateStrip({ width, contentWidth: width * 4 });
    assert.equal(previous.disabled, true);
    assert.equal(next.disabled, false);
    next.events.click();
    assert.equal(viewport.scrollLeft, width);
    assert.equal(previous.disabled, false);
    next.events.click();
    assert.equal(viewport.scrollLeft, width * 2);
    previous.events.click();
    assert.equal(viewport.scrollLeft, width);
    assert.equal(scrolls.at(-1).behavior, "smooth");
    assert.equal(location.href, "", "Paging must not navigate away from the date page");
  });
}

test("date paging clamps at both ends, including fractional scroll positions", () => {
  const { viewport, previous, next } = dateStrip({ width: 320, contentWidth: 1000 });
  for (const expected of [320, 640, 680, 680]) {
    next.events.click();
    assert.equal(viewport.scrollLeft, expected);
  }
  assert.equal(next.disabled, true);
  for (const expected of [360, 40, 0, 0]) {
    previous.events.click();
    assert.equal(viewport.scrollLeft, expected);
  }
  assert.equal(previous.disabled, true);
  viewport.scrollLeft = 679.5;
  viewport.events.scroll();
  assert.equal(next.disabled, true, "Subpixel rounding must not leave the end arrow enabled");
  viewport.scrollLeft = -20;
  viewport.events.scroll();
  assert.equal(previous.disabled, true, "Native elastic scrolling must retain the left boundary");
  viewport.scrollLeft = 710;
  viewport.events.scroll();
  assert.equal(next.disabled, true);
});

test("date arrows disable when content fits, or the viewport has no width", () => {
  for (const [width, contentWidth] of [[320, 320], [1000, 320], [0, 320]]) {
    const { viewport, previous, next } = dateStrip({ width, contentWidth });
    assert.equal(previous.disabled, true);
    assert.equal(next.disabled, true);
    next.events.click();
    assert.equal(viewport.scrollLeft, 0);
  }
});

test("native scrolling and container resizing update date boundaries and page distance", () => {
  const { viewport, previous, next, observers } = dateStrip();
  viewport.scrollLeft = 250;
  viewport.events.scroll();
  assert.equal(previous.disabled, false);
  assert.equal(next.disabled, false);
  viewport.scrollLeft = 780;
  viewport.events.scroll();
  assert.equal(next.disabled, true);
  assert.equal(observers[0].target, viewport);
  viewport.clientWidth = 200;
  observers[0].callback();
  assert.equal(next.disabled, false);
  previous.events.click();
  assert.equal(viewport.scrollLeft, 580, "Paging must use the resized viewport width");
  viewport.clientWidth = 1200;
  viewport.scrollLeft = 0;
  observers[0].callback();
  assert.equal(previous.disabled, true);
  assert.equal(next.disabled, true);
});

test("window resize updates date boundaries when ResizeObserver is unavailable", () => {
  const { viewport, previous, next, window } = dateStrip({ observer: false });
  viewport.clientWidth = 1200;
  window.events.resize();
  assert.equal(previous.disabled, true);
  assert.equal(next.disabled, true);
  viewport.clientWidth = 250;
  window.events.resize();
  assert.equal(next.disabled, false);
  next.events.click();
  assert.equal(viewport.scrollLeft, 250);
});

test("date controls allow reversing a pending page and disable at its requested end", () => {
  const { viewport, previous, next, scrolls } = dateStrip({ contentWidth: 640, smooth: true });
  next.events.click();
  assert.equal(scrolls.at(-1).left, 320);
  assert.equal(previous.disabled, false, "A queued page can be reversed immediately");
  assert.equal(next.disabled, true, "A queued end cannot accept another forward page");
  viewport.scrollLeft = 160;
  viewport.events.scroll();
  assert.equal(previous.disabled, false);
  assert.equal(next.disabled, true);
  viewport.scrollLeft = 320;
  viewport.events.scroll();
  assert.equal(next.disabled, true);
});

test("rapid smooth paging accumulates whole pages before and during animation, including reversal", () => {
  const { viewport, previous, next, scrolls } = dateStrip({ contentWidth: 2000, smooth: true });
  next.events.click();
  assert.equal(scrolls.at(-1).left, 320);
  next.events.click();
  assert.equal(scrolls.at(-1).left, 640, "The second click must add a page before any animation progress");
  viewport.scrollLeft = 100;
  viewport.events.scroll();
  next.events.click();
  assert.equal(scrolls.at(-1).left, 960, "Animation progress must not replace the intended destination");
  previous.events.click();
  assert.equal(scrolls.at(-1).left, 640);
  previous.events.click();
  assert.equal(scrolls.at(-1).left, 320);
  previous.events.click();
  assert.equal(scrolls.at(-1).left, 0);
  assert.equal(previous.disabled, true);
  assert.equal(next.disabled, false);
});

test("pending smooth destinations clamp at the end and reverse by one whole page", () => {
  const { next, previous, scrolls } = dateStrip({ contentWidth: 1000, smooth: true });
  for (const expected of [320, 640, 680, 680]) {
    next.events.click();
    assert.equal(scrolls.at(-1).left, expected);
  }
  previous.events.click();
  assert.equal(scrolls.at(-1).left, 360);
});

test("native input cancels a pending animation so paging resumes from the user's position", () => {
  for (const input of ["wheel", "touchstart", "pointerdown"]) {
    const { viewport, next, scrolls } = dateStrip({ contentWidth: 2000, smooth: true });
    next.events.click();
    next.events.click();
    viewport.scrollLeft = 100;
    viewport.events.scroll();
    viewport.events[input]();
    assert.equal(scrolls.at(-1).left, 100);
    assert.equal(scrolls.at(-1).behavior, "instant", "Native input must stop the old animation");
    viewport.scrollLeft = 150;
    viewport.events.scroll();
    next.events.click();
    assert.equal(scrolls.at(-1).left, 470);
  }
});

test("smooth completion and interrupted scrollend reconcile the next page with the actual position", () => {
  const { viewport, next, scrolls } = dateStrip({ contentWidth: 2000, smooth: true });
  next.events.click();
  next.events.click();
  viewport.scrollLeft = 640;
  viewport.events.scroll();
  viewport.scrollLeft = 500;
  viewport.events.scroll();
  next.events.click();
  assert.equal(scrolls.at(-1).left, 820, "A completed destination must not override later native scrolling");
  viewport.scrollLeft = 600;
  viewport.events.scrollend();
  next.events.click();
  assert.equal(scrolls.at(-1).left, 920, "An interrupted animation must settle to the scrollend position");
});

test("shrinking retains a selected historical date that was visible in the original container", () => {
  for (const observer of [true, false]) {
    const { viewport, current, observers, window, scrolls } = dateStrip({ width: 1040, contentWidth: 1040, currentStart: 900, observer });
    assert.equal(scrolls.length, 0, "Selection starts visible without initial scrolling");
    viewport.clientWidth = 246;
    if (observer) observers[0].callback();
    else window.events.resize();
    assert.equal(viewport.scrollLeft, 766);
    const bounds = current.getBoundingClientRect();
    const left = viewport.getBoundingClientRect().left;
    assert.ok(bounds.left >= left);
    assert.ok(bounds.right <= left + viewport.clientWidth);
    assert.equal(scrolls.at(-1).behavior, "instant");
    const calls = scrolls.length;
    window.events.resize();
    assert.equal(scrolls.length, calls, "Duplicate resize callbacks must not scroll again");
  }
});

test("resizing respects native browsing away from selection and preserves it after browsing back", () => {
  const { viewport, current, observers } = dateStrip({ width: 1040, contentWidth: 3000, currentStart: 900 });
  viewport.scrollLeft = 1600;
  viewport.events.scroll();
  viewport.clientWidth = 246;
  // Browsers can dispatch a resize-induced scroll before ResizeObserver runs.
  viewport.events.scroll();
  assert.equal(viewport.scrollLeft, 1600, "Resizing must not return to a selection the user left");
  observers[0].callback();
  viewport.scrollLeft = 800;
  viewport.events.scroll();
  viewport.clientWidth = 150;
  observers[0].callback();
  const bounds = current.getBoundingClientRect();
  const left = viewport.getBoundingClientRect().left;
  assert.ok(bounds.left >= left);
  assert.ok(bounds.right <= left + viewport.clientWidth);
});

test("resize-induced scrolling does not discard previously visible selection", () => {
  const { viewport, current } = dateStrip({ width: 1040, contentWidth: 2000, currentStart: 900 });
  viewport.clientWidth = 246;
  viewport.events.scroll();
  assert.equal(viewport.scrollLeft, 766);
  assert.ok(current.getBoundingClientRect().right <= viewport.getBoundingClientRect().right);
});

test("resizing after arrow browsing respects both in-flight and completed destinations", () => {
  for (const smooth of [true, false]) {
    const { viewport, next, current, observers, scrolls } = dateStrip({ width: 1040, contentWidth: 3000, currentStart: 900, smooth });
    next.events.click();
    assert.equal(viewport.scrollLeft, smooth ? 0 : 1040);
    viewport.clientWidth = 246;
    observers[0].callback();
    assert.equal(viewport.scrollLeft, 1040, "Resizing respects the user's requested destination");
    assert.ok(current.getBoundingClientRect().right < viewport.getBoundingClientRect().left);
    next.events.click();
    assert.equal(scrolls.at(-1).left, 1286, "The next page uses the resized width");
  }
});

test("opening a historical page reveals its full selected date without moving the page", () => {
  for (const currentStart of [0, 400, 988]) {
    const { viewport, scrolls, current, location } = dateStrip({ currentStart });
    const bounds = current.getBoundingClientRect();
    const visibleLeft = viewport.getBoundingClientRect().left;
    assert.ok(bounds.left >= visibleLeft);
    assert.ok(bounds.right <= visibleLeft + viewport.clientWidth);
    assert.equal(scrolls.length, currentStart === 0 ? 0 : 1);
    if (scrolls.length) assert.equal(scrolls[0].behavior, "instant");
    assert.equal(location.href, "");
    assert.equal(current.href, "/github-trending/2026-09-16/");
  }
});

test("keyboard date paging supports directions and endpoints without hijacking links", () => {
  const { viewport, current, reducedMotion, scrolls } = dateStrip({ currentStart: 0 });
  reducedMotion.matches = true;
  let prevented = 0;
  const press = (key, extras = {}) => viewport.events.keydown({ key, target: viewport, preventDefault() { prevented++; }, ...extras });
  for (const [key, expected] of [["ArrowRight", 320], ["PageDown", 640], ["ArrowLeft", 320], ["PageUp", 0], ["End", 780], ["Home", 0]]) {
    press(key);
    assert.equal(viewport.scrollLeft, expected);
    assert.equal(scrolls.at(-1).behavior, "instant");
  }
  assert.equal(prevented, 6);
  const before = scrolls.length;
  press("Enter", { target: current });
  press("ArrowRight", { target: current });
  press("ArrowLeft", { altKey: true });
  press("ArrowRight", { ctrlKey: true });
  assert.equal(scrolls.length, before);
  assert.equal(prevented, 6);
});

test("reduced-motion preference is honored by buttons and the date dropdown still navigates", () => {
  const { next, reducedMotion, scrolls, select, location } = dateStrip();
  reducedMotion.matches = true;
  next.events.click();
  assert.equal(scrolls.at(-1).behavior, "instant");
  reducedMotion.matches = false;
  next.events.click();
  assert.equal(scrolls.at(-1).behavior, "smooth");
  const href = "/github-trending/weekly/2026-w38/";
  select.events.change({ target: { value: href } });
  assert.equal(location.href, href);
});

test("all archive entries share fixed sibling controls and a constrained scroll viewport", () => {
  const layout = (path) => readFileSync(new URL(`../themes/mumuemhaha/${path}`, import.meta.url), "utf8");
  const daily = layout("layouts/github-trending/list.html");
  const periods = layout("layouts/partials/github-trending-period-list.html");
  const strip = layout("layouts/partials/github-trending-date-strip.html");
  const css = layout("static/hugo-theme/github-trending.css");
  for (const template of [daily, periods]) {
    assert.match(template, /partial "github-trending-date-strip.html"/);
    assert.doesNotMatch(template, /range first (14|12)/);
    assert.match(template, /data-trending-date-select/);
  }
  assert.match(strip, /range \.entries/);
  assert.match(strip, /<a href="{{ \.RelPermalink }}"/);
  assert.match(strip, /data-trending-date-prev[\s\S]*<div[^>]*data-trending-date-viewport[\s\S]*<\/div>\s*<button[^>]*data-trending-date-next/);
  assert.match(strip, /aria-label="向左翻一页日期"[\s\S]*"name" "chevron-left"/);
  assert.match(strip, /aria-label="向右翻一页日期"[\s\S]*"name" "chevron-right"/);
  assert.match(strip, /tabindex="0"/);
  assert.equal((strip.match(/aria-controls="trending-date-viewport"/g) || []).length, 2);
  assert.match(css, /\.trending-date-strip\s*{[^}]*grid-template-columns:\s*44px minmax\(0,\s*1fr\) 44px/);
  assert.match(css, /\.trending-dates\s*{[^}]*min-width:\s*0/);
});
