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

  describe('createPullRequest()', () => {
    it('sends POST with the payload', async () => {
      const payload = {
        title: 'My PR',
        fromRef: { id: 'refs/heads/feature/x' },
        toRef: { id: 'refs/heads/main' },
        reviewers: [{ user: { name: 'jdoe' } }],
      };

      mockOk({ id: 42, title: 'My PR' }, 201);
      const result = await repo().createPullRequest(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/pull-requests`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
      expect(result).toEqual({ id: 42, title: 'My PR' });
    });
  });

  describe('webhooks CRUD', () => {
    const payload = {
      name: 'CI hook',
      events: ['repo:refs_changed'],
      url: 'https://ci.example.com/hook',
    };

    it('createWebhook() sends POST with the payload', async () => {
      mockOk({ id: 7, ...payload });
      await repo().createWebhook(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/webhooks`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('updateWebhook() sends PUT to the webhook id', async () => {
      mockOk({ id: 7, ...payload });
      await repo().updateWebhook(7, payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/webhooks/7`);
      expect(init.method).toBe('PUT');
    });

    it('deleteWebhook() sends DELETE with no body', async () => {
      mockNoContent();
      await repo().deleteWebhook(7);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/webhooks/7`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });

    it('testWebhook() sends POST with query params and a credentials body', async () => {
      mockOk({});
      await repo().testWebhook({ webhookId: 7, username: 'ci-bot', password: 'secret' });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/webhooks/test?webhookId=7`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ username: 'ci-bot', password: 'secret' }));
    });
  });

  describe('files()', () => {
    it('lists from the root with at param', async () => {
      mockOk({ values: ['README.md', 'src/index.ts'] });
      await repo().files(undefined, { at: 'refs/heads/main' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/files?at=refs%2Fheads%2Fmain`);
    });

    it('lists a subdirectory', async () => {
      mockOk({ values: ['index.ts'] });
      await repo().files('src');
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/files/src`);
    });
  });

  describe('compare endpoints', () => {
    it('compareChanges() sends GET with from/to params', async () => {
      mockOk({ values: [] });
      await repo().compareChanges({ from: 'feature/x', to: 'main' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/compare/changes?from=feature%2Fx&to=main`);
    });

    it('compareCommits() sends GET with from/to params', async () => {
      mockOk({ values: [] });
      await repo().compareCommits({ from: 'feature/x', to: 'main' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/compare/commits?from=feature%2Fx&to=main`);
    });

    it('compareDiff() diffs the whole comparison when path is omitted', async () => {
      mockOk({ diffs: [] });
      await repo().compareDiff({ from: 'feature/x', to: 'main' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/compare/diff?from=feature%2Fx&to=main`);
    });

    it('compareDiff() puts the file path in the URL', async () => {
      mockOk({ diffs: [] });
      await repo().compareDiff({ path: 'src/index.ts', from: 'feature/x', to: 'main' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/compare/diff/src/index.ts?from=feature%2Fx&to=main`);
    });
  });

  describe('labels', () => {
    it('labels() sends GET', async () => {
      mockOk({ values: [{ name: 'api' }] });
      await repo().labels();
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/labels`);
    });

    it('addLabel() sends POST wrapping the name', async () => {
      mockOk({ name: 'api' });
      await repo().addLabel('api');
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/labels`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ name: 'api' }));
    });

    it('removeLabel() sends DELETE to the label name', async () => {
      mockNoContent();
      await repo().removeLabel('api');
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/labels/api`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('markup files', () => {
    it('readme() sends GET with params', async () => {
      mockOk({ path: 'README.md' });
      await repo().readme({ at: 'main', hardwrap: true });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/readme?at=main&hardwrap=true`);
    });

    it('license() sends GET', async () => {
      mockOk({ path: 'LICENSE' });
      await repo().license();
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/license`);
    });

    it('contributing() sends GET', async () => {
      mockOk({ path: 'CONTRIBUTING.md' });
      await repo().contributing();
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/contributing`);
    });
  });

  describe('watch() / unwatch()', () => {
    it('watch() sends POST with no body', async () => {
      mockNoContent();
      await repo().watch();
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/watch`);
      expect(init.method).toBe('POST');
      expect(init.body).toBeUndefined();
    });

    it('unwatch() sends DELETE with no body', async () => {
      mockNoContent();
      await repo().unwatch();
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/watch`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('refChangeActivities()', () => {
    it('sends GET with the ref filter', async () => {
      mockOk({ values: [] });
      await repo().refChangeActivities({ ref: 'refs/heads/main' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/ref-change-activities?ref=refs%2Fheads%2Fmain`);
    });
  });

  describe('permissions', () => {
    it('users() sends GET with the filter', async () => {
      mockOk({ values: [] });
      await repo().users({ filter: 'jdoe' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/permissions/users?filter=jdoe`);
    });

    it('setUserPermission() sends PUT with query params', async () => {
      mockNoContent();
      await repo().setUserPermission('jdoe', 'REPO_WRITE');
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/permissions/users?name=jdoe&permission=REPO_WRITE`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBeUndefined();
    });

    it('removeUserPermission() sends DELETE with the name as query', async () => {
      mockNoContent();
      await repo().removeUserPermission('jdoe');
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/permissions/users?name=jdoe`);
      expect(init.method).toBe('DELETE');
    });

    it('setGroupPermission() sends PUT with query params', async () => {
      mockNoContent();
      await repo().setGroupPermission('developers', 'REPO_ADMIN');
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/permissions/groups?name=developers&permission=REPO_ADMIN`);
      expect(init.method).toBe('PUT');
    });

    it('removeGroupPermission() sends DELETE with the name as query', async () => {
      mockNoContent();
      await repo().removeGroupPermission('developers');
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/permissions/groups?name=developers`);
      expect(init.method).toBe('DELETE');
    });

    it('searchPermissions() sends GET with repeated permission params', async () => {
      mockOk({ values: [] });
      await repo().searchPermissions({ permission: ['REPO_READ', 'REPO_ADMIN'], type: 'USER' });
      const [url] = lastCall();

      expect(url).toBe(
        `${REPO_BASE}/permissions/search?permission=REPO_READ&permission=REPO_ADMIN&type=USER`,
      );
    });
  });

  describe('default reviewer conditions', () => {
    const DR_BASE = `${API_URL}/rest/default-reviewers/latest/projects/PROJ/repos/my-repo`;
    const payload = {
      sourceMatcher: { id: 'ANY_REF_MATCHER_ID', type: { id: 'ANY_REF' as const } },
      targetMatcher: { id: 'refs/heads/main', type: { id: 'BRANCH' as const } },
      reviewers: [{ id: 42 }],
      requiredApprovals: 1,
    };

    it('defaultReviewerConditions() sends GET against the default-reviewers API', async () => {
      mockOk([]);
      await repo().defaultReviewerConditions();
      const [url] = lastCall();

      expect(url).toBe(`${DR_BASE}/conditions`);
    });

    it('createDefaultReviewerCondition() sends POST with the payload', async () => {
      mockOk({ id: 3 });
      await repo().createDefaultReviewerCondition(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${DR_BASE}/condition`);
      expect(init.method).toBe('POST');
    });

    it('updateDefaultReviewerCondition() sends PUT to the condition id', async () => {
      mockOk({ id: 3 });
      await repo().updateDefaultReviewerCondition(3, payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${DR_BASE}/condition/3`);
      expect(init.method).toBe('PUT');
    });

    it('deleteDefaultReviewerCondition() sends DELETE', async () => {
      mockNoContent();
      await repo().deleteDefaultReviewerCondition(3);
      const [url, init] = lastCall();

      expect(url).toBe(`${DR_BASE}/condition/3`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('branch restrictions', () => {
    const BP_BASE = `${API_URL}/rest/branch-permissions/latest/projects/PROJ/repos/my-repo`;

    it('branchRestrictions() sends GET with filters', async () => {
      mockOk({ values: [] });
      await repo().branchRestrictions({ type: 'fast-forward-only' });
      const [url] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions?type=fast-forward-only`);
    });

    it('branchRestriction() sends GET to the restriction id', async () => {
      mockOk({ id: 5 });
      await repo().branchRestriction(5);
      const [url] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions/5`);
    });

    it('createBranchRestriction() sends POST with the payload', async () => {
      const payload = {
        type: 'read-only' as const,
        matcher: { id: 'refs/heads/main', type: { id: 'BRANCH' as const } },
      };

      mockOk({ id: 5 });
      await repo().createBranchRestriction(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('deleteBranchRestriction() sends DELETE', async () => {
      mockNoContent();
      await repo().deleteBranchRestriction(5);
      const [url, init] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions/5`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('required build conditions', () => {
    const RB_BASE = `${API_URL}/rest/required-builds/latest/projects/PROJ/repos/my-repo`;
    const payload = {
      buildParentKeys: ['build-1'],
      refMatcher: { id: 'refs/heads/main', type: { id: 'BRANCH' as const } },
    };

    it('requiredBuildConditions() sends GET against the required-builds API', async () => {
      mockOk({ values: [] });
      await repo().requiredBuildConditions({ limit: 5 });
      const [url] = lastCall();

      expect(url).toBe(`${RB_BASE}/conditions?limit=5`);
    });

    it('createRequiredBuildCondition() sends POST with the payload', async () => {
      mockOk({ id: 15, ...payload });
      await repo().createRequiredBuildCondition(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${RB_BASE}/condition`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('updateRequiredBuildCondition() sends PUT to the condition id', async () => {
      mockOk({ id: 15, ...payload });
      await repo().updateRequiredBuildCondition(15, payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${RB_BASE}/condition/15`);
      expect(init.method).toBe('PUT');
    });

    it('deleteRequiredBuildCondition() sends DELETE', async () => {
      mockNoContent();
      await repo().deleteRequiredBuildCondition(15);
      const [url, init] = lastCall();

      expect(url).toBe(`${RB_BASE}/condition/15`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('reviewer groups', () => {
    it('reviewerGroups() sends GET', async () => {
      mockOk({ values: [] });
      await repo().reviewerGroups();
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/reviewer-groups`);
    });

    it('reviewerGroup() sends GET to the group id', async () => {
      mockOk({ id: 2 });
      await repo().reviewerGroup(2);
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/reviewer-groups/2`);
    });

    it('reviewerGroupUsers() sends GET to the group users', async () => {
      mockOk([]);
      await repo().reviewerGroupUsers(2);
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/reviewer-groups/2/users`);
    });

    it('createReviewerGroup() sends POST with the payload', async () => {
      const payload = { name: 'backend' };

      mockOk({ id: 2, ...payload }, 201);
      await repo().createReviewerGroup(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/reviewer-groups`);
      expect(init.method).toBe('POST');
    });

    it('updateReviewerGroup() sends PUT to the group id', async () => {
      mockOk({ id: 2, name: 'backend' });
      await repo().updateReviewerGroup(2, { name: 'backend' });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/reviewer-groups/2`);
      expect(init.method).toBe('PUT');
    });

    it('deleteReviewerGroup() sends DELETE', async () => {
      mockNoContent();
      await repo().deleteReviewerGroup(2);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/reviewer-groups/2`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('auto-decline and auto-merge settings', () => {
    it('autoDeclineSettings() sends GET', async () => {
      mockOk({ enabled: true, inactivityWeeks: 4 });
      await repo().autoDeclineSettings();
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/auto-decline`);
    });

    it('updateAutoDeclineSettings() sends PUT with the payload', async () => {
      mockOk({ enabled: true, inactivityWeeks: 2 });
      await repo().updateAutoDeclineSettings({ enabled: true, inactivityWeeks: 2 });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/auto-decline`);
      expect(init.method).toBe('PUT');
    });

    it('deleteAutoDeclineSettings() sends DELETE', async () => {
      mockNoContent();
      await repo().deleteAutoDeclineSettings();
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/auto-decline`);
      expect(init.method).toBe('DELETE');
    });

    it('autoMergeSettings() sends GET', async () => {
      mockOk({ enabled: false });
      await repo().autoMergeSettings();
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/auto-merge`);
    });

    it('updateAutoMergeSettings() sends PUT with the payload', async () => {
      mockOk({ enabled: true });
      await repo().updateAutoMergeSettings({ enabled: true });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/auto-merge`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ enabled: true }));
    });

    it('deleteAutoMergeSettings() sends DELETE', async () => {
      mockNoContent();
      await repo().deleteAutoMergeSettings();
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/auto-merge`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('hooks', () => {
    const HOOK_KEY = 'com.example.hooks:my-hook';

    it('hooks() sends GET with the type filter', async () => {
      mockOk({ values: [] });
      await repo().hooks({ type: 'POST_RECEIVE' });
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/hooks?type=POST_RECEIVE`);
    });

    it('hook() sends GET to the hook key', async () => {
      mockOk({ enabled: false });
      await repo().hook(HOOK_KEY);
      const [url] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/hooks/${HOOK_KEY}`);
    });

    it('enableHook() sends PUT to /enabled', async () => {
      mockOk({ enabled: true });
      await repo().enableHook(HOOK_KEY);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/hooks/${HOOK_KEY}/enabled`);
      expect(init.method).toBe('PUT');
    });

    it('disableHook() sends DELETE to /enabled', async () => {
      mockOk({ enabled: false });
      await repo().disableHook(HOOK_KEY);
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/hooks/${HOOK_KEY}/enabled`);
      expect(init.method).toBe('DELETE');
    });

    it('hookSettings() / updateHookSettings() target /settings', async () => {
      mockOk({ maxSize: 10 });
      await repo().hookSettings(HOOK_KEY);
      expect(lastCall()[0]).toBe(`${REPO_BASE}/settings/hooks/${HOOK_KEY}/settings`);

      mockOk({ maxSize: 20 });
      await repo().updateHookSettings(HOOK_KEY, { maxSize: 20 });
      const [url, init] = lastCall();

      expect(url).toBe(`${REPO_BASE}/settings/hooks/${HOOK_KEY}/settings`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ maxSize: 20 }));
    });
  });

  describe('default tasks', () => {
    const DT_BASE = `${API_URL}/rest/default-tasks/latest/projects/PROJ/repos/my-repo`;

    it('defaultTasks() sends GET against the default-tasks API', async () => {
      mockOk({ values: [] });
      await repo().defaultTasks();
      const [url] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks`);
    });

    it('createDefaultTask() sends POST with the payload', async () => {
      mockOk({ id: 9 });
      await repo().createDefaultTask({ description: 'Update docs' });
      const [url, init] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks`);
      expect(init.method).toBe('POST');
    });

    it('updateDefaultTask() sends PUT to the task id', async () => {
      mockOk({ id: 9 });
      await repo().updateDefaultTask(9, { description: 'Update docs' });
      const [url, init] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks/9`);
      expect(init.method).toBe('PUT');
    });

    it('deleteDefaultTask() / deleteAllDefaultTasks() send DELETE', async () => {
      mockNoContent();
      await repo().deleteDefaultTask(9);
      expect(lastCall()[0]).toBe(`${DT_BASE}/tasks/9`);

      mockNoContent();
      await repo().deleteAllDefaultTasks();
      const [url, init] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('fork synchronization', () => {
    const SYNC_BASE = `${API_URL}/rest/sync/latest/projects/PROJ/repos/my-repo`;

    it('syncStatus() sends GET with the at param', async () => {
      mockOk({ available: true, enabled: true });
      await repo().syncStatus('refs/heads/main');
      const [url] = lastCall();

      expect(url).toBe(`${SYNC_BASE}?at=refs%2Fheads%2Fmain`);
    });

    it('syncStatus() omits the query when at is not given', async () => {
      mockOk({ available: true, enabled: false });
      await repo().syncStatus();
      const [url] = lastCall();

      expect(url).toBe(SYNC_BASE);
    });

    it('setSyncStatus() sends POST with the payload', async () => {
      mockOk({ available: true, enabled: true });
      await repo().setSyncStatus({ enabled: true });
      const [url, init] = lastCall();

      expect(url).toBe(SYNC_BASE);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ enabled: true }));
    });

    it('synchronize() sends POST with the sync request', async () => {
      const payload = { refId: 'refs/heads/main', action: 'MERGE' as const };

      mockNoContent();
      const result = await repo().synchronize(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${SYNC_BASE}/synchronize`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
      expect(result).toBeUndefined();
    });
  });
});
