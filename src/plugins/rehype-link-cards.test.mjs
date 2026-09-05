import assert from "node:assert/strict";
import test from "node:test";

import { rehypeLinkCards } from "./rehype-link-cards.mjs";

test("turns marked external links into portable link-card markup", () => {
	const tree = {
		type: "root",
		children: [{
			type: "element",
			tagName: "p",
			properties: {},
			children: [{
				type: "element",
				tagName: "a",
				properties: { href: "https://md.vmss.cn/", title: "astro-link-card" },
				children: [{ type: "text", value: "Astro Studio" }],
			}],
		}],
	};

	rehypeLinkCards()(tree);
	const link = tree.children[0].children[0];
	assert.deepEqual(link.properties.className, ["external-link", "link-card"]);
	assert.equal(link.properties.title, undefined);
	assert.equal(link.properties["data-link-card"], "");
	assert.deepEqual(link.children.map((child) => child.children[0].value), [
		"Astro Studio",
		"https://md.vmss.cn/",
	]);
});

test("beautifies ordinary external links without changing their content", () => {
	const child = { type: "text", value: "文档" };
	const link = {
		type: "element",
		tagName: "a",
		properties: { href: "https://docs.astro.build/" },
		children: [child],
	};
	const tree = { type: "root", children: [link] };

	rehypeLinkCards()(tree);
	assert.deepEqual(link.properties.className, ["external-link"]);
	assert.equal(link.children[0], child);
});
