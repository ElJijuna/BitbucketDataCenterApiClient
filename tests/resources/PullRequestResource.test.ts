import { BitbucketClient } from '../../src/BitbucketClient';
import type { BitbucketParticipant, BitbucketPullRequest } from '../../src/domain/PullRequest';

const API_URL = 'https://bitbucket.example.com';
const API_PATH = 'rest/api/latest';
const BASE = `${API_URL}/${API_PATH}`;
const PR_BASE = `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42`;
const mockRef = {
  id: 'refs/heads/feature',
  displayId: 'feature',
  latestCommit: 'abc123',
  type: 'BRANCH' as const,
  repository: { slug: 'my-repo', id: 1, name: 'My Repo', links: {} },
};
const mockAuthorParticipant: BitbucketParticipant = {
  user: {
    name: 'pilmee',
    emailAddress: 'john@example.com',
    id: 1,
    displayName: 'John Doe',
    active: true,
    slug: 'pilmee',
    type: 'NORMAL',
  },
  role: 'AUTHOR',
  approved: false,
  status: 'UNAPPROVED',
};
const mockPullRequest: BitbucketPullRequest = {
  id: 42,
  version: 3,
  title: 'Add feature X',
  state: 'OPEN',
  open: true,
  closed: false,
  createdDate: 1700000000000,
  updatedDate: 1700000000000,
  fromRef: mockRef,
  toRef: { ...mockRef, id: 'refs/heads/main', displayId: 'main' },
  locked: false,
  author: mockAuthorParticipant,
  reviewers: [],
  participants: [],
  links: {},
};

describe('PullRequestResource write operations', () => {
  let client: BitbucketClient;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new BitbucketClient({
      apiUrl: API_URL,
      apiPath: API_PATH,
      user: 'pilmee',
      token: 'my-token',
    });
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockOk(data: unknown, status = 200): void {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status,
      statusText: 'OK',
      json: () => Promise.resolve(data),
    } as Response);
  }

  function mockNoContent(): void {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: 'No Content',
    } as Response);
  }

  function pr() {
    return client.project('PROJ').repo('my-repo').pullRequest(42);
  }

  function lastCall(): [string, RequestInit] {
    const { calls } = fetchMock.mock;

    return calls[calls.length - 1] as [string, RequestInit];
  }

  describe('update()', () => {
    it('sends PUT with the full payload', async () => {
      mockOk(mockPullRequest);
      await pr().update({ version: 3, title: 'New title' });
      const [url, init] = lastCall();

      expect(url).toBe(PR_BASE);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ version: 3, title: 'New title' }));
    });

    it('returns the updated pull request', async () => {
      mockOk(mockPullRequest);
      expect(await pr().update({ version: 3, title: 'New title' })).toEqual(mockPullRequest);
    });
  });

  describe('delete()', () => {
    it('sends DELETE with the version in the body', async () => {
      mockNoContent();
      await pr().delete({ version: 3 });
      const [url, init] = lastCall();

      expect(url).toBe(PR_BASE);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBe(JSON.stringify({ version: 3 }));
    });

    it('resolves to undefined on 204', async () => {
      mockNoContent();
      await expect(pr().delete({ version: 3 })).resolves.toBeUndefined();
    });
  });

  describe('merge()', () => {
    it('sends POST with version as a query param and the rest as body', async () => {
      mockOk({ ...mockPullRequest, state: 'MERGED' });
      await pr().merge({ version: 3, message: 'Merge it', strategyId: 'squash' });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/merge?version=3`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ message: 'Merge it', strategyId: 'squash' }));
    });

    it('returns the merged pull request', async () => {
      const merged = { ...mockPullRequest, state: 'MERGED' as const };

      mockOk(merged);
      expect(await pr().merge({ version: 3 })).toEqual(merged);
    });
  });

  describe('canMerge()', () => {
    it('calls GET .../merge', async () => {
      mockOk({ canMerge: true, conflicted: false, vetoes: [] });
      await pr().canMerge();
      const [url] = lastCall();

      expect(url).toBe(`${PR_BASE}/merge`);
    });

    it('returns merge eligibility and vetoes', async () => {
      const result = {
        canMerge: false,
        conflicted: true,
        vetoes: [{ summaryMessage: 'Conflicts', detailedMessage: 'File conflicts detected' }],
      };

      mockOk(result);
      expect(await pr().canMerge()).toEqual(result);
    });
  });

  describe('decline()', () => {
    it('sends POST with version as a query param', async () => {
      mockOk({ ...mockPullRequest, state: 'DECLINED' });
      await pr().decline({ version: 3 });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/decline?version=3`);
      expect(init.method).toBe('POST');
    });
  });

  describe('reopen()', () => {
    it('sends POST with version as a query param', async () => {
      mockOk({ ...mockPullRequest, state: 'OPEN' });
      await pr().reopen({ version: 3 });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/reopen?version=3`);
      expect(init.method).toBe('POST');
    });
  });

  describe('approve() / unapprove()', () => {
    it('approve() sends PUT with status APPROVED', async () => {
      mockOk({ ...mockAuthorParticipant, approved: true, status: 'APPROVED' });
      await pr().approve('pilmee');
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/participants/pilmee`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(
        JSON.stringify({ user: { name: 'pilmee' }, approved: true, status: 'APPROVED' }),
      );
    });

    it('unapprove() sends PUT with status UNAPPROVED', async () => {
      mockOk({ ...mockAuthorParticipant, approved: false, status: 'UNAPPROVED' });
      await pr().unapprove('pilmee');
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/participants/pilmee`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(
        JSON.stringify({ user: { name: 'pilmee' }, approved: false, status: 'UNAPPROVED' }),
      );
    });
  });

  describe('addReviewer() / removeReviewer()', () => {
    it('addReviewer() sends POST with the user payload', async () => {
      mockOk(mockAuthorParticipant);
      await pr().addReviewer({ user: { name: 'jdoe' } });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/participants`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ user: { name: 'jdoe' } }));
    });

    it('removeReviewer() sends DELETE with no body', async () => {
      mockNoContent();
      await pr().removeReviewer('jdoe');
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/participants/jdoe`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('task CRUD', () => {
    const mockTask = {
      id: 7,
      version: 0,
      createdDate: 1700000000000,
      author: mockAuthorParticipant.user,
      text: 'Fix this',
      severity: 'BLOCKER' as const,
      state: 'OPEN' as const,
      permittedOperations: { editable: true, deletable: true, transitionable: true },
    };

    it('createTask() sends POST to blocker-comments', async () => {
      mockOk(mockTask);
      await pr().createTask({ text: 'Fix this' });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/blocker-comments`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ text: 'Fix this' }));
    });

    it('updateTask() sends PUT with version and state', async () => {
      mockOk({ ...mockTask, state: 'RESOLVED' });
      await pr().updateTask(7, { version: 0, state: 'RESOLVED' });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/blocker-comments/7`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ version: 0, state: 'RESOLVED' }));
    });

    it('deleteTask() sends DELETE with version as a query param', async () => {
      mockNoContent();
      await pr().deleteTask(7, 0);
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/blocker-comments/7?version=0`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('comment CRUD, suggestions, and reactions', () => {
    const mockComment = {
      id: 9,
      version: 0,
      text: 'Looks good',
      author: mockAuthorParticipant.user,
      createdDate: 1700000000000,
      updatedDate: 1700000000000,
      comments: [],
      tasks: [],
      links: {},
    };

    it('addComment() sends POST with the comment payload', async () => {
      mockOk(mockComment);
      await pr().addComment({ text: 'Looks good' });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/comments`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ text: 'Looks good' }));
    });

    it('updateComment() sends PUT with version and text', async () => {
      mockOk({ ...mockComment, text: 'Edited' });
      await pr().updateComment(9, { version: 0, text: 'Edited' });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/comments/9`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ version: 0, text: 'Edited' }));
    });

    it('deleteComment() sends DELETE with version as a query param', async () => {
      mockNoContent();
      await pr().deleteComment(9, 0);
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/comments/9?version=0`);
      expect(init.method).toBe('DELETE');
    });

    it('applySuggestion() sends POST to apply-suggestion', async () => {
      mockOk({ id: 'abc123def456', displayId: 'abc123d' });
      await pr().applySuggestion(9, { suggestionIndex: 0 });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/comments/9/apply-suggestion`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ suggestionIndex: 0 }));
    });

    it('react() sends PUT against the comment-likes API module', async () => {
      mockNoContent();
      await pr().react(9, '+1');
      const [url, init] = lastCall();

      expect(url).toBe(
        `${API_URL}/rest/comment-likes/latest/projects/PROJ/repos/my-repo/pull-requests/42/comments/9/reactions/+1`,
      );
      expect(init.method).toBe('PUT');
    });

    it('unreact() sends DELETE against the comment-likes API module', async () => {
      mockNoContent();
      await pr().unreact(9, '+1');
      const [url, init] = lastCall();

      expect(url).toBe(
        `${API_URL}/rest/comment-likes/latest/projects/PROJ/repos/my-repo/pull-requests/42/comments/9/reactions/+1`,
      );
      expect(init.method).toBe('DELETE');
    });
  });

  describe('review workflow', () => {
    it('review() calls GET .../review', async () => {
      mockOk({ reviewedFiles: ['src/index.ts'] });
      const result = await pr().review();
      const [url] = lastCall();

      expect(url).toBe(`${PR_BASE}/review`);
      expect(result).toEqual({ reviewedFiles: ['src/index.ts'] });
    });

    it('completeReview() sends PUT with reviewedFiles', async () => {
      mockOk({ reviewedFiles: ['src/index.ts'] });
      await pr().completeReview({ reviewedFiles: ['src/index.ts'] });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/review`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ reviewedFiles: ['src/index.ts'] }));
    });

    it('discardReview() sends DELETE', async () => {
      mockNoContent();
      await pr().discardReview();
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/review`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('auto-merge', () => {
    it('autoMerge() calls GET .../auto-merge', async () => {
      const request = { user: { name: 'pilmee' }, createdDate: 1700000000000 };

      mockOk(request);
      expect(await pr().autoMerge()).toEqual(request);
    });

    it('requestAutoMerge() sends POST with the optional payload', async () => {
      const request = { user: { name: 'pilmee' }, createdDate: 1700000000000 };

      mockOk(request);
      await pr().requestAutoMerge({ message: 'Auto merge please', deleteSourceRef: true });
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/auto-merge`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(
        JSON.stringify({ message: 'Auto merge please', deleteSourceRef: true }),
      );
    });

    it('cancelAutoMerge() sends DELETE', async () => {
      mockNoContent();
      await pr().cancelAutoMerge();
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/auto-merge`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('watch() / unwatch()', () => {
    it('watch() sends POST with no body', async () => {
      mockNoContent();
      await pr().watch();
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/watch`);
      expect(init.method).toBe('POST');
      expect(init.body).toBeUndefined();
    });

    it('unwatch() sends DELETE', async () => {
      mockNoContent();
      await pr().unwatch();
      const [url, init] = lastCall();

      expect(url).toBe(`${PR_BASE}/watch`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('rebase', () => {
    it('canRebase() calls GET against the git API module', async () => {
      mockOk({ rebaseable: true, vetoes: [] });
      const result = await pr().canRebase();
      const [url] = lastCall();

      expect(url).toBe(
        `${API_URL}/rest/git/latest/projects/PROJ/repos/my-repo/pull-requests/42/rebase`,
      );
      expect(result).toEqual({ rebaseable: true, vetoes: [] });
    });

    it('rebase() sends POST against the git API module', async () => {
      mockOk({ id: 'def456abc123', displayId: 'def456a' });
      await pr().rebase();
      const [url, init] = lastCall();

      expect(url).toBe(
        `${API_URL}/rest/git/latest/projects/PROJ/repos/my-repo/pull-requests/42/rebase`,
      );
      expect(init.method).toBe('POST');
    });
  });

  describe('mergeBase() / commitMessageSuggestion()', () => {
    it('mergeBase() calls GET .../merge-base', async () => {
      const commit = {
        id: 'abc123def456',
        displayId: 'abc123d',
        author: { name: 'John Doe', emailAddress: 'john@example.com' },
        authorTimestamp: 1700000000000,
        committer: { name: 'John Doe', emailAddress: 'john@example.com' },
        committerTimestamp: 1700000000000,
        message: 'Common ancestor',
        parents: [],
      };

      mockOk(commit);
      expect(await pr().mergeBase()).toEqual(commit);
      const [url] = lastCall();

      expect(url).toBe(`${PR_BASE}/merge-base`);
    });

    it('commitMessageSuggestion() calls GET .../commit-message-suggestion', async () => {
      mockOk({ message: 'Merged in feature (pull request #42)' });
      const result = await pr().commitMessageSuggestion();
      const [url] = lastCall();

      expect(url).toBe(`${PR_BASE}/commit-message-suggestion`);
      expect(result).toEqual({ message: 'Merged in feature (pull request #42)' });
    });
  });

  describe('diffStatsSummary() / rawDiff() / patch()', () => {
    it('diffStatsSummary() calls GET .../diff-stats-summary/{path}', async () => {
      mockOk({ additions: 10, deletions: 2 });
      const result = await pr().diffStatsSummary('src/index.ts');
      const [url] = lastCall();

      expect(url).toBe(`${PR_BASE}/diff-stats-summary/src/index.ts`);
      expect(result).toEqual({ additions: 10, deletions: 2 });
    });

    it('rawDiff() calls GET {id}.diff and returns plain text', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('diff --git a/x b/x'),
      } as Response);

      const result = await pr().rawDiff();
      const [url] = lastCall();

      expect(url).toBe(`${PR_BASE}.diff`);
      expect(result).toBe('diff --git a/x b/x');
    });

    it('patch() calls GET {id}.patch and returns plain text', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('From abc123 Mon Sep 17 00:00:00 2001'),
      } as Response);

      const result = await pr().patch();
      const [url] = lastCall();

      expect(url).toBe(`${PR_BASE}.patch`);
      expect(result).toBe('From abc123 Mon Sep 17 00:00:00 2001');
    });
  });
});
