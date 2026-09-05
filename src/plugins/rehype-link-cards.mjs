import { visit } from "unist-util-visit";

export const LINK_CARD_TITLE = "astro-link-card";

export function rehypeLinkCards() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName !== "a" || typeof node.properties?.href !== "string") return;
			const href = node.properties.href;
			if (!/^https?:\/\//i.test(href)) return;

			node.properties.className = mergeClasses(node.properties.className, "external-link");
			if (node.properties.title !== LINK_CARD_TITLE) return;

			const title = textContent(node).trim() || href;
			delete node.properties.title;
			node.properties.className = mergeClasses(node.properties.className, "link-card");
			node.properties["data-link-card"] = "";
			node.children = [
				{
					type: "element",
					tagName: "span",
					properties: { className: ["link-card-title"] },
					children: [{ type: "text", value: title }],
				},
				{
					type: "element",
					tagName: "span",
					properties: { className: ["link-card-url"] },
					children: [{ type: "text", value: href }],
				},
			];
		});
	};
}

function mergeClasses(value, className) {
	const classes = Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
	return classes.includes(className) ? classes : [...classes, className];
}

function textContent(node) {
	if (node.type === "text") return node.value || "";
	return Array.isArray(node.children) ? node.children.map(textContent).join("") : "";
}
