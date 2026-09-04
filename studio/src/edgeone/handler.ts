import { getStore } from "@edgeone/pages-blob";

import worker, { type BlogStudioEnv, type ObjectBucket } from "../worker/index";

interface EdgeOneContext {
  request: Request;
  env: Record<string, string | undefined>;
  clientIp?: string;
  waitUntil?(task: Promise<unknown>): void;
}

class EdgeOneBlobBucket implements ObjectBucket {
  private readonly store = getStore("astro-blog-studio");

  async get(key: string): Promise<{ json<T>(): Promise<T> } | null> {
    const value = await this.store.get(key, { type: "text", consistency: "strong" });
    if (value === null) return null;
    return {
      async json<T>() {
        return JSON.parse(String(value)) as T;
      },
    };
  }

  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
  ): Promise<void> {
    let body: string | ArrayBuffer | ReadableStream;
    if (ArrayBuffer.isView(value)) {
      body = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
    } else {
      body = value;
    }
    await this.store.set(key, body);
  }

  async delete(key: string): Promise<void> {
    await this.store.delete(key);
  }

  async list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string }> }> {
    const result = await this.store.list({
      prefix: options?.prefix,
      consistency: "strong",
    });
    return { objects: result.blobs.map((entry) => ({ key: entry.key })) };
  }
}

export async function handleEdgeOneRequest(context: EdgeOneContext): Promise<Response> {
  const requestUrl = externalRequestUrl(context.request);
  const origin = requestUrl.origin;
  const request = new Request(requestUrl, context.request);
  if (context.clientIp && !request.headers.has("CF-Connecting-IP")) {
    request.headers.set("CF-Connecting-IP", context.clientIp);
  }
  const env: BlogStudioEnv = {
    ASSETS: {
      fetch(input, init) {
        const request = input instanceof Request ? input : new Request(input, init);
        return fetch(new Request(new URL(new URL(request.url).pathname, origin), request));
      },
    },
    DRAFTS: new EdgeOneBlobBucket(),
    EDITOR_PASSWORD: context.env.EDITOR_PASSWORD || "",
    SESSION_SECRET: context.env.SESSION_SECRET || "",
    GITHUB_TOKEN: context.env.GITHUB_TOKEN || undefined,
    GITHUB_OWNER: context.env.GITHUB_OWNER || "mumuhaha487",
    GITHUB_REPO: context.env.GITHUB_REPO || "astro",
    GITHUB_BRANCH: context.env.GITHUB_BRANCH || "main",
  };

  if (!env.EDITOR_PASSWORD || !env.SESSION_SECRET) {
    return new Response(JSON.stringify({ error: "EdgeOne 环境变量尚未配置" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const url = new URL(request.url);
  if (url.pathname === "/api/cron/publish" && request.method === "POST") {
    const tasks: Promise<unknown>[] = [];
    await worker.scheduled({} as ScheduledController, env, {
      waitUntil(task: Promise<unknown>) {
        tasks.push(task);
      },
      passThroughOnException() {},
      props: {},
    } as unknown as ExecutionContext);
    await Promise.all(tasks);
    return new Response(null, { status: 204 });
  }

  return worker.fetch(request, env);
}

function externalRequestUrl(request: Request): URL {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("X-Forwarded-Host")?.split(",", 1)[0]?.trim();
  const host = forwardedHost || request.headers.get("Host")?.trim();
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) return url;

  const forwardedProto = request.headers.get("X-Forwarded-Proto")?.split(",", 1)[0]?.trim();
  const protocol = forwardedProto === "http" || forwardedProto === "https"
    ? `${forwardedProto}:`
    : url.protocol;
  url.protocol = protocol;
  url.host = host;
  return url;
}
