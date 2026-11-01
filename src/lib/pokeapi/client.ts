import type { z } from 'zod';

export class PokeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = 'PokeApiError';
  }
}

function abortError() {
  return new DOMException('Request cancelled', 'AbortError');
}

/** A single global budget, including moves and evolutionary enrichment. */
export class RequestQueue {
  private active = 0;
  private waiting: (() => void)[] = [];
  constructor(private readonly limit = 6) {}

  async run<T>(task: () => Promise<T>, signal: AbortSignal): Promise<T> {
    if (signal.aborted) throw abortError();
    await new Promise<void>((resolve, reject) => {
      const start = () => {
        signal.removeEventListener('abort', cancel);
        this.active++;
        resolve();
      };
      const cancel = () => {
        this.waiting = this.waiting.filter((item) => item !== start);
        reject(abortError());
      };
      if (this.active < this.limit) start();
      else {
        this.waiting.push(start);
        signal.addEventListener('abort', cancel, { once: true });
      }
    });
    try {
      if (signal.aborted) throw abortError();
      return await task();
    } finally {
      this.active--;
      this.waiting.shift()?.();
    }
  }
}

interface PendingRequest {
  controller: AbortController;
  promise: Promise<unknown>;
  consumers: number;
}

/** Parsed, stripped payloads only. Bounded LRU/TTL; failures are never cached. */
export class JsonClient {
  private cache = new Map<string, { value: unknown; expires: number }>();
  private pending = new Map<string, PendingRequest>();
  private queue = new RequestQueue(6);

  constructor(
    private readonly maxEntries = 100,
    private readonly ttl = 5 * 60_000,
    private readonly timeout = 15_000,
  ) {}

  request<T>(url: string, schema: z.ZodType<T, unknown>, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) return Promise.reject(abortError());
    const cached = this.cache.get(url);
    if (cached && cached.expires > Date.now()) {
      this.cache.delete(url);
      this.cache.set(url, cached);
      return Promise.resolve(cached.value as T);
    }
    this.cache.delete(url);
    let entry = this.pending.get(url);
    if (!entry) {
      const controller = new AbortController();
      const created: PendingRequest = { controller, consumers: 0, promise: Promise.resolve() };
      entry = created;
      created.promise = this.queue.run(async () => {
        const requestController = new AbortController();
        const cancel = () => requestController.abort();
        controller.signal.addEventListener('abort', cancel, { once: true });
        const timer = setTimeout(cancel, this.timeout);
        try {
          const response = await fetch(url, {
            signal: requestController.signal,
            headers: { Accept: 'application/json' },
          });
          if (!response.ok) throw new PokeApiError(`HTTP ${response.status}`, response.status, url);
          const json: unknown = await response.json();
          const parsed = schema.safeParse(json);
          if (!parsed.success) throw new PokeApiError('Resposta inválida do servidor.', 422, url);
          if (controller.signal.aborted) throw abortError();
          this.cache.set(url, { value: parsed.data, expires: Date.now() + this.ttl });
          while (this.cache.size > this.maxEntries)
            this.cache.delete(this.cache.keys().next().value!);
          return parsed.data;
        } catch (error) {
          if (controller.signal.aborted) throw abortError();
          if (requestController.signal.aborted)
            throw new PokeApiError('O servidor demorou a responder.', 408, url);
          if (error instanceof SyntaxError) throw new PokeApiError('JSON inválido.', 422, url);
          throw error;
        } finally {
          clearTimeout(timer);
          controller.signal.removeEventListener('abort', cancel);
        }
      }, controller.signal);
      this.pending.set(url, created);
      const cleanup = () => {
        if (this.pending.get(url) === created) this.pending.delete(url);
      };
      void created.promise.then(cleanup, cleanup);
    }
    const shared = entry;
    shared.consumers++;
    return new Promise<T>((resolve, reject) => {
      let done = false;
      const finish = () => {
        if (done) return false;
        done = true;
        signal?.removeEventListener('abort', cancel);
        shared.consumers--;
        return true;
      };
      const cancel = () => {
        if (!finish()) return;
        if (shared.consumers === 0) {
          if (this.pending.get(url) === shared) this.pending.delete(url);
          shared.controller.abort();
        }
        reject(abortError());
      };
      signal?.addEventListener('abort', cancel, { once: true });
      void shared.promise.then(
        (value) => {
          if (finish()) resolve(value as T);
        },
        (error) => {
          if (finish()) reject(error);
        },
      );
    });
  }
}

const client = new JsonClient();
export function apiRequest<T>(
  path: string,
  schema: z.ZodType<T, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path.startsWith('https:') ? path : `https://pokeapi.co/api/v2/${path}`);
  if (url.origin !== 'https://pokeapi.co' || !url.pathname.startsWith('/api/v2/')) {
    return Promise.reject(new Error('Unexpected PokeAPI resource URL.'));
  }
  url.pathname = url.pathname.replace(/\/$/, '');
  return client.request(url.href, schema, signal);
}

export function assertPokemonId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new RangeError(`ID de Pokémon inválido: ${String(id)}`);
}

export function extractIdFromUrl(url: string): number {
  const id = Number(new URL(url).pathname.split('/').filter(Boolean).at(-1));
  assertPokemonId(id);
  return id;
}

export function retryQuery(failures: number, error: Error): boolean {
  if (error.name === 'AbortError' || failures >= 2) return false;
  return (
    !(error instanceof PokeApiError) || [408, 429].includes(error.status) || error.status >= 500
  );
}
