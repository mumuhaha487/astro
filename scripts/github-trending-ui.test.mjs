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
        language: "Go", days: 3, lastSeen: "2026-09-16", peakStars: 100,
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
  assert.deepEqual(result.children[1].children.map((link) => link.textContent), ["周评", "月评", "年评"]);
  await form.events.submit({ preventDefault() {} });
  assert.equal(calls, 1, "Submitting should use the cached index");
  assert.equal(location.href, "/github-trending/alpha/");
  clear.events.click();
  assert.equal(input.value, "");
  assert.equal(results.hidden, true);
});
