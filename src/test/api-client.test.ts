import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  JsonClient,
  RequestQueue,
  PokeApiError,
  retryQuery,
  apiRequest,
} from '@/lib/pokeapi/client';

const schema = z.object({ value: z.number() });
const response = (value = 1) =>
  new Response(JSON.stringify({ value }), { headers: { 'Content-Type': 'application/json' } });
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('shared API transport', () => {
  it('deduplicates requests without letting one consumer cancel another', async () => {
    let complete!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new JsonClient();
    const firstController = new AbortController();
    const first = client.request('/same', schema, firstController.signal);
    const second = client.request('/same', schema);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const rejected = expect(first).rejects.toMatchObject({ name: 'AbortError' });
    firstController.abort();
    await rejected;
    complete(response(7));
    await expect(second).resolves.toEqual({ value: 7 });
  });
  it('aborts the underlying request after its last consumer leaves, then allows recovery', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, options: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            options.signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
      ),
    );
    const client = new JsonClient();
    const controller = new AbortController();
    const pending = client.request('/single', schema, controller.signal);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await rejected;
    vi.mocked(fetch).mockResolvedValue(response(8));
    await expect(client.request('/single', schema)).resolves.toEqual({ value: 8 });
  });
  it.each([404, 429, 500])('does not cache HTTP %s errors', async (status) => {
    const mocked = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status }))
      .mockResolvedValueOnce(response(2));
    vi.stubGlobal('fetch', mocked);
    const client = new JsonClient();
    await expect(client.request('/error', schema)).rejects.toMatchObject({ status });
    await expect(client.request('/error', schema)).resolves.toEqual({ value: 2 });
    expect(mocked).toHaveBeenCalledTimes(2);
  });
  it('rejects malformed JSON and schema violations instead of caching partial data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('{'))
        .mockResolvedValueOnce(new Response('{"value":"bad"}'))
        .mockResolvedValueOnce(response()),
    );
    const client = new JsonClient();
    await expect(client.request('/invalid', schema)).rejects.toMatchObject({ status: 422 });
    await expect(client.request('/invalid', schema)).rejects.toMatchObject({ status: 422 });
    await expect(client.request('/invalid', schema)).resolves.toEqual({ value: 1 });
  });
  it('bounds cached responses and expires old data', async () => {
    vi.useFakeTimers();
    const mocked = vi.fn(async () => response());
    vi.stubGlobal('fetch', mocked);
    const client = new JsonClient(1, 100);
    await client.request('/a', schema);
    await client.request('/a', schema);
    expect(mocked).toHaveBeenCalledTimes(1);
    await client.request('/b', schema);
    await client.request('/a', schema);
    expect(mocked).toHaveBeenCalledTimes(3);
    vi.advanceTimersByTime(101);
    await client.request('/a', schema);
    expect(mocked).toHaveBeenCalledTimes(4);
  });
  it('times out stalled requests and permits retry', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, options: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            options.signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
      ),
    );
    const client = new JsonClient(1, 100, 50);
    const pending = expect(client.request('/slow', schema)).rejects.toMatchObject({ status: 408 });
    await vi.advanceTimersByTimeAsync(51);
    await pending;
  });
  it('limits concurrency and removes cancelled waiting jobs', async () => {
    const queue = new RequestQueue(2),
      controller = new AbortController();
    let active = 0,
      maximum = 0;
    const task = async () => {
      active++;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
    };
    const jobs = Array.from({ length: 10 }, () => queue.run(task, new AbortController().signal));
    const cancelled = expect(queue.run(task, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    controller.abort();
    await cancelled;
    await Promise.all(jobs);
    expect(maximum).toBe(2);
  });
  it('rejects external resource URLs and already-aborted requests before fetch', async () => {
    const mock = vi.fn();
    vi.stubGlobal('fetch', mock);
    await expect(apiRequest('https://example.com/api/v2/pokemon/1', schema)).rejects.toThrow(
      'Unexpected',
    );
    const controller = new AbortController();
    controller.abort();
    await expect(new JsonClient().request('/a', schema, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(mock).not.toHaveBeenCalled();
  });
  it('only retries transient failures, at most twice', () => {
    expect(retryQuery(0, new PokeApiError('', 404, ''))).toBe(false);
    expect(retryQuery(0, new PokeApiError('', 422, ''))).toBe(false);
    expect(retryQuery(1, new PokeApiError('', 429, ''))).toBe(true);
    expect(retryQuery(2, new Error('offline'))).toBe(false);
  });
});
