import { BitbucketClient } from '../../src/BitbucketClient';
import type { BitbucketCommit } from '../../src/domain/Commit';

const API_URL = 'https://bitbucket.example.com';
const API_PATH = 'rest/api/latest';
const BASE = `${API_URL}/${API_PATH}`;
const COMMIT_BASE = `${BASE}/projects/PROJ/repos/my-repo/commits/abc123`;
const mockAuthor = { name: 'pilmee', emailAddress: 'john@example.com' };
const mockCommit: BitbucketCommit = {
  id: 'abc123',
  displayId: 'abc123',
  author: mockAuthor,
  authorTimestamp: 1700000000000,
  committer: mockAuthor,
  committerTimestamp: 1700000000000,
  message: 'Fix bug',
  parents: [],
};

describe('CommitResource write/read operations', () => {
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

  function commit() {
    return client.project('PROJ').repo('my-repo').commit('abc123');
  }

  function lastCall(): [string, RequestInit] {
    const { calls } = fetchMock.mock;

    return calls[calls.length - 1] as [string, RequestInit];
  }

  describe('diffStatsSummary()', () => {
    it('calls GET .../diff-stats-summary/{path}', async () => {
      const summary = { path: { toString: 'src/index.ts' }, added: 3, removed: 1, modified: 0 };

      mockOk(summary);
      const result = await commit().diffStatsSummary('src/index.ts');
      const [url] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/diff-stats-summary/src/index.ts`);
      expect(result).toEqual(summary);
    });
  });

  describe('updateComment()', () => {
    it('sends PUT with the payload', async () => {
      const updatedComment = { id: 7, version: 1, text: 'Updated text' };

      mockOk(updatedComment);
      await commit().updateComment(7, { version: 0, text: 'Updated text' });
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/comments/7`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ version: 0, text: 'Updated text' }));
    });
  });

  describe('deleteComment()', () => {
    it('sends DELETE with the version as a query param', async () => {
      mockNoContent();
      await commit().deleteComment(7, 1);
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/comments/7?version=1`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('pullRequests()', () => {
    it('calls GET .../pull-requests', async () => {
      const page = { size: 0, limit: 25, isLastPage: true, values: [], start: 0 };

      mockOk(page);
      const result = await commit().pullRequests({ withAttributes: false });
      const [url] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/pull-requests?withAttributes=false`);
      expect(result).toEqual(page);
    });
  });

  describe('mergeBase()', () => {
    it('calls GET .../merge-base/{otherCommitId}', async () => {
      mockOk(mockCommit);
      const result = await commit().mergeBase('def456');
      const [url] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/merge-base/def456`);
      expect(result).toEqual(mockCommit);
    });
  });

  describe('watch() / unwatch()', () => {
    it('watch() sends POST with no body', async () => {
      mockNoContent();
      await commit().watch();
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/watch`);
      expect(init.method).toBe('POST');
      expect(init.body).toBeUndefined();
    });

    it('unwatch() sends DELETE with no body', async () => {
      mockNoContent();
      await commit().unwatch();
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/watch`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });
});
