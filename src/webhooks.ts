import type { BitbucketWebhookEvent, WebhookEventKey } from './domain/WebhookEvents';

const WEBHOOK_EVENT_KEYS: ReadonlySet<WebhookEventKey> = new Set([
  'diagnostics:ping',
  'repo:refs_changed',
  'repo:modified',
  'repo:forked',
  'repo:comment:added',
  'repo:comment:edited',
  'repo:comment:deleted',
  'mirror:repo_synchronized',
  'pr:opened',
  'pr:from_ref_updated',
  'pr:modified',
  'pr:reviewer:approved',
  'pr:reviewer:unapproved',
  'pr:reviewer:needs_work',
  'pr:merged',
  'pr:declined',
  'pr:deleted',
  'pr:comment:added',
  'pr:comment:edited',
  'pr:comment:deleted',
] satisfies WebhookEventKey[]);

/**
 * A headers-like input accepted by {@link getWebhookEventKey} and {@link parseWebhookEvent}:
 * a Fetch `Headers` instance, a Node-style plain object (values may be arrays for
 * repeated headers), or anything exposing a `get(name)` method.
 */
export type WebhookHeadersInput =
  | Headers
  | Record<string, string | string[] | undefined>
  | { get(name: string): string | null | undefined };

/**
 * Extracts the `X-Event-Key` header Bitbucket sends with every webhook delivery
 * (e.g. `'pr:opened'`), looked up case-insensitively.
 *
 * @param headers - The incoming request's headers
 * @returns The event key, or `undefined` if the header is missing
 */
export function getWebhookEventKey(headers: WebhookHeadersInput | undefined): string | undefined {
  if (!headers) {
    return undefined;
  }

  if (typeof (headers as { get?: unknown }).get === 'function') {
    const value = (headers as { get(name: string): string | null | undefined }).get('X-Event-Key');

    return value ?? undefined;
  }

  const record = headers as Record<string, string | string[] | undefined>;

  for (const key of Object.keys(record)) {
    if (key.toLowerCase() === 'x-event-key') {
      const value = record[key];

      return Array.isArray(value) ? value[0] : value;
    }
  }

  return undefined;
}

/**
 * Type guard narrowing an arbitrary event key string to {@link WebhookEventKey},
 * i.e. one this client has a typed payload for.
 */
export function isWebhookEventKey(eventKey: string): eventKey is WebhookEventKey {
  return WEBHOOK_EVENT_KEYS.has(eventKey as WebhookEventKey);
}

/**
 * Parses an incoming Bitbucket Data Center webhook delivery into a typed,
 * discriminated {@link BitbucketWebhookEvent}, detecting the event type from the
 * `X-Event-Key` header (falling back to the body's `eventKey` field, which
 * Bitbucket includes on every event except `diagnostics:ping`).
 *
 * This performs no signature verification and no runtime schema validation —
 * `body` is trusted as-is (cast to the shape implied by the event key), matching
 * how the rest of this client trusts JSON response bodies. Verify your webhook's
 * shared secret yourself if you configured one.
 *
 * @param headers - The incoming request's headers (any {@link WebhookHeadersInput})
 * @param body - The already-JSON-parsed request body
 * @throws {Error} If no event key can be determined from either the headers or the body
 *
 * @example
 * ```typescript
 * import { parseWebhookEvent } from 'bitbucket-datacenter-api-client';
 *
 * app.post('/webhooks/bitbucket', (req, res) => {
 *   const { event, payload } = parseWebhookEvent(req.headers, req.body);
 *
 *   switch (event) {
 *     case 'pr:opened':
 *       console.log('New PR:', payload.pullRequest.title);
 *       break;
 *     case 'repo:refs_changed':
 *       console.log('Pushed refs:', payload.changes.map((c) => c.ref.displayId));
 *       break;
 *     default:
 *       console.log('Unhandled event:', event);
 *   }
 *
 *   res.sendStatus(204);
 * });
 * ```
 */
export function parseWebhookEvent(
  headers: WebhookHeadersInput | undefined,
  body: unknown,
): BitbucketWebhookEvent {
  const eventKey =
    getWebhookEventKey(headers) ?? (body as { eventKey?: string } | undefined)?.eventKey;

  if (!eventKey) {
    throw new Error(
      'Unable to determine the webhook event: missing "X-Event-Key" header and "eventKey" field in the payload body',
    );
  }

  return { event: eventKey, payload: body } as unknown as BitbucketWebhookEvent;
}
