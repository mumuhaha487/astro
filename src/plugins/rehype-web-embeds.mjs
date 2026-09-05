import { visit } from "unist-util-visit";

export const WEB_EMBED_TITLE_PREFIX = "astro-web-embed:";
const MIN_HEIGHT = 320;
const MAX_HEIGHT = 1200;

export function rehypeWebEmbeds() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (node.tagName !== "a" || typeof node.properties?.href !== "string") return;
			const height = parseHeight(node.properties.title);
			const src = height === null ? null : safeEmbedUrl(node.properties.href);
			if (!src || typeof index !== "number" || !parent) return;

			const title = textContent(node).trim() || "内嵌网页";
			parent.children[index] = {
				type: "element",
				tagName: "span",
				properties: {
					className: ["web-page-embed"],
					"data-web-page-embed": "",
				},
				children: [
					{
						type: "element",
						tagName: "span",
						properties: { className: ["web-page-embed-header"] },
						children: [
							{
								type: "element",
								tagName: "strong",
								properties: {},
								children: [{ type: "text", value: title }],
							},
							{
								type: "element",
								tagName: "a",
								properties: {
									className: ["web-page-open", "no-styling"],
									href: src,
									target: "_blank",
									rel: ["noopener", "noreferrer"],
									title: "在新窗口打开",
								},
								children: [{ type: "text", value: "↗" }],
							},
						],
					},
					{
						type: "element",
						tagName: "iframe",
						properties: {
							src,
							title,
							loading: "lazy",
							referrerPolicy: "no-referrer",
							sandbox: ["allow-scripts", "allow-forms", "allow-modals", "allow-pointer-lock", "allow-popups", "allow-downloads"],
							allow: "autoplay; fullscreen; gamepad",
							allowFullScreen: true,
							style: `height:${height}px`,
						},
						children: [],
					},
				],
			};
		});
	};
}

function parseHeight(value) {
	if (typeof value !== "string") return null;
	const match = value.match(/^astro-web-embed:(\d{3,4})$/);
	if (!match) return null;
	const height = Number.parseInt(match[1], 10);
	return height >= MIN_HEIGHT && height <= MAX_HEIGHT ? height : null;
}

function safeEmbedUrl(value) {
	try {
		const url = new URL(value, "https://blog.invalid");
		if (url.origin !== "https://blog.invalid") return null;
		const decoded = decodeURIComponent(url.pathname);
		if (decoded.includes("\\") || decoded.split("/").includes("..")) return null;
		if (!/^\/web-pages\/editor\/(?:html|zip)\/[0-9a-f]{24}\/.+\.html?$/i.test(decoded)) return null;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return null;
	}
}

function textContent(node) {
	if (node.type === "text") return node.value || "";
	return Array.isArray(node.children) ? node.children.map(textContent).join("") : "";
}
