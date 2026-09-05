import assert from "node:assert/strict";
import test from "node:test";

import { rehypeWebEmbeds } from "./rehype-web-embeds.mjs";

test("turns a marked static page link into a sandboxed iframe", () => {
	const tree = {
		type: "root",
		children: [{
			type: "element",
			tagName: "p",
			properties: {},
			children: [{
				type: "element",
				tagName: "a",
				properties: {
					href: "/web-pages/editor/zip/0123456789abcdef01234567/game/index.html",
					title: "astro-web-embed:680",
				},
				children: [{ type: "text", value: "小游戏" }],
			}],
		}],
	};

	rehypeWebEmbeds()(tree);
	const embed = tree.children[0].children[0];
	assert.equal(embed.tagName, "span");
	assert.deepEqual(embed.properties.className, ["web-page-embed"]);
	const frame = embed.children[1];
	assert.equal(frame.tagName, "iframe");
	assert.equal(frame.properties.src, "/web-pages/editor/zip/0123456789abcdef01234567/game/index.html");
	assert.equal(frame.properties.style, "height:680px");
	assert(frame.properties.sandbox.includes("allow-scripts"));
	assert(!frame.properties.sandbox.includes("allow-same-origin"));
});

test("does not embed external, unmarked, or traversal URLs", () => {
	for (const properties of [
		{ href: "https://example.com/game.html", title: "astro-web-embed:640" },
		{ href: "/web-pages/editor/html/0123456789abcdef01234567/index.html" },
		{ href: "/web-pages/editor/html/0123456789abcdef01234567/%2e%2e/private.html", title: "astro-web-embed:640" },
	]) {
		const link = { type: "element", tagName: "a", properties, children: [{ type: "text", value: "网页" }] };
		const tree = { type: "root", children: [link] };
		rehypeWebEmbeds()(tree);
		assert.equal(tree.children[0], link);
	}
});
