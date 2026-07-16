import { BitbucketClient } from '../src/BitbucketClient';
import type { BitbucketBranch } from '../src/domain/Branch';
import type { BitbucketBuildSummaries } from '../src/domain/BuildSummary';
import type { BitbucketChange } from '../src/domain/Change';
import type { BitbucketCommit } from '../src/domain/Commit';
import type { BitbucketIssue } from '../src/domain/Issue';
import type { BitbucketLastModifiedEntry } from '../src/domain/LastModified';
import type { BitbucketProject } from '../src/domain/Project';
import type { BitbucketParticipant, BitbucketPullRequest } from '../src/domain/PullRequest';
import type { BitbucketPullRequestActivity } from '../src/domain/PullRequestActivity';
import type { BitbucketPullRequestTask } from '../src/domain/PullRequestTask';
import type { BitbucketReport } from '../src/domain/Report';
import type { BitbucketRepository } from '../src/domain/Repository';
import type { BitbucketRepositorySize } from '../src/domain/RepositorySize';
import type { BitbucketTag } from '../src/domain/Tag';
import type { BitbucketUser, BitbucketUserPermission } from '../src/domain/User';
import type { BitbucketWebhook } from '../src/domain/Webhook';
import { BitbucketApiError } from '../src/errors/BitbucketApiError';

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
        () =>
          new BitbucketClient({ apiUrl: 'not-a-url', apiPath: API_PATH, user: USER, token: TOKEN }),
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
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects?limit=10&start=20`);
    });

    it('appends name filter as query param', async () => {
      mockOk(pagedOf(mockProject));
      await client.projects({ name: 'my-proj' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects?name=my-proj`);
    });

    it('ignores undefined filter values', async () => {
      mockOk(pagedOf(mockProject));
      await client.projects({ limit: 5, name: undefined });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects?limit=5`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.projects()).rejects.toThrow('Bitbucket API error: 401 Unauthorized');
    });
  });

  describe('createProject()', () => {
    const createData = { key: 'PROJ', name: 'My Project', description: 'A project' };

    it('calls POST /projects with the project as body', async () => {
      mockOk(mockProject);
      await client.createProject(createData);
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        }),
      );
    });

    it('returns the created project', async () => {
      mockOk(mockProject);
      expect(await client.createProject(createData)).toEqual(mockProject);
    });

    it('throws on a non-OK response', async () => {
      mockError(409, 'Conflict');
      await expect(client.createProject(createData)).rejects.toThrow(
        'Bitbucket API error: 409 Conflict',
      );
    });
  });

  describe('repos()', () => {
    it('calls GET /repos', async () => {
      mockOk(pagedOf(mockRepo));
      await client.repos();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/repos`, expect.any(Object));
    });

    it('returns the paged response with repositories', async () => {
      mockOk(pagedOf(mockRepo));
      expect(await client.repos()).toEqual(pagedOf(mockRepo));
    });

    it('passes filters verbatim as query params (no % prefix on name)', async () => {
      mockOk(pagedOf(mockRepo));
      await client.repos({ name: 'orchestrator', permission: 'REPO_READ', limit: 100 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/repos?name=orchestrator&permission=REPO_READ&limit=100`);
    });

    it('supports projectkey and archived filters', async () => {
      mockOk(pagedOf(mockRepo));
      await client.repos({ projectkey: 'PROJ', archived: 'ALL' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/repos?projectkey=PROJ&archived=ALL`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.repos()).rejects.toThrow('Bitbucket API error: 401 Unauthorized');
    });
  });

  describe('dashboardPullRequests()', () => {
    it('calls GET /dashboard/pull-requests', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.dashboardPullRequests();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/dashboard/pull-requests`, expect.any(Object));
    });

    it('returns the paged response with pull requests', async () => {
      mockOk(pagedOf(mockPullRequest));
      expect(await client.dashboardPullRequests()).toEqual(pagedOf(mockPullRequest));
    });

    it('appends state, role, participantStatus and closedSince as query params', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.dashboardPullRequests({
        state: 'OPEN',
        role: 'REVIEWER',
        participantStatus: 'UNAPPROVED',
        closedSince: 1700000000,
      });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/dashboard/pull-requests?state=OPEN&role=REVIEWER&participantStatus=UNAPPROVED&closedSince=1700000000`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.dashboardPullRequests()).rejects.toThrow(
        'Bitbucket API error: 401 Unauthorized',
      );
    });
  });

  describe('inboxPullRequests()', () => {
    it('calls GET /inbox/pull-requests', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.inboxPullRequests();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/inbox/pull-requests`, expect.any(Object));
    });

    it('returns the paged response with pull requests', async () => {
      mockOk(pagedOf(mockPullRequest));
      expect(await client.inboxPullRequests()).toEqual(pagedOf(mockPullRequest));
    });

    it('appends role and filterText as query params', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.inboxPullRequests({ role: 'AUTHOR', filterText: 'feature' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/inbox/pull-requests?role=AUTHOR&filterText=feature`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.inboxPullRequests()).rejects.toThrow(
        'Bitbucket API error: 401 Unauthorized',
      );
    });
  });

  describe('inboxPullRequestsCount()', () => {
    it('calls GET /inbox/pull-requests/count', async () => {
      mockOk({ count: 3 });
      await client.inboxPullRequestsCount();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/inbox/pull-requests/count`,
        expect.any(Object),
      );
    });

    it('returns the count', async () => {
      mockOk({ count: 3 });
      expect(await client.inboxPullRequestsCount()).toEqual({ count: 3 });
    });

    it('appends role and filterText as query params', async () => {
      mockOk({ count: 1 });
      await client.inboxPullRequestsCount({ role: 'REVIEWER' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/inbox/pull-requests/count?role=REVIEWER`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.inboxPullRequestsCount()).rejects.toThrow(
        'Bitbucket API error: 401 Unauthorized',
      );
    });
  });

  describe('pullRequestSuggestions()', () => {
    const mockSuggestion = {
      changeTime: 1700000000000,
      refChange: {
        refId: 'refs/heads/feature',
        fromHash: 'abc123',
        toHash: 'def456',
        type: 'UPDATE',
      },
      repository: mockRepo,
      fromRef: { id: 'refs/heads/feature', displayId: 'feature', type: 'BRANCH' },
      toRef: { id: 'refs/heads/main', displayId: 'main', type: 'BRANCH' },
    };

    it('calls GET /dashboard/pull-request-suggestions', async () => {
      mockOk(pagedOf(mockSuggestion));
      await client.pullRequestSuggestions();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/dashboard/pull-request-suggestions`,
        expect.any(Object),
      );
    });

    it('returns the paged response with suggestions', async () => {
      mockOk(pagedOf(mockSuggestion));
      expect(await client.pullRequestSuggestions()).toEqual(pagedOf(mockSuggestion));
    });

    it('appends changesSince and limit as query params', async () => {
      mockOk(pagedOf(mockSuggestion));
      await client.pullRequestSuggestions({ changesSince: 86400, limit: 5 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/dashboard/pull-request-suggestions?changesSince=86400&limit=5`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.pullRequestSuggestions()).rejects.toThrow(
        'Bitbucket API error: 401 Unauthorized',
      );
    });
  });

  describe('markupPreview()', () => {
    it('calls POST /markup/preview with the raw markup as body (not JSON-encoded)', async () => {
      mockOk({ html: '<p>I am <strong>bold</strong></p>' });
      await client.markupPreview('I am **bold**');
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/markup/preview`,
        expect.objectContaining({
          method: 'POST',
          body: 'I am **bold**',
        }),
      );
    });

    it('appends rendering options as query params', async () => {
      mockOk({ html: '<p>hi</p>' });
      await client.markupPreview('hi', { urlMode: 'ABSOLUTE', hardwrap: true, htmlEscape: true });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/markup/preview?urlMode=ABSOLUTE&hardwrap=true&htmlEscape=true`);
    });

    it('returns the rendered HTML', async () => {
      mockOk({ html: '<p>I am <strong>bold</strong></p>' });
      expect(await client.markupPreview('I am **bold**')).toEqual({
        html: '<p>I am <strong>bold</strong></p>',
      });
    });

    it('throws on a non-OK response', async () => {
      mockError(400, 'Bad Request');
      await expect(client.markupPreview('hi')).rejects.toThrow(
        'Bitbucket API error: 400 Bad Request',
      );
    });
  });

  describe('groups()', () => {
    it('calls GET /groups', async () => {
      mockOk(pagedOf('developers'));
      await client.groups();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/groups`, expect.any(Object));
    });

    it('returns the paged response with group names', async () => {
      mockOk(pagedOf('developers', 'devops'));
      expect(await client.groups()).toEqual(pagedOf('developers', 'devops'));
    });

    it('appends filter as query param', async () => {
      mockOk(pagedOf('developers'));
      await client.groups({ filter: 'dev', limit: 10 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/groups?filter=dev&limit=10`);
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.groups()).rejects.toThrow('Bitbucket API error: 401 Unauthorized');
    });
  });

  describe('codeSearch()', () => {
    const mockSearchResult = {
      scope: { type: 'GLOBAL' },
      code: {
        category: 'primary',
        isLastPage: true,
        count: 1,
        start: 0,
        values: [
          {
            repository: mockRepo,
            file: 'src/index.ts',
            hitContexts: [[{ line: 1, text: 'const <em>foo</em> = 1;' }]],
            hitCount: 1,
          },
        ],
      },
      query: { substituted: false },
    };

    it('calls POST /rest/search/latest/search with the query wrapped in a code entity', async () => {
      mockOk(mockSearchResult);
      await client.codeSearch('foo repo:my-repo');
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/search/latest/search`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ query: 'foo repo:my-repo', entities: { code: {} } }),
        }),
      );
    });

    it('passes start and limit inside the code entity', async () => {
      mockOk(mockSearchResult);
      await client.codeSearch('foo', { start: 25, limit: 25 });
      const [[, init]] = fetchMock.mock.calls;

      expect(init?.body).toBe(
        JSON.stringify({ query: 'foo', entities: { code: { start: 25, limit: 25 } } }),
      );
    });

    it('returns the search result', async () => {
      mockOk(mockSearchResult);
      expect(await client.codeSearch('foo')).toEqual(mockSearchResult);
    });

    it('throws on a non-OK response', async () => {
      mockError(400, 'Bad Request');
      await expect(client.codeSearch('')).rejects.toThrow('Bitbucket API error: 400 Bad Request');
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
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos?limit=50&start=100`);
    });

    it('appends name filter as query param', async () => {
      mockOk(pagedOf(mockRepo));
      await client.project('PROJ').repos({ name: 'api' });
      const [[url]] = fetchMock.mock.calls;

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
      expect(await client.project('PROJ').repo('my-repo').pullRequests()).toEqual(
        pagedOf(mockPullRequest),
      );
    });

    it('appends state filter as query param', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client.project('PROJ').repo('my-repo').pullRequests({ state: 'MERGED' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/pull-requests?state=MERGED`);
    });

    it('appends limit, start and order as query params', async () => {
      mockOk(pagedOf(mockPullRequest));
      await client
        .project('PROJ')
        .repo('my-repo')
        .pullRequests({ limit: 10, start: 0, order: 'NEWEST' });
      const [[url]] = fetchMock.mock.calls;

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
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/commits?limit=5&until=main`);
    });

    it('appends boolean params as strings', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').commits({ followRenames: true });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/commits?followRenames=true`);
    });

    it('appends path filter as query param', async () => {
      mockOk(pagedOf(mockCommit));
      await client.project('PROJ').repo('my-repo').commits({ path: 'src/index.ts' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/commits?path=src%2Findex.ts`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').commits()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('project(key).repo(slug).commit(id)', () => {
    it('resolves to commit info when awaited', async () => {
      mockOk(mockCommit);
      expect(await client.project('PROJ').repo('my-repo').commit('abc123')).toEqual(mockCommit);
    });

    it('calls GET .../commits/{id} when awaited', async () => {
      mockOk(mockCommit);
      await client.project('PROJ').repo('my-repo').commit('abc123');
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/commits/abc123`,
        expect.any(Object),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').commit('abc123')).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('project(key).repo(slug).commit(id).changes()', () => {
    it('calls GET .../commits/{id}/changes', async () => {
      mockOk(pagedOf());
      await client.project('PROJ').repo('my-repo').commit('abc123').changes();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/commits/abc123/changes`,
        expect.any(Object),
      );
    });

    it('appends since as a query param', async () => {
      mockOk(pagedOf());
      await client.project('PROJ').repo('my-repo').commit('abc123').changes({ since: 'def456' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/commits/abc123/changes?since=def456`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(
        client.project('PROJ').repo('my-repo').commit('abc123').changes(),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('project(key).repo(slug).commit(id).diff()', () => {
    const mockDiff = {
      diffs: [],
      truncated: false,
      contextLines: 10,
    };

    it('calls GET .../commits/{id}/diff', async () => {
      mockOk(mockDiff);
      await client.project('PROJ').repo('my-repo').commit('abc123').diff();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/commits/abc123/diff`,
        expect.any(Object),
      );
    });

    it('returns the diff object', async () => {
      mockOk(mockDiff);
      expect(await client.project('PROJ').repo('my-repo').commit('abc123').diff()).toEqual(
        mockDiff,
      );
    });

    it('appends contextLines, since and whitespace as query params', async () => {
      mockOk(mockDiff);
      await client.project('PROJ').repo('my-repo').commit('abc123').diff({
        contextLines: 5,
        since: 'def456',
        whitespace: 'ignore-all',
      });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/commits/abc123/diff?contextLines=5&since=def456&whitespace=ignore-all`,
      );
    });

    it('appends path as a URL path segment', async () => {
      mockOk(mockDiff);
      await client.project('PROJ').repo('my-repo').commit('abc123').diff({ path: 'src/index.ts' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/commits/abc123/diff/src/index.ts`);
    });

    it('appends srcPath as a query param', async () => {
      mockOk(mockDiff);
      await client
        .project('PROJ')
        .repo('my-repo')
        .commit('abc123')
        .diff({ path: 'src/index.ts', srcPath: 'src/old.ts' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/commits/abc123/diff/src/index.ts?srcPath=src%2Fold.ts`,
      );
    });

    it('combines path segment with other query params', async () => {
      mockOk(mockDiff);
      await client.project('PROJ').repo('my-repo').commit('abc123').diff({
        path: 'src/index.ts',
        contextLines: 3,
      });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/commits/abc123/diff/src/index.ts?contextLines=3`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').commit('abc123').diff()).rejects.toThrow(
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
      await client
        .project('PROJ')
        .repo('my-repo')
        .pullRequest(42)
        .activities({ limit: 10, start: 5 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/activities?limit=10&start=5`,
      );
    });

    it('appends fromId and fromType as query params', async () => {
      mockOk(pagedOf(mockActivity));
      await client
        .project('PROJ')
        .repo('my-repo')
        .pullRequest(42)
        .activities({ fromId: 7, fromType: 'COMMENT' });
      const [[url]] = fetchMock.mock.calls;

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
      severity: 'BLOCKER',
      state: 'OPEN',
      permittedOperations: { editable: true, deletable: true, transitionable: true },
    };

    it('calls GET .../pull-requests/{id}/blocker-comments', async () => {
      mockOk(pagedOf(mockTask));
      await client.project('PROJ').repo('my-repo').pullRequest(42).tasks();
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/blocker-comments`,
        expect.any(Object),
      );
    });

    it('returns the paged response with tasks', async () => {
      mockOk(pagedOf(mockTask));
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).tasks();

      expect(result).toEqual(pagedOf(mockTask));
    });

    it('appends limit, start and states as query params', async () => {
      mockOk(pagedOf(mockTask));
      await client
        .project('PROJ')
        .repo('my-repo')
        .pullRequest(42)
        .tasks({ limit: 10, start: 5, states: 'OPEN' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/blocker-comments?limit=10&start=5&states=OPEN`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.project('PROJ').repo('my-repo').pullRequest(42).tasks()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
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
      await client
        .project('PROJ')
        .repo('my-repo')
        .pullRequest(42)
        .commits({ limit: 10, start: 20 });
      const [[url]] = fetchMock.mock.calls;

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
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/changes?limit=50&start=0`,
      );
    });

    it('appends withComments as query param', async () => {
      mockOk(pagedOf(mockChange));
      await client.project('PROJ').repo('my-repo').pullRequest(42).changes({ withComments: true });
      const [[url]] = fetchMock.mock.calls;

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

    it('resolves the latest source commit and calls the Code Insights API', async () => {
      mockOk(mockPullRequest);
      mockOk(pagedOf(mockReport));
      await client.project('PROJ').repo('my-repo').pullRequest(42).reports();
      const [[pullRequestUrl], [reportsUrl]] = fetchMock.mock.calls;

      expect(pullRequestUrl).toBe(`${BASE}/projects/PROJ/repos/my-repo/pull-requests/42`);
      expect(reportsUrl).toBe(
        `${API_URL}/rest/insights/latest/projects/PROJ/repos/my-repo/commits/abc123/reports`,
      );
    });

    it('returns the paged response with reports', async () => {
      mockOk(mockPullRequest);
      mockOk(pagedOf(mockReport));
      const result = await client.project('PROJ').repo('my-repo').pullRequest(42).reports();

      expect(result).toEqual(pagedOf(mockReport));
    });

    it('appends limit and start as query params', async () => {
      mockOk(mockPullRequest);
      mockOk(pagedOf(mockReport));
      await client.project('PROJ').repo('my-repo').pullRequest(42).reports({ limit: 10, start: 0 });
      const [, [url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${API_URL}/rest/insights/latest/projects/PROJ/repos/my-repo/commits/abc123/reports?limit=10&start=0`,
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

    it('fetches the pull request commits and posts their IDs to the build stats API', async () => {
      mockOk(pagedOf(mockCommit));
      mockOk(mockBuildSummaries);
      await client.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
      const [[commitsUrl], [statsUrl, statsInit]] = fetchMock.mock.calls;

      expect(commitsUrl).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/pull-requests/42/commits?limit=100`,
      );
      expect(statsUrl).toBe(`${API_URL}/rest/build-status/latest/commits/stats`);
      expect(statsInit?.method).toBe('POST');
      expect(statsInit?.body).toBe(JSON.stringify([mockCommit.id]));
    });

    it('returns the build summaries map', async () => {
      mockOk(pagedOf(mockCommit));
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

    it('calls GET /rest/jira/latest/.../pull-requests/{id}/issues', async () => {
      mockOk(mockIssues);
      await client.project('PROJ').repo('my-repo').pullRequest(42).issues();
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/jira/latest/projects/PROJ/repos/my-repo/pull-requests/42/issues`,
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
      await expect(client.project('PROJ').repo('my-repo').pullRequest(42).issues()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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
      const [[url]] = fetchMock.mock.calls;

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

  describe('currentUser()', () => {
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

    function mockWhoami(username: string | null): void {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: (name: string) => (name === 'X-AUSERNAME' ? username : null) },
        json: () => Promise.resolve({}),
      } as unknown as Response);
    }

    it('resolves the username via X-AUSERNAME and looks the user up', async () => {
      mockWhoami('pilmee');
      mockOk(pagedOf(mockUser));
      const result = await client.currentUser();
      const [[whoamiUrl], [usersUrl]] = fetchMock.mock.calls;

      expect(whoamiUrl).toBe(`${BASE}/application-properties`);
      expect(usersUrl).toBe(`${BASE}/users?filter=pilmee`);
      expect(result).toEqual(mockUser);
    });

    it('matches the user by name case-insensitively', async () => {
      mockWhoami('PILMEE');
      mockOk(pagedOf({ ...mockUser, name: 'pilmee' }));

      expect(await client.currentUser()).toEqual(mockUser);
    });

    it('throws when the X-AUSERNAME header is missing', async () => {
      mockWhoami(null);
      await expect(client.currentUser()).rejects.toThrow(
        'Unable to determine the authenticated user',
      );
    });

    it('throws when no user matches the username', async () => {
      mockWhoami('pilmee');
      mockOk(pagedOf());
      await expect(client.currentUser()).rejects.toThrow(
        'Unable to find the authenticated user "pilmee"',
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.currentUser()).rejects.toThrow('Bitbucket API error: 401 Unauthorized');
    });
  });

  describe('user(slug).sshKeys()', () => {
    it('calls GET /rest/ssh/latest/keys?user={slug}', async () => {
      mockOk(pagedOf({ id: 1, text: 'ssh-rsa AAAA...', label: 'work laptop' }));
      await client.user('pilmee').sshKeys();
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${API_URL}/rest/ssh/latest/keys?user=pilmee`);
    });

    it('appends limit and start as query params', async () => {
      mockOk(pagedOf());
      await client.user('pilmee').sshKeys({ limit: 10, start: 5 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${API_URL}/rest/ssh/latest/keys?user=pilmee&limit=10&start=5`);
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.user('pilmee').sshKeys()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('user(slug).addSshKey() / deleteSshKey()', () => {
    const keyData = { text: 'ssh-ed25519 AAAA... laptop', label: 'laptop' };
    const mockKey = { id: 7, ...keyData };

    it('calls POST /rest/ssh/latest/keys?user={slug} with the key as body', async () => {
      mockOk(mockKey);
      await client.user('pilmee').addSshKey(keyData);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/ssh/latest/keys?user=pilmee`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(keyData),
        }),
      );
    });

    it('returns the created key', async () => {
      mockOk(mockKey);
      expect(await client.user('pilmee').addSshKey(keyData)).toEqual(mockKey);
    });

    it('calls DELETE /rest/ssh/latest/keys/{keyId}', async () => {
      mockOk(undefined);
      await client.user('pilmee').deleteSshKey(7);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/ssh/latest/keys/7`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(400, 'Bad Request');
      await expect(client.user('pilmee').addSshKey(keyData)).rejects.toThrow(
        'Bitbucket API error: 400 Bad Request',
      );
    });
  });

  describe('user(slug).updateSettings()', () => {
    it('calls PUT /users/{slug}/settings with the settings as body', async () => {
      mockOk(undefined);
      await client.user('pilmee').updateSettings({ 'my-plugin.setting': true });
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/users/pilmee/settings`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ 'my-plugin.setting': true }),
        }),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.user('pilmee').updateSettings({})).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('user(slug) access tokens', () => {
    const mockToken = {
      id: 'abc123',
      name: 'ci-read',
      permissions: ['REPO_READ'],
      createdDate: 1700000000000,
    };

    it('accessTokens() calls GET /rest/access-tokens/latest/users/{slug}', async () => {
      mockOk(pagedOf(mockToken));
      await client.user('pilmee').accessTokens({ limit: 10 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${API_URL}/rest/access-tokens/latest/users/pilmee?limit=10`);
    });

    it('accessTokens() returns the paged response with tokens', async () => {
      mockOk(pagedOf(mockToken));
      expect(await client.user('pilmee').accessTokens()).toEqual(pagedOf(mockToken));
    });

    it('accessToken(id) calls GET /rest/access-tokens/latest/users/{slug}/{tokenId}', async () => {
      mockOk(mockToken);
      expect(await client.user('pilmee').accessToken('abc123')).toEqual(mockToken);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/access-tokens/latest/users/pilmee/abc123`,
        expect.any(Object),
      );
    });

    it('createAccessToken() creates via PUT and returns the raw token secret', async () => {
      const created = { ...mockToken, token: 'raw-secret' };
      const createData = { name: 'ci-read', permissions: ['REPO_READ'], expiryDays: 90 };

      mockOk(created);
      expect(await client.user('pilmee').createAccessToken(createData)).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/access-tokens/latest/users/pilmee`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(createData),
        }),
      );
    });

    it('updateAccessToken() updates via POST', async () => {
      mockOk(mockToken);
      await client.user('pilmee').updateAccessToken('abc123', { name: 'renamed' });
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/access-tokens/latest/users/pilmee/abc123`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'renamed' }),
        }),
      );
    });

    it('deleteAccessToken() calls DELETE', async () => {
      mockOk(undefined);
      await client.user('pilmee').deleteAccessToken('abc123');
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/access-tokens/latest/users/pilmee/abc123`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(401, 'Unauthorized');
      await expect(client.user('pilmee').accessTokens()).rejects.toThrow(
        'Bitbucket API error: 401 Unauthorized',
      );
    });
  });

  describe('user(slug) GPG keys', () => {
    const mockGpgKey = {
      id: 'gpg1',
      fingerprint: 'A1B2C3D4',
      emailAddress: 'john@example.com',
      text: '-----BEGIN PGP PUBLIC KEY BLOCK-----...',
    };

    it('gpgKeys() calls GET /rest/gpg/latest/keys?user={slug}', async () => {
      mockOk(pagedOf(mockGpgKey));
      await client.user('pilmee').gpgKeys({ limit: 10 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${API_URL}/rest/gpg/latest/keys?user=pilmee&limit=10`);
    });

    it('gpgKeys() returns the paged response with keys', async () => {
      mockOk(pagedOf(mockGpgKey));
      expect(await client.user('pilmee').gpgKeys()).toEqual(pagedOf(mockGpgKey));
    });

    it('addGpgKey() calls POST /rest/gpg/latest/keys?user={slug} with the key as body', async () => {
      const addData = { text: '-----BEGIN PGP PUBLIC KEY BLOCK-----...' };

      mockOk(mockGpgKey);
      expect(await client.user('pilmee').addGpgKey(addData)).toEqual(mockGpgKey);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/gpg/latest/keys?user=pilmee`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(addData),
        }),
      );
    });

    it('deleteGpgKey() calls DELETE /rest/gpg/latest/keys/{fingerprintOrId}', async () => {
      mockOk(undefined);
      await client.user('pilmee').deleteGpgKey('A1B2C3D4');
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/rest/gpg/latest/keys/A1B2C3D4`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.user('pilmee').gpgKeys()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('user(slug).repos()', () => {
    it('calls GET /projects/~{slug}/repos', async () => {
      mockOk(pagedOf(mockRepo));
      await client.user('pilmee').repos();
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/projects/~pilmee/repos`, expect.any(Object));
    });

    it('returns the paged response with repositories', async () => {
      mockOk(pagedOf(mockRepo));
      expect(await client.user('pilmee').repos()).toEqual(pagedOf(mockRepo));
    });

    it('appends name and limit as query params', async () => {
      mockOk(pagedOf(mockRepo));
      await client.user('pilmee').repos({ name: 'api', limit: 10 });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/~pilmee/repos?name=api&limit=10`);
    });

    it('throws on a non-OK response', async () => {
      mockError(403, 'Forbidden');
      await expect(client.user('pilmee').repos()).rejects.toThrow(
        'Bitbucket API error: 403 Forbidden',
      );
    });
  });

  describe('user(slug).repo(slug)', () => {
    it('resolves to repository info when awaited', async () => {
      mockOk(mockRepo);
      expect(await client.user('pilmee').repo('my-repo')).toEqual(mockRepo);
    });

    it('calls GET /projects/~{slug}/repos/{slug} when awaited', async () => {
      mockOk(mockRepo);
      await client.user('pilmee').repo('my-repo');
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/projects/~pilmee/repos/my-repo`,
        expect.any(Object),
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.user('pilmee').repo('my-repo')).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('user(slug).repo(slug).raw()', () => {
    it('calls GET /projects/~{slug}/repos/{slug}/raw/{path}', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('export const x = 1;'),
      } as Response);
      await client.user('pilmee').repo('my-repo').raw('src/index.ts');
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/~pilmee/repos/my-repo/raw/src/index.ts`);
    });

    it('returns the raw file content', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('hello'),
      } as Response);
      expect(await client.user('pilmee').repo('my-repo').raw('README.md')).toBe('hello');
    });

    it('throws on a non-OK response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve(''),
      } as Response);
      await expect(client.user('pilmee').repo('my-repo').raw('src/index.ts')).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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
      const [[url]] = fetchMock.mock.calls;

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
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/raw/src/index.ts?at=main`);
    });

    it('throws on a non-OK response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve(''),
      } as Response);
      await expect(client.project('PROJ').repo('my-repo').raw('src/index.ts')).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/last-modified?at=main`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').lastModified()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/forks?limit=10&start=0`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').forks()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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

    it('uses a custom apiPath when provided', async () => {
      mockOk(pagedOf(mockTag));
      await client
        .project('PROJ')
        .repo('my-repo')
        .tagsByCommits(commits, { apiPath: 'rest/api/1.0' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(`${API_URL}/rest/api/1.0/projects/PROJ/repos/my-repo/tags`);
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').tagsByCommits(commits)).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
    });
  });

  describe('project(key).repo(slug).editFile()', () => {
    const payload = {
      content: 'hello world',
      message: 'chore: update file',
      branch: 'main',
      sourceCommitId: 'abc123def456',
    };

    it('calls PUT .../browse/{path} with form-encoded body', async () => {
      mockOk(mockCommit);
      await client.project('PROJ').repo('my-repo').editFile('src/index.ts', payload);
      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect(url).toBe(`${BASE}/projects/PROJ/repos/my-repo/browse/src/index.ts`);
      expect(options).toMatchObject({ method: 'PUT' });
      expect(options.body).toBeInstanceOf(URLSearchParams);
      const body = options.body as URLSearchParams;

      expect(body.get('content')).toBe(payload.content);
      expect(body.get('message')).toBe(payload.message);
      expect(body.get('branch')).toBe(payload.branch);
      expect(body.get('sourceCommitId')).toBe(payload.sourceCommitId);
    });

    it('omits sourceBranch when not provided', async () => {
      mockOk(mockCommit);
      await client.project('PROJ').repo('my-repo').editFile('src/index.ts', payload);
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect((options.body as URLSearchParams).has('sourceBranch')).toBe(false);
    });

    it('includes sourceBranch when provided', async () => {
      mockOk(mockCommit);
      await client
        .project('PROJ')
        .repo('my-repo')
        .editFile('src/index.ts', { ...payload, sourceBranch: 'feature' });
      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect((options.body as URLSearchParams).get('sourceBranch')).toBe('feature');
    });

    it('returns the commit created by the edit', async () => {
      mockOk(mockCommit);
      const result = await client.project('PROJ').repo('my-repo').editFile('src/index.ts', payload);

      expect(result).toEqual(mockCommit);
    });

    it('throws on a non-OK response', async () => {
      mockError(409, 'Conflict');
      await expect(
        client.project('PROJ').repo('my-repo').editFile('src/index.ts', payload),
      ).rejects.toThrow('Bitbucket API error: 409 Conflict');
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
      await client
        .project('PROJ')
        .repo('my-repo')
        .tags({ filterText: 'v1', orderBy: 'ALPHABETICAL' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/tags?filterText=v1&orderBy=ALPHABETICAL`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').tags()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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
      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/projects/PROJ/webhooks`, expect.any(Object));
    });

    it('returns the paged response with webhooks', async () => {
      mockOk(pagedOf(mockWebhook));
      expect(await client.project('PROJ').webhooks()).toEqual(pagedOf(mockWebhook));
    });

    it('appends event filter as query param', async () => {
      mockOk(pagedOf(mockWebhook));
      await client.project('PROJ').webhooks({ event: 'pr:opened' });
      const [[url]] = fetchMock.mock.calls;

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
      const [[url]] = fetchMock.mock.calls;

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
      await expect(client.project('PROJ').repo('my-repo').size()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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
      await client
        .project('PROJ')
        .repo('my-repo')
        .branches({ filterText: 'feat', orderBy: 'MODIFICATION' });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/branches?filterText=feat&orderBy=MODIFICATION`,
      );
    });

    it('appends details and boostMatches as boolean query params', async () => {
      mockOk(pagedOf(mockBranch));
      await client.project('PROJ').repo('my-repo').branches({ details: true, boostMatches: true });
      const [[url]] = fetchMock.mock.calls;

      expect(url).toBe(
        `${BASE}/projects/PROJ/repos/my-repo/branches?details=true&boostMatches=true`,
      );
    });

    it('throws on a non-OK response', async () => {
      mockError(404, 'Not Found');
      await expect(client.project('PROJ').repo('my-repo').branches()).rejects.toThrow(
        'Bitbucket API error: 404 Not Found',
      );
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
      const [[, init]] = fetchMock.mock.calls;
      const headers = (init as RequestInit).headers as Record<string, string>;

      expect(headers.Authorization).toMatch(/^Basic /);
    });

    it('defaults to Basic authentication', () => {
      expect(
        () => new BitbucketClient({ apiUrl: API_URL, apiPath: API_PATH, user: USER, token: TOKEN }),
      ).not.toThrow();
    });

    it('throws when authType is basic and user is missing', () => {
      expect(
        () =>
          new BitbucketClient({
            apiUrl: API_URL,
            apiPath: API_PATH,
            token: TOKEN,
          }),
      ).toThrow('"user" is required when authType is "basic"');
    });

    it('sends a Bearer Authorization header when authType is "bearer"', async () => {
      const bearerClient = new BitbucketClient({
        apiUrl: API_URL,
        apiPath: API_PATH,
        token: TOKEN,
        authType: 'bearer',
      });

      mockOk(pagedOf(mockProject));
      await bearerClient.projects();
      const [[, init]] = fetchMock.mock.calls;
      const headers = (init as RequestInit).headers as Record<string, string>;

      expect(headers.Authorization).toBe(`Bearer ${TOKEN}`);
    });
  });

  describe('DELETE support', () => {
    type PrivateRequestBody = {
      requestPost<T>(
        path: string,
        body?: unknown,
        options?: { apiPath?: string; method?: 'POST' | 'PUT' | 'DELETE'; form?: boolean },
      ): Promise<T>;
    };

    function asPrivate(c: BitbucketClient): PrivateRequestBody {
      return c as unknown as PrivateRequestBody;
    }

    it('issues a DELETE request with no body by default', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: 'No Content',
        json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
      } as unknown as Response);

      await asPrivate(client).requestPost('/projects/PROJ', undefined, { method: 'DELETE' });
      const [[url, init]] = fetchMock.mock.calls;

      expect(url).toBe(`${BASE}/projects/PROJ`);
      expect((init as RequestInit).method).toBe('DELETE');
      expect((init as RequestInit).body).toBeUndefined();
    });

    it('issues a DELETE request with a JSON body when provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: 'No Content',
      } as Response);

      await asPrivate(client).requestPost(
        '/projects/PROJ/repos/my-repo/branches',
        { name: 'refs/heads/feature' },
        { apiPath: 'rest/branch-utils/latest', method: 'DELETE' },
      );
      const [[url, init]] = fetchMock.mock.calls;

      expect(url).toBe(`${API_URL}/rest/branch-utils/latest/projects/PROJ/repos/my-repo/branches`);
      expect((init as RequestInit).method).toBe('DELETE');
      expect((init as RequestInit).body).toBe(JSON.stringify({ name: 'refs/heads/feature' }));
    });

    it('throws a BitbucketApiError on a non-OK DELETE response', async () => {
      mockError(404, 'Not Found');
      await expect(
        asPrivate(client).requestPost('/projects/PROJ', undefined, { method: 'DELETE' }),
      ).rejects.toThrow('Bitbucket API error: 404 Not Found');
    });
  });

  describe('204 No Content / 202 Accepted handling', () => {
    it('resolves to undefined on a 204 response without calling json()', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: 'No Content',
        json: () => Promise.reject(new Error('should not be called for 204')),
      } as unknown as Response);

      await expect(client.project('PROJ')).resolves.toBeUndefined();
    });

    it('resolves to undefined on a 202 response with an empty body', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
      } as unknown as Response);

      await expect(client.project('PROJ')).resolves.toBeUndefined();
    });

    it('still parses a JSON body on a 202 response when present', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 202,
        statusText: 'Accepted',
        json: () => Promise.resolve(mockProject),
      } as Response);

      await expect(client.project('PROJ')).resolves.toEqual(mockProject);
    });

    it('rethrows non-JSON-parse errors from a successful response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.reject(new Error('boom')),
      } as unknown as Response);

      await expect(client.project('PROJ')).rejects.toThrow('boom');
    });
  });

  describe('Bitbucket error body parsing', () => {
    it('surfaces the first error message on BitbucketApiError', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            errors: [
              { context: null, message: 'The project key is invalid', exceptionName: 'com.x.Bad' },
            ],
          }),
      } as Response);

      await expect(client.project('PROJ')).rejects.toThrow(
        'Bitbucket API error: 400 Bad Request - The project key is invalid',
      );
    });

    it('exposes the parsed errors array on the thrown error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            errors: [{ context: 'name', message: 'Required', exceptionName: undefined }],
          }),
      } as Response);

      try {
        await client.project('PROJ');

        throw new Error('expected client.project to reject');
      } catch (err) {
        expect((err as BitbucketApiError).errors).toEqual([
          { context: 'name', message: 'Required', exceptionName: undefined },
        ]);
      }
    });

    it('falls back to an empty errors array when the body has no errors field', async () => {
      mockError(404, 'Not Found');

      try {
        await client.project('PROJ');

        throw new Error('expected client.project to reject');
      } catch (err) {
        expect((err as BitbucketApiError).errors).toEqual([]);
      }
    });

    it('falls back to an empty errors array when the body is not JSON', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new SyntaxError('Unexpected token <')),
      } as unknown as Response);

      try {
        await client.project('PROJ');

        throw new Error('expected client.project to reject');
      } catch (err) {
        expect((err as BitbucketApiError).errors).toEqual([]);
        expect((err as BitbucketApiError).message).toBe(
          'Bitbucket API error: 500 Internal Server Error',
        );
      }
    });
  });

  describe('rate-limit retry handling', () => {
    it('does not retry 429 responses by default', async () => {
      mockError(429, 'Too Many Requests');
      await expect(client.projects()).rejects.toThrow('Bitbucket API error: 429 Too Many Requests');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('retries a 429 response using the Retry-After header, up to maxRetries', async () => {
      const retryClient = new BitbucketClient({
        apiUrl: API_URL,
        apiPath: API_PATH,
        user: USER,
        token: TOKEN,
        retry: { maxRetries: 2 },
      });

      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: { get: (name: string) => (name === 'Retry-After' ? '0' : null) },
          json: () => Promise.resolve({}),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(pagedOf(mockProject)),
        } as Response);

      const result = await retryClient.projects();

      expect(result).toEqual(pagedOf(mockProject));
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('gives up after exhausting maxRetries and throws the last 429 response', async () => {
      const retryClient = new BitbucketClient({
        apiUrl: API_URL,
        apiPath: API_PATH,
        user: USER,
        token: TOKEN,
        retry: { maxRetries: 1 },
      });

      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: { get: (name: string) => (name === 'Retry-After' ? '0' : null) },
        json: () => Promise.resolve({}),
      } as unknown as Response);

      await expect(retryClient.projects()).rejects.toThrow(
        'Bitbucket API error: 429 Too Many Requests',
      );
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
