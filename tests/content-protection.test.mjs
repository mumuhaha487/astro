import assert from "node:assert/strict";
import test from "node:test";

import { decryptHtml, encryptHtml } from "../scripts/lib/content-protection.mjs";

test("encrypted Hugo content round-trips with the correct password", async () => {
  const html = "<h2>Private heading</h2><p>Only the reader should see this.</p>";
  const payload = await encryptHtml(html, "correct horse battery staple", { iterations: 1_000 });
  assert.equal(await decryptHtml(payload, "correct horse battery staple"), html);
  assert.equal(JSON.stringify(payload).includes("Private heading"), false);
});

test("encrypted Hugo content rejects an incorrect password", async () => {
  const payload = await encryptHtml("secret", "right-password", { iterations: 1_000 });
  await assert.rejects(() => decryptHtml(payload, "wrong-password"));
});
