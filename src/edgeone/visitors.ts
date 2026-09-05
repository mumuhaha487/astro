import { getStore, PreconditionFailedError } from "@edgeone/pages-blob";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const ID_PATTERN = /^[A-Za-z0-9-]{16,80}$/;

interface VisitorPayload {
  visitorId?: string;
  sessionId?: string;
}

interface BlobStore {
  set(key: string, value: string, options?: { onlyIfNew?: boolean }): Promise<unknown>;
  get(key: string, options?: { type?: "text"; consistency?: "strong" }): Promise<unknown>;
  delete(key: string): Promise<unknown>;
  list(options: { prefix: string; consistency?: "strong" }): Promise<{ blobs: Array<{ key: string }> }>;
}

export async function countVisitors(store: BlobStore, payload: VisitorPayload, now = Date.now()) {
  const visitorId = payload.visitorId || "";
  const sessionId = payload.sessionId || "";
  if (!ID_PATTERN.test(visitorId) || !ID_PATTERN.test(sessionId)) {
    throw new TypeError("Invalid visitor identifier");
  }

  await Promise.all([
    store.set(`visitors/${visitorId}`, String(now), { onlyIfNew: true }).catch((error: unknown) => {
      // An existing marker means this browser has already contributed to the total.
      if (error instanceof PreconditionFailedError) return;
      throw error;
    }),
    store.set(`sessions/${sessionId}`, String(now)),
  ]);

  const [visitors, sessions] = await Promise.all([
    store.list({ prefix: "visitors/", consistency: "strong" }),
    store.list({ prefix: "sessions/", consistency: "strong" }),
  ]);

  let online = 0;
  await Promise.all(sessions.blobs.map(async ({ key }) => {
    const value = await store.get(key, { type: "text", consistency: "strong" });
    const lastSeen = Number(value || 0);
    if (Number.isFinite(lastSeen) && now - lastSeen <= ONLINE_WINDOW_MS) {
      online += 1;
      return;
    }
    await store.delete(key);
  }));

  return { online, total: visitors.blobs.length };
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export async function handleVisitorRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const payload = await request.json() as VisitorPayload;
    const store = getStore("mumuemhaha-visitors") as unknown as BlobStore;
    return json(await countVisitors(store, payload));
  } catch (error) {
    if (error instanceof TypeError) return json({ error: error.message }, 400);
    console.error("Visitor counter failed", error);
    return json({ error: "Visitor counter unavailable" }, 503);
  }
}
