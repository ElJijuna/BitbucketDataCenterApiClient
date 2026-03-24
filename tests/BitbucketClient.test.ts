import { BitbucketClient } from '../src/BitbucketClient';
import { BitbucketApiError } from '../src/errors/BitbucketApiError';
import type { BitbucketProject } from '../src/domain/Project';
import type { BitbucketRepository } from '../src/domain/Repository';
import type { BitbucketPullRequest, BitbucketParticipant } from '../src/domain/PullRequest';
import type { BitbucketCommit } from '../src/domain/Commit';
import type { BitbucketPullRequestActivity } from '../src/domain/PullRequestActivity';
import type { BitbucketPullRequestTask } from '../src/domain/PullRequestTask';
import type { BitbucketChange } from '../src/domain/Change';
import type { BitbucketReport } from '../src/domain/Report';
import type { BitbucketBuildSummaries } from '../src/domain/BuildSummary';
import type { BitbucketIssue } from '../src/domain/Issue';
import type { BitbucketUser, BitbucketUserPermission } from '../src/domain/User';
import type { BitbucketBranch } from '../src/domain/Branch';
import type { BitbucketTag } from '../src/domain/Tag';
import type { BitbucketWebhook } from '../src/domain/Webhook';
import type { BitbucketRepositorySize } from '../src/domain/RepositorySize';
import type { BitbucketLastModifiedEntry } from '../src/domain/LastModified';

const API_URL = 'https://bitbucket.example.com';
const API_PATH = 'rest/api/latest';
const BASE = `${API_URL}/${API_PATH}`;
const USER = 'pilmee';
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
    client = new BitbucketClient({ apiUrl: API_URL, apiPath: API_PATH, user: USER, token: TOKEN });
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
        () => new BitbucketClient({ apiUrl: 'not-a-url', apiPath: API_PATH, user: USER, token: TOKEN }),
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

    it('returns the paged response with projects', async () => {
      mockOk(pagedOf(mockProject));
      expect(await client.projects()).toEqual(pagedOf(mockProject));
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

    it('returns the paged response with repositories', async () => {
      mockOk(pagedOf(mockRepo));
      expect(await client.project('PROJ').repos()).toEqual(pagedOf(mockRepo));
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

    it('returns the paged response with pull requests', async () => {
      mockOk(pagedOf(mockPullRequest));
      expect(await client.project('PROJ').repo('my-repo').pullRequests()).toEqual(pagedOf(mockPullRequest));
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

    it('returns the paged response with commits', async () => {
      mockOk(pagedOf(mockCommit));
      expect(await client.project('PROJ').repo('my-repo').commits()).toEqual(pagedOf(mockCommit));
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

  describe('project(key).repo(slug).pullRequest(id)', () => {
    it('resolves to pull request info when awaited', async () => {
      mockOk(mockPullRequest);
      expect(await client.project('PROJ').repo('my-repo').pullRequest(42)).toEqual(mockPullRequest);
    });

    it('calls GET .../pull-requests/{id} when awaited', async () => {
      mockOk(mockPullRequest);
      await client.project('PROJ').repo('my-repo').pullRequest(42);
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42`,
        expect.any(Object),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').pullRequest(42)).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('project(key).repo(slug).pullRequest(id).activities()', () => {
    const mockActivity: BitbucketPullRequestActivity = {
      id: 1,
      createdDate: 1700000000000,
      user: {
        name: 'pilmee',
        emailAddress: 'john@example.com',
        id: 1,
        displayName: 'John Doe',
        active: true,
        slug: 'pilmee',
        type: 'NORMAL',
      },
      action: 'APPROVED',
    };

    it('calls GET .../pull-requests/{id}/activities', async () => {
      mockOk(pagedOf(mockActivity));
      await client.project('PROJ').repo('my-repo').pullRequest(42).activities();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/activities`,
        expect.any(Object),
      );
    });

    it('returns the paged response with activities', async () => {
      mockOk(pagedOf(mockActivity));
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).activities();
      expect(result).toEqual(pagedOf(mockActivity));
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockActivity));
      await client.project('PROJ').repo('my-repo').pullRequest(42).activities({ limit: 10, start: 5 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/activities?limit=10&start=5`,
      );
    });

    it('appends fromId and fromType as query params', async () => {
      mockOk(pagedOf(mockActivity));
      await client.project('PROJ').repo('my-repo').pullRequest(42).activities({ fromId: 7, fromType: 'COMMENT' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/activities?fromId=7&fromType=COMMENT`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(
        client.project('PROJ').repo('my-repo').pullRequest(42).activities(),
      ).rejects.toThrow('Bitbucket API error: 403 Forbidden');
    });
  });

  describe('project(key).repo(slug).pullRequest(id).tasks()', () => {
    const mockTask: BitbucketPullRequestTask = {
      id: 1,
      createdDate: 1700000000000,
      author: {
        name: 'pilmee',
        emailAddress: 'john@example.com',
        id: 1,
        displayName: 'John Doe',
        active: true,
        slug: 'pilmee',
        type: 'NORMAL',
      },
      text: 'Fix this before merging',
      state: 'OPEN',
      permittedOperations: { editable: true, deletable: true, transitionable: true },
      anchor: { id: 10, type: { id: 'COMMENT' } },
    };

    it('calls GET .../pull-requests/{id}/tasks', async () => {
      mockOk(pagedOf(mockTask));
      await client.project('PROJ').repo('my-repo').pullRequest(42).tasks();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/tasks`,
        expect.any(Object),
      );
    });

    it('returns the paged response with tasks', async () => {
      mockOk(pagedOf(mockTask));
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).tasks();
      expect(result).toEqual(pagedOf(mockTask));
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockTask));
      await client.project('PROJ').repo('my-repo').pullRequest(42).tasks({ limit: 10, start: 5 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/tasks?limit=10&start=5`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(
        client.project('PROJ').repo('my-repo').pullRequest(42).tasks(),
      ).rejects.toThrow('Bitbucket API error: 403 Forbidden');
    });
  });

  describe('project(key).repo(slug).pullRequest(id).commits()', () => {
    it('calls GET .../pull-requests/{id}/commits', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').pullRequest(42).commits();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/commits`,
        expect.any(Object),
      );
    });

    it('returns the paged response with commits', async () => {
      mockOk(pagedOf(mockCommit));
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).commits();
      expect(result).toEqual(pagedOf(mockCommit));
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').pullRequest(42).commits({ limit: 10, start: 20 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/commits?limit=10&start=20`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').pullRequest(42).commits(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).pullRequest(id).changes()', () => {
    const mockChange: BitbucketChange = {
      contentId: 'abc123',
      fromContentId: 'def456',
      path: {
        components: ['src', 'index.ts'],
        parent: 'src',
        name: 'index.ts',
        extension: 'ts',
        toString: 'src/index.ts',
      },
      executable: false,
      srcExecutable: false,
      percentUnchanged: -1,
      type: 'MODIFY',
      nodeType: 'FILE',
      links: {},
    };

    it('calls GET .../pull-requests/{id}/changes', async () => {
      mockOk(pagedOf(mockChange));
      await client.project('PROJ').repo('my-repo').pullRequest(42).changes();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/changes`,
        expect.any(Object),
      );
    });

    it('returns the paged response with changes', async () => {
      mockOk(pagedOf(mockChange));
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).changes();
      expect(result).toEqual(pagedOf(mockChange));
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockChange));
      await client.project('PROJ').repo('my-repo').pullRequest(42).changes({ limit: 50, start: 0 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/changes?limit=50&start=0`,
      );
    });

    it('appends withComments as query param', async () => {
      mockOk(pagedOf(mockChange));
      await client.project('PROJ').repo('my-repo').pullRequest(42).changes({ withComments: true });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/changes?withComments=true`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').pullRequest(42).changes(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).pullRequest(id).reports()', () => {
    const mockReport: BitbucketReport = {
      key: 'my-coverage-tool',
      title: 'Code Coverage',
      details: '85% coverage',
      result: 'PASS',
      reporter: 'Coverage Bot',
      createdDate: 1700000000000,
      updatedDate: 1700000000000,
    };

    it('calls GET .../pull-requests/{id}/reports', async () => {
      mockOk(pagedOf(mockReport));
      await client.project('PROJ').repo('my-repo').pullRequest(42).reports();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/reports`,
        expect.any(Object),
      );
    });

    it('returns the paged response with reports', async () => {
      mockOk(pagedOf(mockReport));
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).reports();
      expect(result).toEqual(pagedOf(mockReport));
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockReport));
      await client.project('PROJ').repo('my-repo').pullRequest(42).reports({ limit: 10, start: 0 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/reports?limit=10&start=0`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').pullRequest(42).reports(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).pullRequest(id).buildSummaries()', () => {
    const mockBuildSummaries: BitbucketBuildSummaries = {
      abc123def456: { successful: 2, failed: 0, inProgress: 0, cancelled: 0, unknown: 0 },
      def456abc123: { successful: 0, failed: 1, inProgress: 1, cancelled: 0, unknown: 0 },
    };

    it('calls GET .../pull-requests/{id}/build-summaries', async () => {
      mockOk(mockBuildSummaries);
      await client.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/build-summaries`,
        expect.any(Object),
      );
    });

    it('returns the build summaries map', async () => {
      mockOk(mockBuildSummaries);
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
      expect(result).toEqual(mockBuildSummaries);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).pullRequest(id).issues()', () => {
    const mockIssues: BitbucketIssue[] = [
      { key: 'ABC-123', url: 'https://jira.example.com/browse/ABC-123' },
      { key: 'ABC-456', url: 'https://jira.example.com/browse/ABC-456' },
    ];

    it('calls GET .../pull-requests/{id}/issues', async () => {
      mockOk(mockIssues);
      await client.project('PROJ').repo('my-repo').pullRequest(42).issues();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/issues`,
        expect.any(Object),
      );
    });

    it('returns the list of linked Jira issues', async () => {
      mockOk(mockIssues);
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).issues();
      expect(result).toEqual(mockIssues);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').pullRequest(42).issues(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('users()', () => {
    const mockUser: BitbucketUser = {
      name: 'pilmee',
      emailAddress: 'john@example.com',
      id: 1,
      displayName: 'John Doe',
      active: true,
      slug: 'pilmee',
      type: 'NORMAL',
      links: {},
    };

    it('calls GET /users', async () => {
      mockOk(pagedOf(mockUser));
      await client.users();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/users`, expect.any(Object));
    });

    it('returns the paged response with users', async () => {
      mockOk(pagedOf(mockUser));
      expect(await client.users()).toEqual(pagedOf(mockUser));
    });

    it('appends filter and limit as query params', async () => {
      mockOk(pagedOf(mockUser));
      await client.users({ filter: 'john', limit: 10 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/users?filter=john&limit=10`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.users()).rejects.toThrow('Bitbucket API error: 401 Unauthorized');
    });
  });

  describe('user(slug)', () => {
    const mockUser: BitbucketUser = {
      name: 'pilmee',
      emailAddress: 'john@example.com',
      id: 1,
      displayName: 'John Doe',
      active: true,
      slug: 'pilmee',
      type: 'NORMAL',
      links: {},
    };

    it('resolves to user info when awaited', async () => {
      mockOk(mockUser);
      expect(await client.user('pilmee')).toEqual(mockUser);
    });

    it('calls GET /users/{slug} when awaited', async () => {
      mockOk(mockUser);
      await client.user('pilmee');
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/users/pilmee`, expect.any(Object));
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.user('pilmee')).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).users()', () => {
    const mockUserPermission: BitbucketUserPermission = {
      user: {
        name: 'pilmee',
        emailAddress: 'john@example.com',
        id: 1,
        displayName: 'John Doe',
        active: true,
        slug: 'pilmee',
        type: 'NORMAL',
        links: {},
      },
      permission: 'PROJECT_WRITE',
    };

    it('calls GET /projects/{key}/permissions/users', async () => {
      mockOk(pagedOf(mockUserPermission));
      await client.project('PROJ').users();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/permissions/users`,
        expect.any(Object),
      );
    });

    it('returns the paged response with user permissions', async () => {
      mockOk(pagedOf(mockUserPermission));
      expect(await client.project('PROJ').users()).toEqual(pagedOf(mockUserPermission));
    });

    it('appends filter and permission as query params', async () => {
      mockOk(pagedOf(mockUserPermission));
      await client.project('PROJ').users({ filter: 'john', permission: 'PROJECT_WRITE' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/permissions/users?filter=john&permission=PROJECT_WRITE`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.project('PROJ').users()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('project(key).repo(slug).raw()', () => {
    function mockText(body: string): void {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(body),
      } as Response);
    }

    it('calls GET .../raw/{path}', async () => {
      mockText('export const x = 1;');
      await client.project('PROJ').repo('my-repo').raw('src/index.ts');
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/raw/src/index.ts`,
        expect.any(Object),
      );
    });

    it('returns the raw file content as a string', async () => {
      mockText('export const x = 1;');
      const result = await client.project('PROJ').repo('my-repo').raw('src/index.ts');
      expect(result).toBe('export const x = 1;');
    });

    it('appends at as a query param', async () => {
      mockText('export const x = 1;');
      await client.project('PROJ').repo('my-repo').raw('src/index.ts', { at: 'main' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/raw/src/index.ts?at=main`);
    });

    it('throws on a non-OK response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve(''),
      } as Response);
      await expect(
        client.project('PROJ').repo('my-repo').raw('src/index.ts'),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).lastModified()', () => {
    const mockEntry: BitbucketLastModifiedEntry = {
      path: {
        components: ['src', 'index.ts'],
        parent: 'src',
        name: 'index.ts',
        extension: 'ts',
        toString: 'src/index.ts',
      },
      latestCommit: mockCommit,
    };

    it('calls GET .../last-modified', async () => {
      mockOk(pagedOf(mockEntry));
      await client.project('PROJ').repo('my-repo').lastModified();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/last-modified`,
        expect.any(Object),
      );
    });

    it('returns the paged response with last-modified entries', async () => {
      mockOk(pagedOf(mockEntry));
      const result = await client.project('PROJ').repo('my-repo').lastModified();
      expect(result).toEqual(pagedOf(mockEntry));
    });

    it('appends at as a query param', async () => {
      mockOk(pagedOf(mockEntry));
      await client.project('PROJ').repo('my-repo').lastModified({ at: 'main' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/last-modified?at=main`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').lastModified(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).forks()', () => {
    it('calls GET .../forks', async () => {
      mockOk(pagedOf(mockRepo));
      await client.project('PROJ').repo('my-repo').forks();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/forks`,
        expect.any(Object),
      );
    });

    it('returns the paged response with forked repositories', async () => {
      mockOk(pagedOf(mockRepo));
      const result = await client.project('PROJ').repo('my-repo').forks();
      expect(result).toEqual(pagedOf(mockRepo));
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf(mockRepo));
      await client.project('PROJ').repo('my-repo').forks({ limit: 10, start: 0 });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/forks?limit=10&start=0`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').forks(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).tagsByCommits()', () => {
    const mockTag: BitbucketTag = {
      id: 'refs/tags/v1.0.0',
      displayId: 'v1.0.0',
      type: 'TAG',
      latestCommit: 'abc123def456',
      latestChangeset: 'abc123def456',
    };
    const commits = ['abc123def456', 'def456abc123'];

    it('calls POST .../tags with the commit array as body', async () => {
      mockOk(pagedOf(mockTag));
      await client.project('PROJ').repo('my-repo').tagsByCommits(commits);
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/tags`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(commits),
        }),
      );
    });

    it('returns the paged response with tags', async () => {
      mockOk(pagedOf(mockTag));
      const result = await client.project('PROJ').repo('my-repo').tagsByCommits(commits);
      expect(result).toEqual(pagedOf(mockTag));
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').tagsByCommits(commits),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).tags()', () => {
    const mockTag: BitbucketTag = {
      id: 'refs/tags/v1.0.0',
      displayId: 'v1.0.0',
      type: 'TAG',
      latestCommit: 'abc123def456',
      latestChangeset: 'abc123def456',
    };

    it('calls GET .../tags', async () => {
      mockOk(pagedOf(mockTag));
      await client.project('PROJ').repo('my-repo').tags();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/tags`,
        expect.any(Object),
      );
    });

    it('returns the paged response with tags', async () => {
      mockOk(pagedOf(mockTag));
      const result = await client.project('PROJ').repo('my-repo').tags();
      expect(result).toEqual(pagedOf(mockTag));
    });

    it('appends filterText and orderBy as query params', async () => {
      mockOk(pagedOf(mockTag));
      await client.project('PROJ').repo('my-repo').tags({ filterText: 'v1', orderBy: 'ALPHABETICAL' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/tags?filterText=v1&orderBy=ALPHABETICAL`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').tags(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).webhooks()', () => {
    const mockWebhook: BitbucketWebhook = {
      id: 1,
      name: 'CI Notifier',
      url: 'https://ci.example.com/hook',
      events: ['pr:opened', 'pr:merged'],
      active: true,
      scopeType: 'project',
      sslVerificationRequired: true,
    };

    it('calls GET /projects/{key}/webhooks', async () => {
      mockOk(pagedOf(mockWebhook));
      await client.project('PROJ').webhooks();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/webhooks`,
        expect.any(Object),
      );
    });

    it('returns the paged response with webhooks', async () => {
      mockOk(pagedOf(mockWebhook));
      expect(await client.project('PROJ').webhooks()).toEqual(pagedOf(mockWebhook));
    });

    it('appends event filter as query param', async () => {
      mockOk(pagedOf(mockWebhook));
      await client.project('PROJ').webhooks({ event: 'pr:opened' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/webhooks?event=pr%3Aopened`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').webhooks()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('project(key).repo(slug).webhooks()', () => {
    const mockWebhook: BitbucketWebhook = {
      id: 2,
      name: 'Repo Hook',
      url: 'https://ci.example.com/repo-hook',
      events: ['repo:push'],
      active: true,
      scopeType: 'repository',
      sslVerificationRequired: false,
    };

    it('calls GET .../webhooks/search', async () => {
      mockOk(pagedOf(mockWebhook));
      await client.project('PROJ').repo('my-repo').webhooks();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/webhooks/search`,
        expect.any(Object),
      );
    });

    it('returns the paged response with webhooks', async () => {
      mockOk(pagedOf(mockWebhook));
      expect(await client.project('PROJ').repo('my-repo').webhooks()).toEqual(pagedOf(mockWebhook));
    });

    it('appends event filter as query param', async () => {
      mockOk(pagedOf(mockWebhook));
      await client.project('PROJ').repo('my-repo').webhooks({ event: 'repo:push' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/webhooks/search?event=repo%3Apush`);
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.project('PROJ').repo('my-repo').webhooks()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('project(key).repo(slug).size()', () => {
    const mockSize: BitbucketRepositorySize = {
      repository: 1048576,
      attachments: 0,
    };

    it('calls GET .../sizes', async () => {
      mockOk(mockSize);
      await client.project('PROJ').repo('my-repo').size();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/sizes`,
        expect.any(Object),
      );
    });

    it('returns the repository size object', async () => {
      mockOk(mockSize);
      const result = await client.project('PROJ').repo('my-repo').size();
      expect(result).toEqual(mockSize);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').size(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).branches()', () => {
    const mockBranch: BitbucketBranch = {
      id: 'refs/heads/main',
      displayId: 'main',
      type: 'BRANCH',
      latestCommit: 'abc123def456',
      latestChangeset: 'abc123def456',
      isDefault: true,
    };

    it('calls GET .../branches', async () => {
      mockOk(pagedOf(mockBranch));
      await client.project('PROJ').repo('my-repo').branches();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/branches`,
        expect.any(Object),
      );
    });

    it('returns the paged response with branches', async () => {
      mockOk(pagedOf(mockBranch));
      const result = await client.project('PROJ').repo('my-repo').branches();
      expect(result).toEqual(pagedOf(mockBranch));
    });

    it('appends filterText and orderBy as query params', async () => {
      mockOk(pagedOf(mockBranch));
      await client.project('PROJ').repo('my-repo').branches({ filterText: 'feat', orderBy: 'MODIFICATION' });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/branches?filterText=feat&orderBy=MODIFICATION`,
      );
    });

    it('appends details and boostMatches as boolean query params', async () => {
      mockOk(pagedOf(mockBranch));
      await client.project('PROJ').repo('my-repo').branches({ details: true, boostMatches: true });
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/branches?details=true&boostMatches=true`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').branches(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('BitbucketApiError', () => {
    it('throws a BitbucketApiError instance on non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ')).rejects.toBeInstanceOf(BitbucketApiError);
    });

    it('exposes the HTTP status code', async () => {
      mockError(403, 'Forbidden');
      try {
        await client.project('PROJ');
      } catch (err) {
        expect((err as BitbucketApiError).status).toBe(403);
      }
    });

    it('exposes the HTTP status text', async () => {
      mockError(401, 'Unauthorized');
      try {
        await client.project('PROJ');
      } catch (err) {
        expect((err as BitbucketApiError).statusText).toBe('Unauthorized');
      }
    });

    it('has a descriptive message', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ')).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });

    it('also applies to text requests', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').raw('src/index.ts'),
      ).rejects.toBeInstanceOf(BitbucketApiError);
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
