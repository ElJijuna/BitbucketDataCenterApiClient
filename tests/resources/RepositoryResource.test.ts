import { BitbucketClient } from '../../src/BitbucketClient';
import type { BitbucketRepository } from '../../src/domain/Repository';

const API_URL = 'https://bitbucket.example.com';
const API_PATH = 'rest/api/latest';
const BASE = `${API_URL}/${API_PATH}`;
const REPO_BASE = `${BASE}/projects/PROJ/repos/my-repo`;
const mockRepository: BitbucketRepository = {
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

describe('RepositoryResource write operations', () => {
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

  function repo() {
    return client.project('PROJ').repo('my-repo');
  }

  function lastCall(): [string, RequestInit] {
    const { calls } = fetchMock.mock;

    return calls[calls.length - 1] as [string, RequestInit];
  }

  describe('update()', () => {
    it('sends PUT with the payload', async () => {
      mockOk(mockRepository);
      await repo().update({ name: 'renamed-repo' });
      const [url, init] = lastCall();

      expect(url).toBe(REPO_BASE);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ name: 'renamed-repo' }));
    });

    it('returns the updated repository', async () => {
      mockOk(mockRepository);
      expect(await repo().update({ name: 'renamed-repo' })).toEqual(mockRepository);
    });
  });

  describe('delete()', () => {
    it('sends DELETE with no body', async () => {
      mockNoContent();
      await repo().delete();
      const [url, init] = lastCall();

      expect(url).toBe(REPO_BASE);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });

    it('resolves to undefined on 204', async () => {
      mockNoContent();
      await expect(repo().delete()).resolves.toBeUndefined();
    });
  });

  describe('fork()', () => {
    it('sends POST with the payload', async () => {
      const forked = { ...mockRepository, slug: 'my-repo-fork' };

      mockOk(forked);
      await repo().fork({ name: 'my-repo-fork' });
      const [url, init] = lastCall();

      expect(url).toBe(REPO_BASE);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ name: 'my-repo-fork' }));
    });

    it('sends POST with no body when called without data', async () => {
      mockOk(mockRepository);
      await repo().fork();
      const [url, init] = lastCall();

      expect(url).toBe(REPO_BASE);
      expect(init.method).toBe('POST');
      expect(init.body).toBeUndefined();
    });
  });

  describe('setDefaultBranch()', () => {
    it('sends PUT to default-branch', async () => {
      mockNoContent();
      await repo().setDefaultBranch({ id: 'refs/heads/develop' });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/default-branch`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ id: 'refs/heads/develop' }));
    });
  });

  describe('createBranch()', () => {
    it('sends POST to branches', async () => {
      const branch = {
        id: 'refs/heads/feature',
        displayId: 'feature',
        type: 'BRANCH' as const,
        latestCommit: 'abc123',
        latestChangeset: 'abc123',
        isDefault: false,
      };

      mockOk(branch);
      await repo().createBranch({ name: 'feature', startPoint: 'refs/heads/main' });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/branches`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ name: 'feature', startPoint: 'refs/heads/main' }));
    });
  });

  describe('deleteBranch()', () => {
    it('sends DELETE against the branch-utils API module', async () => {
      mockNoContent();
      await repo().deleteBranch({ name: 'refs/heads/feature' });
      const [url, init] = lastCall();

      expect(url).toBe(`${API_URL}/rest/branch-utils/latest/projects/PROJ/repos/my-repo/branches`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBe(JSON.stringify({ name: 'refs/heads/feature' }));
    });
  });

  describe('createTag()', () => {
    it('sends POST against the git API module', async () => {
      const tag = {
        id: 'refs/tags/v1.0.0',
        displayId: 'v1.0.0',
        type: 'TAG' as const,
        latestCommit: 'abc123',
        latestChangeset: 'abc123',
      };

      mockOk(tag);
      await repo().createTag({ name: 'v1.0.0', startPoint: 'abc123' });
      const [url, init] = lastCall();

      expect(url).toBe(`${API_URL}/rest/git/latest/projects/PROJ/repos/my-repo/tags`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ name: 'v1.0.0', startPoint: 'abc123' }));
    });
  });

  describe('deleteTag()', () => {
    it('sends DELETE against the git API module', async () => {
      mockNoContent();
      await repo().deleteTag('v1.0.0');
      const [url, init] = lastCall();

      expect(url).toBe(`${API_URL}/rest/git/latest/projects/PROJ/repos/my-repo/tags/v1.0.0`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('updateSettings()', () => {
    it('sends POST to settings/pull-requests with the payload', async () => {
      const settings = {
        mergeConfig: {
          commitSummaries: 20,
          defaultStrategy: {
            id: 'no-ff' as const,
            name: 'No fast-forward',
            description: '',
            flag: '',
          },
          strategies: [],
          type: 'REPOSITORY',
        },
        requiredApprovals: 2,
        requiredAllApprovals: false,
        requiredSuccessfulBuilds: 1,
        pullRequestsEnabled: true,
      };

      mockOk(settings);
      await repo().updateSettings({ requiredApprovals: 2 });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/pull-requests`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ requiredApprovals: 2 }));
    });
  });
});
