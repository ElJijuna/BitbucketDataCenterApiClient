import type { PaginationParams } from './Pagination';

/** Webhook event type (e.g. `'pr:opened'`, `'repo:push'`) */
export type WebhookEvent = string;

/** Whether the webhook is scoped to a project or a repository */
export type WebhookScopeType = 'project' | 'repository';

/** The scope (project or repo) that triggered a webhook delivery */
export interface BitbucketWebhookEventScope {
  id: number;
  type: WebhookScopeType;
}

/** HTTP request sent during a webhook delivery */
export interface BitbucketWebhookRequest {
  method: string;
  url: string;
}

/** HTTP response received during a webhook delivery */
export interface BitbucketWebhookResult {
  description: string;
  outcome: string;
}

/** Details of a single webhook delivery attempt */
export interface BitbucketWebhookDelivery {
  id: number;
  event: WebhookEvent;
  eventScope: BitbucketWebhookEventScope;
  /** Duration of the delivery in milliseconds */
  duration: number;
  start: number;
  finish: number;
  request: BitbucketWebhookRequest;
  result: BitbucketWebhookResult;
}

/** Aggregated delivery counts for a webhook */
export interface BitbucketWebhookCounts {
  success: number;
  failure: number;
  error: number;
}

/** Delivery statistics for a webhook */
export interface BitbucketWebhookStatistics {
  lastError?: BitbucketWebhookDelivery;
  lastFailure?: BitbucketWebhookDelivery;
  lastSuccess?: BitbucketWebhookDelivery;
  counts: BitbucketWebhookCounts;
}

/**
 * Represents a Bitbucket Data Center webhook.
 */
export interface BitbucketWebhook {
  /** Unique numeric ID */
  id: number;
  /** Display name of the webhook */
  name: string;
  /** Target URL that receives the event payload */
  url: string;
  /** List of events this webhook subscribes to */
  events: WebhookEvent[];
  /** Whether the webhook is currently active */
  active: boolean;
  /** Whether the scope is a project or a repository */
  scopeType: WebhookScopeType;
  /** Whether SSL certificate verification is required on delivery */
  sslVerificationRequired: boolean;
  /** Delivery statistics for this webhook */
  statistics?: BitbucketWebhookStatistics;
  /** Optional webhook configuration (e.g. secret) */
  configuration?: Record<string, unknown>;
  createdDate?: number;
  updatedDate?: number;
}

/**
 * Query parameters accepted by webhook list endpoints.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-webhooks-get}
 */
export interface WebhooksParams extends PaginationParams {
  /** Filter by event type (e.g. `'pr:opened'`) */
  event?: WebhookEvent;
}
