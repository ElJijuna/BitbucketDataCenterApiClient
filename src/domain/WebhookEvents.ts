import type { BitbucketParticipant, BitbucketPullRequest } from './PullRequest';
import type { BitbucketActivityUser, BitbucketPullRequestComment } from './PullRequestActivity';
import type { BitbucketRepository } from './Repository';

/**
 * The user who triggered a webhook event. Absent from `diagnostics:ping`, whose
 * body carries no actor.
 */
export type WebhookActor = BitbucketActivityUser;

/** Minimal ref shape used inside `repo:refs_changed` payloads. */
export interface WebhookRef {
  id: string;
  displayId: string;
  type: 'BRANCH' | 'TAG';
}

/** A single branch/tag change reported by `repo:refs_changed`. */
export interface WebhookRefChange {
  ref: WebhookRef;
  refId: string;
  fromHash: string;
  toHash: string;
  type: 'ADD' | 'UPDATE' | 'DELETE';
}

/** Body of a `diagnostics:ping` delivery, sent when a webhook's "Test connection" is used. */
export interface DiagnosticsPingPayload {
  test: true;
}

/** Body of a `repo:refs_changed` delivery — one or more branches/tags were pushed. */
export interface RepoRefsChangedPayload {
  date: string;
  actor: WebhookActor;
  repository: BitbucketRepository;
  changes: WebhookRefChange[];
}

/** Body of a `repo:modified` delivery — repository name/description/etc. changed. */
export interface RepoModifiedPayload {
  date: string;
  actor: WebhookActor;
  old: BitbucketRepository;
  new: BitbucketRepository;
}

/** Body of a `repo:forked` delivery. */
export interface RepoForkedPayload {
  date: string;
  actor: WebhookActor;
  repository: BitbucketRepository;
}

/** Body of a `repo:comment:added` delivery — a comment was posted on a commit. */
export interface RepoCommentAddedPayload {
  date: string;
  actor: WebhookActor;
  repository: BitbucketRepository;
  commit: string;
  comment: BitbucketPullRequestComment;
  commentParentId?: number;
}

/** Body of a `repo:comment:edited` delivery. */
export interface RepoCommentEditedPayload {
  date: string;
  actor: WebhookActor;
  repository: BitbucketRepository;
  commit: string;
  comment: BitbucketPullRequestComment;
  commentParentId?: number;
  previousComment: string;
}

/** Body of a `repo:comment:deleted` delivery. */
export interface RepoCommentDeletedPayload {
  date: string;
  actor: WebhookActor;
  repository: BitbucketRepository;
  commit: string;
  comment: BitbucketPullRequestComment;
  commentParentId?: number;
}

/** Body of a `mirror:repo_synchronized` delivery (Smart Mirroring). Carries no actor. */
export interface MirrorRepoSynchronizedPayload {
  date: string;
  repository: BitbucketRepository;
}

/** Body of a `pr:opened` delivery. */
export interface PrOpenedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
}

/** Body of a `pr:from_ref_updated` delivery — new commits were pushed to the source branch. */
export interface PrFromRefUpdatedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  previousFromHash: string;
}

/** The pull request's target branch prior to a `pr:modified` event, when it changed. */
export interface PreviousPullRequestTarget {
  id: string;
  displayId: string;
  type: 'BRANCH';
  latestCommit: string;
}

/** Body of a `pr:modified` delivery — title, description, and/or target branch changed. */
export interface PrModifiedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  previousTitle?: string;
  previousDescription?: string;
  previousTarget?: PreviousPullRequestTarget;
}

/** A pull request participant enriched with the reviewer's last-reviewed commit. */
export type WebhookReviewerParticipant = BitbucketParticipant & { lastReviewedCommit?: string };

/** Body of a `pr:reviewer:approved` delivery. */
export interface PrReviewerApprovedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  participant: WebhookReviewerParticipant;
  previousStatus: 'UNAPPROVED' | 'NEEDS_WORK';
}

/** Body of a `pr:reviewer:unapproved` delivery. */
export interface PrReviewerUnapprovedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  participant: WebhookReviewerParticipant;
  previousStatus: 'APPROVED' | 'NEEDS_WORK';
}

/** Body of a `pr:reviewer:needs_work` delivery. */
export interface PrReviewerNeedsWorkPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  participant: WebhookReviewerParticipant;
  previousStatus: 'APPROVED' | 'UNAPPROVED';
}

/** Body of a `pr:merged` delivery. */
export interface PrMergedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
}

/** Body of a `pr:declined` delivery. */
export interface PrDeclinedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
}

/** Body of a `pr:deleted` delivery. */
export interface PrDeletedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
}

/** Body of a `pr:comment:added` delivery. */
export interface PrCommentAddedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  comment: BitbucketPullRequestComment;
  commentParentId?: number;
}

/** Body of a `pr:comment:edited` delivery. */
export interface PrCommentEditedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  comment: BitbucketPullRequestComment;
  commentParentId?: number;
  previousComment: string;
}

/** Body of a `pr:comment:deleted` delivery. */
export interface PrCommentDeletedPayload {
  date: string;
  actor: WebhookActor;
  pullRequest: BitbucketPullRequest;
  comment: BitbucketPullRequestComment;
  commentParentId?: number;
}

/**
 * Maps every known Bitbucket Data Center webhook event key to its payload shape.
 * Used to derive {@link WebhookEventKey} and {@link BitbucketWebhookEvent}.
 */
export interface WebhookEventPayloadMap {
  'diagnostics:ping': DiagnosticsPingPayload;
  'repo:refs_changed': RepoRefsChangedPayload;
  'repo:modified': RepoModifiedPayload;
  'repo:forked': RepoForkedPayload;
  'repo:comment:added': RepoCommentAddedPayload;
  'repo:comment:edited': RepoCommentEditedPayload;
  'repo:comment:deleted': RepoCommentDeletedPayload;
  'mirror:repo_synchronized': MirrorRepoSynchronizedPayload;
  'pr:opened': PrOpenedPayload;
  'pr:from_ref_updated': PrFromRefUpdatedPayload;
  'pr:modified': PrModifiedPayload;
  'pr:reviewer:approved': PrReviewerApprovedPayload;
  'pr:reviewer:unapproved': PrReviewerUnapprovedPayload;
  'pr:reviewer:needs_work': PrReviewerNeedsWorkPayload;
  'pr:merged': PrMergedPayload;
  'pr:declined': PrDeclinedPayload;
  'pr:deleted': PrDeletedPayload;
  'pr:comment:added': PrCommentAddedPayload;
  'pr:comment:edited': PrCommentEditedPayload;
  'pr:comment:deleted': PrCommentDeletedPayload;
}

/** Every webhook event key this client recognizes and types. */
export type WebhookEventKey = keyof WebhookEventPayloadMap;

/**
 * The result of {@link parseWebhookEvent}: a discriminated union keyed by `event`.
 * Narrow on `event` (e.g. via `switch` or `===`) to get a correctly typed `payload`.
 *
 * This union only models the event keys in {@link WebhookEventPayloadMap}. If a
 * future Bitbucket version adds a new event, `parseWebhookEvent` still returns it
 * as-is at runtime (`event` holds the raw string, `payload` the raw body) — use
 * {@link isWebhookEventKey} to defensively check `event` before trusting the
 * narrowed `payload` type if you need to guard against that.
 */
export type BitbucketWebhookEvent = {
  [K in WebhookEventKey]: { event: K; payload: WebhookEventPayloadMap[K] };
}[WebhookEventKey];
