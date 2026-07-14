import type {
  PrCommentAddedPayload,
  PrMergedPayload,
  PrOpenedPayload,
  RepoRefsChangedPayload,
} from '../src/domain/WebhookEvents';
import { getWebhookEventKey, isWebhookEventKey, parseWebhookEvent } from '../src/webhooks';

const mockActor = {
  name: 'pilmee',
  emailAddress: 'john@example.com',
  id: 1,
  displayName: 'John Doe',
  active: true,
  slug: 'pilmee',
  type: 'NORMAL',
};
const mockRepository = {
  slug: 'my-repo',
  id: 1,
  name: 'My Repo',
  state: 'AVAILABLE',
  statusMessage: 'Available',
  forkable: true,
  project: { key: 'PROJ', id: 1, name: 'My Project', public: false, type: 'NORMAL', links: {} },
  public: false,
  links: {},
};
const mockRef = {
  id: 'refs/heads/feature',
  displayId: 'feature',
  latestCommit: 'abc123',
  type: 'BRANCH' as const,
  repository: { slug: 'my-repo', id: 1, name: 'My Repo', links: {} },
};
const mockPullRequest = {
  id: 42,
  version: 1,
  title: 'Add feature X',
  state: 'OPEN',
  open: true,
  closed: false,
  createdDate: 1700000000000,
  updatedDate: 1700000000000,
  fromRef: mockRef,
  toRef: { ...mockRef, id: 'refs/heads/main', displayId: 'main' },
  locked: false,
  author: { user: mockActor, role: 'AUTHOR', approved: false, status: 'UNAPPROVED' },
  reviewers: [],
  participants: [],
  links: {},
};

describe('getWebhookEventKey', () => {
  it('reads the header from a Headers instance', () => {
    const headers = new Headers({ 'X-Event-Key': 'pr:opened' });

    expect(getWebhookEventKey(headers)).toBe('pr:opened');
  });

  it('reads the header from a plain object, case-insensitively', () => {
    expect(getWebhookEventKey({ 'x-event-key': 'pr:merged' })).toBe('pr:merged');
    expect(getWebhookEventKey({ 'X-EVENT-KEY': 'pr:merged' })).toBe('pr:merged');
  });

  it('reads the first value when the header is array-valued (Node http)', () => {
    expect(getWebhookEventKey({ 'x-event-key': ['pr:declined', 'pr:merged'] })).toBe('pr:declined');
  });

  it('reads the header from an object exposing a get() method', () => {
    const headers = { get: (name: string) => (name === 'X-Event-Key' ? 'repo:modified' : null) };

    expect(getWebhookEventKey(headers)).toBe('repo:modified');
  });

  it('returns undefined when the header is missing', () => {
    expect(getWebhookEventKey({})).toBeUndefined();
    expect(getWebhookEventKey(undefined)).toBeUndefined();
  });
});

describe('isWebhookEventKey', () => {
  it('returns true for every known event key', () => {
    expect(isWebhookEventKey('pr:opened')).toBe(true);
    expect(isWebhookEventKey('repo:refs_changed')).toBe(true);
    expect(isWebhookEventKey('diagnostics:ping')).toBe(true);
    expect(isWebhookEventKey('pr:reviewer:approved')).toBe(true);
    expect(isWebhookEventKey('mirror:repo_synchronized')).toBe(true);
  });

  it('returns false for an unrecognized event key', () => {
    expect(isWebhookEventKey('repo:push')).toBe(false);
    expect(isWebhookEventKey('some:future:event')).toBe(false);
  });
});

describe('parseWebhookEvent', () => {
  it('parses pr:opened using the X-Event-Key header', () => {
    const headers = new Headers({ 'X-Event-Key': 'pr:opened' });
    const body: PrOpenedPayload = {
      date: '2024-01-01T00:00:00Z',
      actor: mockActor,
      pullRequest: mockPullRequest,
    } as unknown as PrOpenedPayload;
    const result = parseWebhookEvent(headers, body);

    expect(result.event).toBe('pr:opened');
    expect(result.payload).toBe(body);

    if (result.event === 'pr:opened') {
      expect(result.payload.pullRequest.title).toBe('Add feature X');
    }
  });

  it('parses repo:refs_changed and narrows the payload', () => {
    const headers = { 'x-event-key': 'repo:refs_changed' };
    const body: RepoRefsChangedPayload = {
      date: '2024-01-01T00:00:00Z',
      actor: mockActor,
      repository: mockRepository,
      changes: [
        {
          ref: { id: 'refs/heads/main', displayId: 'main', type: 'BRANCH' },
          refId: 'refs/heads/main',
          fromHash: 'aaa',
          toHash: 'bbb',
          type: 'UPDATE',
        },
      ],
    } as unknown as RepoRefsChangedPayload;
    const result = parseWebhookEvent(headers, body);

    if (result.event !== 'repo:refs_changed') {
      throw new Error('expected repo:refs_changed');
    }

    expect(result.payload.changes).toHaveLength(1);
    expect(result.payload.changes[0]?.type).toBe('UPDATE');
  });

  it('parses pr:merged', () => {
    const headers = new Headers({ 'X-Event-Key': 'pr:merged' });
    const body: PrMergedPayload = {
      date: '2024-01-01T00:00:00Z',
      actor: mockActor,
      pullRequest: { ...mockPullRequest, state: 'MERGED' },
    } as unknown as PrMergedPayload;
    const result = parseWebhookEvent(headers, body);

    expect(result.event).toBe('pr:merged');
  });

  it('parses pr:comment:added', () => {
    const headers = new Headers({ 'X-Event-Key': 'pr:comment:added' });
    const body: PrCommentAddedPayload = {
      date: '2024-01-01T00:00:00Z',
      actor: mockActor,
      pullRequest: mockPullRequest,
      comment: {
        id: 1,
        version: 0,
        text: 'Looks good',
        author: mockActor,
        createdDate: 1700000000000,
        updatedDate: 1700000000000,
        comments: [],
        tasks: [],
        links: {},
      },
    } as unknown as PrCommentAddedPayload;
    const result = parseWebhookEvent(headers, body);

    if (result.event !== 'pr:comment:added') {
      throw new Error('expected pr:comment:added');
    }

    expect(result.payload.comment.text).toBe('Looks good');
  });

  it('parses diagnostics:ping using only the header, since the body has no eventKey', () => {
    const headers = new Headers({ 'X-Event-Key': 'diagnostics:ping' });
    const body = { test: true };
    const result = parseWebhookEvent(headers, body);

    expect(result.event).toBe('diagnostics:ping');
    expect(result.payload).toEqual({ test: true });
  });

  it('falls back to the body eventKey field when the header is missing', () => {
    const body = {
      eventKey: 'pr:declined',
      date: '2024-01-01T00:00:00Z',
      actor: mockActor,
      pullRequest: mockPullRequest,
    };
    const result = parseWebhookEvent(undefined, body);

    expect(result.event).toBe('pr:declined');
  });

  it('prefers the header over the body eventKey field when both are present', () => {
    const headers = new Headers({ 'X-Event-Key': 'pr:merged' });
    const body = { eventKey: 'pr:declined' };

    expect(parseWebhookEvent(headers, body).event).toBe('pr:merged');
  });

  it('passes through an unrecognized/future event key without throwing', () => {
    const headers = new Headers({ 'X-Event-Key': 'repo:some_future_event' });
    const body = { foo: 'bar' };
    const result = parseWebhookEvent(headers, body) as unknown as {
      event: string;
      payload: unknown;
    };

    expect(result.event).toBe('repo:some_future_event');
    expect(result.payload).toEqual({ foo: 'bar' });
    expect(isWebhookEventKey(result.event)).toBe(false);
  });

  it('throws when no event key can be determined', () => {
    expect(() => parseWebhookEvent(undefined, {})).toThrow('Unable to determine the webhook event');
    expect(() => parseWebhookEvent({}, {})).toThrow('Unable to determine the webhook event');
  });
});
