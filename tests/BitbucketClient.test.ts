import { BitbucketClient } from '../src/BitbucketClient';
import type { BitbucketProject } from '../src/domain/Project';
import type { BitbucketRepository } from '../src/domain/Repository';
import type { BitbucketPullRequest, BitbucketParticipant } from '../src/domain/PullRequest';
import type { BitbucketCommit } from '../src/domain/Commit';

const API_URL = 'https://bitbucket.example.com';
const BASE = `${API_URL}/rest/api/latest`;
const USER = 'john.doe';
const TOKEN = 'my-token';

const mockProject: BitbucketProject = {
  key: 'PROJ',
  id: 1,
  name: 'My Project',
  public: false,
  type: 'NORMAL',
  links: {},
};

const mockRepo: BitbucketRepository = {
  slug: 'my-repo',
  id: 1,
  name: 'My Repo',
  state: 'AVAILABLE',
  statusMessage: 'Available',
  forkable: true,
  project: mockProject,
  public: false,
  links: {},
};

const mockAuthorParticipant: BitbucketParticipant = {
  user: {
    name: 'john.doe',
    emailAddress: 'john@example.com',
    id: 1,
    displayName: 'John Doe',
    active: true,
    slug: 'john.doe',
    type: 'NORMAL',
  },
  role: 'AUTHOR',
  approved: false,
  status: 'UNAPPROVED',
};

const mockRef = {
  id: 'refs/heads/feature',
  displayId: 'feature',
  latestCommit: 'abc123',
  type: 'BRANCH' as const,
  repository: { slug: 'my-repo', id: 1, name: 'My Repo', links: {} },
};

const mockPullRequest: BitbucketPullRequest = {
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
  author: mockAuthorParticipant,
  reviewers: [],
  participants: [],
  links: {},
};

const mockCommit: BitbucketCommit = {
  id: 'abc123def456',
  displayId: 'abc123d',
  author: { name: 'John Doe', emailAddress: 'john@example.com' },
  authorTimestamp: 1700000000000,
  committer: { name: 'John Doe', emailAddress: 'john@example.com' },
  committerTimestamp: 1700000000000,
  message: 'feat: add feature X',
  parents: [],
};

function pagedOf<T>(...values: T[]) {
  return { values, size: values.length, limit: 25, isLastPage: true, start: 0 };
}

describe('BitbucketClient', () => {
  let client: BitbucketClient;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    client = new BitbucketClient({ apiUrl: API_URL, user: USER, token: TOKEN });
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function mockOk(data: unknown): void {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(data),
    } as Response);
  }

  function mockError(status: number, statusText: string): void {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status,
      statusText,
      json: () => Promise.resolve({}),
    } as Response);
  }

  describe('constructor', () => {
    it('throws TypeError when apiUrl is invalid', () => {
      expect(
        () => new BitbucketClient({ apiUrl: 'not-a-url', user: USER, token: TOKEN }),
      ).toThrow(TypeError);
    });
  });

  describe('projects()', () => {
    it('calls GET /rest/api/latest/projects', async () => {
      mockOk(pagedOf(mockProject));
      await client.projects();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects`,
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('returns the list of projects', async () => {
      mockOk(pagedOf(mockProject));
      expect(await client.projects()).toEqual([mockProject]);
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockProject));
      await client.projects({ limit: 10, start: 20 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects?limit=10&start=20`);
    });

    it('appends name filter as query param', async () => {
      mockOk(pagedOf(mockProject));
      await client.projects({ name: 'my-proj' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects?name=my-proj`);
    });

    it('ignores undefined filter values', async () => {
      mockOk(pagedOf(mockProject));
      await client.projects({ limit: 5, name: undefined });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects?limit=5`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.projects()).rejects.toThrow('Bitbucket API error: 401 Unauthorized');
    });
  });

  describe('project(key)', () => {
    it('resolves to project info when awaited', async () => {
      mockOk(mockProject);
      expect(await client.project('PROJ')).toEqual(mockProject);
    });

    it('calls GET /rest/api/latest/projects/{key} when awaited', async () => {
      mockOk(mockProject);
      await client.project('PROJ');
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/projects/PROJ`, expect.any(Object));
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ')).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repos()', () => {
    it('calls GET /rest/api/latest/projects/{key}/repos', async () => {
      mockOk(pagedOf(mockRepo));
      await client.project('PROJ').repos();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/projects/PROJ/repos`, expect.any(Object));
    });

    it('returns the list of repositories', async () => {
      mockOk(pagedOf(mockRepo));
      expect(await client.project('PROJ').repos()).toEqual([mockRepo]);
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockRepo));
      await client.project('PROJ').repos({ limit: 50, start: 100 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos?limit=50&start=100`);
    });

    it('appends name filter as query param', async () => {
      mockOk(pagedOf(mockRepo));
      await client.project('PROJ').repos({ name: 'api' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos?name=api`);
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.project('PROJ').repos()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('project(key).repo(slug)', () => {
    it('resolves to repository info when awaited', async () => {
      mockOk(mockRepo);
      expect(await client.project('PROJ').repo('my-repo')).toEqual(mockRepo);
    });

    it('calls GET /rest/api/latest/projects/{key}/repos/{slug} when awaited', async () => {
      mockOk(mockRepo);
      await client.project('PROJ').repo('my-repo');
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo`,
        expect.any(Object),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo')).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('project(key).repo(slug).pullRequests()', () => {
    it('calls GET .../pull-requests', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.project('PROJ').repo('my-repo').pullRequests();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests`,
        expect.any(Object),
      );
    });

    it('returns the list of pull requests', async () => {
      mockOk(pagedOf(mockPullRequest));
      expect(await client.project('PROJ').repo('my-repo').pullRequests()).toEqual([mockPullRequest]);
    });

    it('appends state filter as query param', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.project('PROJ').repo('my-repo').pullRequests({ state: 'MERGED' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/pull-requests?state=MERGED`);
    });

    it('appends limit, start and order as query params', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.project('PROJ').repo('my-repo').pullRequests({ limit: 10, start: 0, order: 'NEWEST' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests?limit=10&start=0&order=NEWEST`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.project('PROJ').repo('my-repo').pullRequests()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('project(key).repo(slug).commits()', () => {
    it('calls GET .../commits', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').commits();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/commits`,
        expect.any(Object),
      );
    });

    it('returns the list of commits', async () => {
      mockOk(pagedOf(mockCommit));
      expect(await client.project('PROJ').repo('my-repo').commits()).toEqual([mockCommit]);
    });

    it('appends limit and until as query params', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').commits({ limit: 5, until: 'main' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/commits?limit=5&until=main`);
    });

    it('appends boolean params as strings', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').commits({ followRenames: true });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/commits?followRenames=true`);
    });

    it('appends path filter as query param', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').commits({ path: 'src/index.ts' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/commits?path=src%2Findex.ts`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').commits()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('authentication', () => {
    it('sends the Authorization header on every request', async () => {
      mockOk(pagedOf(mockProject));
      await client.projects();
      const [, init] = fetchMock.mock.calls[0];
      const headers = (init as RequestInit).headers as Record<string, string>;
      expect(headers['Authorization']).toMatch(/^Basic /);
    });
  });
});
