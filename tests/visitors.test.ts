import { describe, expect, it } from "vitest";

import { PreconditionFailedError } from "@edgeone/pages-blob";

import { countVisitors } from "../src/edgeone/visitors";

class MemoryStore {
  values = new Map<string, string>();

  async set(key: string, value: string, options?: { onlyIfNew?: boolean }) {
    if (options?.onlyIfNew && this.values.has(key)) throw new PreconditionFailedError();
    this.values.set(key, value);
  }

  async get(key: string) {
    return this.values.get(key) ?? null;
  }

  async delete(key: string) {
    this.values.delete(key);
  }

  async list({ prefix }: { prefix: string }) {
    return { blobs: [...this.values.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })) };
  }
}

describe("visitor counts", () => {
  it("counts unique browsers once and active tabs separately", async () => {
    const store = new MemoryStore();
    await countVisitors(store, { visitorId: "visitor-0000000001", sessionId: "session-0000000001" }, 1_000_000);
    const result = await countVisitors(store, { visitorId: "visitor-0000000001", sessionId: "session-0000000002" }, 1_000_100);
    expect(result).toEqual({ online: 2, total: 1 });
  });

  it("removes expired online sessions without reducing the cumulative count", async () => {
    const store = new MemoryStore();
    await countVisitors(store, { visitorId: "visitor-0000000001", sessionId: "session-0000000001" }, 1_000_000);
    const result = await countVisitors(store, { visitorId: "visitor-0000000002", sessionId: "session-0000000002" }, 1_000_000 + 120_001);
    expect(result).toEqual({ online: 1, total: 2 });
    expect(store.values.has("sessions/session-0000000001")).toBe(false);
  });
});
