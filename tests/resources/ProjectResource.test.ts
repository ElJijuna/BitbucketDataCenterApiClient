import { BitbucketClient } from '../../src/BitbucketClient';
import type { BitbucketProject } from '../../src/domain/Project';

const API_URL = 'https://bitbucket.example.com';
const API_PATH = 'rest/api/latest';
const BASE = `${API_URL}/${API_PATH}`;
const PROJECT_BASE = `${BASE}/projects/PROJ`;
const mockProject: BitbucketProject = {
  key: 'PROJ',
  id: 1,
  name: 'My Project',
  public: false,
  type: 'NORMAL',
  links: {},
};
const mockWebhook = {
  id: 7,
  name: 'CI hook',
  url: 'https://ci.example.com/hook',
  events: ['repo:refs_changed'],
  active: true,
  scopeType: 'project' as const,
  sslVerificationRequired: true,
};

describe('ProjectResource write operations', () => {
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

  function project() {
    return client.project('PROJ');
  }

  function lastCall(): [string, RequestInit] {
    const { calls } = fetchMock.mock;

    return calls[calls.length - 1] as [string, RequestInit];
  }

  describe('update()', () => {
    it('sends PUT with the payload', async () => {
      mockOk(mockProject);
      await project().update({ avatarUrl: 'https://example.com/avatar.png' });
      const [url, init] = lastCall();

      expect(url).toBe(PROJECT_BASE);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ avatarUrl: 'https://example.com/avatar.png' }));
    });

    it('returns the updated project', async () => {
      mockOk(mockProject);
      expect(await project().update({ key: 'PROJ' })).toEqual(mockProject);
    });
  });

  describe('delete()', () => {
    it('sends DELETE with no body', async () => {
      mockNoContent();
      await project().delete();
      const [url, init] = lastCall();

      expect(url).toBe(PROJECT_BASE);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('setUserPermission() / removeUserPermission()', () => {
    it('setUserPermission() sends PUT with name and permission as query params', async () => {
      mockNoContent();
      await project().setUserPermission('jdoe', 'PROJECT_WRITE');
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/permissions/users?name=jdoe&permission=PROJECT_WRITE`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBeUndefined();
    });

    it('removeUserPermission() sends DELETE with name as a query param', async () => {
      mockNoContent();
      await project().removeUserPermission('jdoe');
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/permissions/users?name=jdoe`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('setGroupPermission() / removeGroupPermission()', () => {
    it('setGroupPermission() sends PUT with name and permission as query params', async () => {
      mockNoContent();
      await project().setGroupPermission('developers', 'PROJECT_ADMIN');
      const [url, init] = lastCall();

      expect(url).toBe(
        `${PROJECT_BASE}/permissions/groups?name=developers&permission=PROJECT_ADMIN`,
      );
      expect(init.method).toBe('PUT');
      expect(init.body).toBeUndefined();
    });

    it('removeGroupPermission() sends DELETE with name as a query param', async () => {
      mockNoContent();
      await project().removeGroupPermission('developers');
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/permissions/groups?name=developers`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('createWebhook() / updateWebhook() / deleteWebhook()', () => {
    const payload = {
      name: 'CI hook',
      events: ['repo:refs_changed'],
      url: 'https://ci.example.com/hook',
    };

    it('createWebhook() sends POST with the payload', async () => {
      mockOk(mockWebhook);
      const result = await project().createWebhook(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/webhooks`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
      expect(result).toEqual(mockWebhook);
    });

    it('updateWebhook() sends PUT with the payload', async () => {
      mockOk(mockWebhook);
      await project().updateWebhook(7, payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/webhooks/7`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('deleteWebhook() sends DELETE with no body', async () => {
      mockNoContent();
      await project().deleteWebhook(7);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/webhooks/7`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('testWebhook()', () => {
    it('sends POST with query params for webhookId/url/sslVerificationRequired and a credentials body', async () => {
      mockOk({});
      await project().testWebhook({
        url: 'https://ci.example.com/hook',
        sslVerificationRequired: false,
        username: 'ci-bot',
        password: 'secret',
      });
      const [url, init] = lastCall();

      expect(url).toBe(
        `${PROJECT_BASE}/webhooks/test?url=https%3A%2F%2Fci.example.com%2Fhook&sslVerificationRequired=false`,
      );
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ username: 'ci-bot', password: 'secret' }));
    });

    it('omits the query string when no query params are given', async () => {
      mockOk({});
      await project().testWebhook({});
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/webhooks/test`);
    });
  });

  describe('createRepo()', () => {
    it('sends POST with the payload', async () => {
      const payload = { name: 'my-repo', scmId: 'git', defaultBranch: 'main' };

      mockOk({ slug: 'my-repo', name: 'my-repo' }, 201);
      const result = await project().createRepo(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/repos`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
      expect(result).toEqual({ slug: 'my-repo', name: 'my-repo' });
    });
  });

  describe('searchPermissions()', () => {
    it('sends GET with filterText, type, and repeated permission params', async () => {
      mockOk({ values: [] });
      await project().searchPermissions({
        permission: ['PROJECT_READ', 'PROJECT_ADMIN'],
        filterText: 'dev',
        type: 'GROUP',
      });
      const [url] = lastCall();

      expect(url).toBe(
        `${PROJECT_BASE}/permissions/search?permission=PROJECT_READ&permission=PROJECT_ADMIN&filterText=dev&type=GROUP`,
      );
    });

    it('accepts a single permission string and no other filters', async () => {
      mockOk({ values: [] });
      await project().searchPermissions({ permission: 'PROJECT_WRITE' });
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/permissions/search?permission=PROJECT_WRITE`);
    });

    it('omits the query string when called without params', async () => {
      mockOk({ values: [] });
      await project().searchPermissions();
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/permissions/search`);
    });
  });

  describe('default reviewer conditions', () => {
    const DR_BASE = `${API_URL}/rest/default-reviewers/latest/projects/PROJ`;
    const conditionPayload = {
      sourceMatcher: { id: 'ANY_REF_MATCHER_ID', type: { id: 'ANY_REF' as const } },
      targetMatcher: { id: 'refs/heads/main', type: { id: 'BRANCH' as const } },
      reviewers: [{ id: 42 }],
      requiredApprovals: 1,
    };

    it('defaultReviewerConditions() sends GET against the default-reviewers API', async () => {
      mockOk([]);
      await project().defaultReviewerConditions();
      const [url] = lastCall();

      expect(url).toBe(`${DR_BASE}/conditions`);
    });

    it('createDefaultReviewerCondition() sends POST with the payload', async () => {
      mockOk({ id: 3 });
      await project().createDefaultReviewerCondition(conditionPayload);
      const [url, init] = lastCall();

      expect(url).toBe(`${DR_BASE}/condition`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(conditionPayload));
    });

    it('updateDefaultReviewerCondition() sends PUT to the condition id', async () => {
      mockOk({ id: 3 });
      await project().updateDefaultReviewerCondition(3, conditionPayload);
      const [url, init] = lastCall();

      expect(url).toBe(`${DR_BASE}/condition/3`);
      expect(init.method).toBe('PUT');
    });

    it('deleteDefaultReviewerCondition() sends DELETE with no body', async () => {
      mockNoContent();
      await project().deleteDefaultReviewerCondition(3);
      const [url, init] = lastCall();

      expect(url).toBe(`${DR_BASE}/condition/3`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('branch restrictions', () => {
    const BP_BASE = `${API_URL}/rest/branch-permissions/latest/projects/PROJ`;

    it('branchRestrictions() sends GET with filters against the branch-permissions API', async () => {
      mockOk({ values: [] });
      await project().branchRestrictions({ type: 'read-only', matcherType: 'BRANCH' });
      const [url] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions?type=read-only&matcherType=BRANCH`);
    });

    it('branchRestriction() sends GET to the restriction id', async () => {
      mockOk({ id: 5 });
      expect(await project().branchRestriction(5)).toEqual({ id: 5 });
      const [url] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions/5`);
    });

    it('createBranchRestriction() sends POST with the payload', async () => {
      const payload = {
        type: 'pull-request-only' as const,
        matcher: { id: 'refs/heads/main', type: { id: 'BRANCH' as const } },
        userSlugs: ['jdoe'],
      };

      mockOk({ id: 5 });
      await project().createBranchRestriction(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('deleteBranchRestriction() sends DELETE with no body', async () => {
      mockNoContent();
      await project().deleteBranchRestriction(5);
      const [url, init] = lastCall();

      expect(url).toBe(`${BP_BASE}/restrictions/5`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('reviewer groups', () => {
    const payload = { name: 'backend', users: [{ name: 'jdoe' }] };

    it('reviewerGroups() sends GET with pagination params', async () => {
      mockOk({ values: [] });
      await project().reviewerGroups({ limit: 10 });
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/reviewer-groups?limit=10`);
    });

    it('reviewerGroup() sends GET to the group id', async () => {
      mockOk({ id: 2, name: 'backend' });
      await project().reviewerGroup(2);
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/reviewer-groups/2`);
    });

    it('createReviewerGroup() sends POST with the payload', async () => {
      mockOk({ id: 2, ...payload }, 201);
      await project().createReviewerGroup(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/reviewer-groups`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('updateReviewerGroup() sends PUT to the group id', async () => {
      mockOk({ id: 2, ...payload });
      await project().updateReviewerGroup(2, payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/reviewer-groups/2`);
      expect(init.method).toBe('PUT');
    });

    it('deleteReviewerGroup() sends DELETE with no body', async () => {
      mockNoContent();
      await project().deleteReviewerGroup(2);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/reviewer-groups/2`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('auto-decline settings', () => {
    it('autoDeclineSettings() sends GET', async () => {
      mockOk({ enabled: true, inactivityWeeks: 4 });
      expect(await project().autoDeclineSettings()).toEqual({ enabled: true, inactivityWeeks: 4 });
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/auto-decline`);
    });

    it('updateAutoDeclineSettings() sends PUT with the payload', async () => {
      mockOk({ enabled: true, inactivityWeeks: 8 });
      await project().updateAutoDeclineSettings({ enabled: true, inactivityWeeks: 8 });
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/auto-decline`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ enabled: true, inactivityWeeks: 8 }));
    });

    it('deleteAutoDeclineSettings() sends DELETE with no body', async () => {
      mockNoContent();
      await project().deleteAutoDeclineSettings();
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/auto-decline`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('auto-merge settings', () => {
    it('autoMergeSettings() sends GET', async () => {
      mockOk({ enabled: false, restrictionState: 'NONE' });
      await project().autoMergeSettings();
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/auto-merge`);
    });

    it('updateAutoMergeSettings() sends PUT with the payload', async () => {
      mockOk({ enabled: true, restrictionState: 'NONE' });
      await project().updateAutoMergeSettings({ enabled: true, restrictionAction: 'CREATE' });
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/auto-merge`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ enabled: true, restrictionAction: 'CREATE' }));
    });

    it('deleteAutoMergeSettings() sends DELETE with no body', async () => {
      mockNoContent();
      await project().deleteAutoMergeSettings();
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/auto-merge`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('hooks', () => {
    const HOOK_KEY = 'com.example.hooks:my-hook';
    const mockHook = {
      details: { key: HOOK_KEY, name: 'My hook', type: 'PRE_RECEIVE' },
      enabled: false,
    };

    it('hooks() sends GET with the type filter', async () => {
      mockOk({ values: [] });
      await project().hooks({ type: 'PRE_RECEIVE' });
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/hooks?type=PRE_RECEIVE`);
    });

    it('hook() sends GET to the hook key', async () => {
      mockOk(mockHook);
      expect(await project().hook(HOOK_KEY)).toEqual(mockHook);
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/hooks/${HOOK_KEY}`);
    });

    it('enableHook() sends PUT to /enabled with no body', async () => {
      mockOk({ ...mockHook, enabled: true });
      await project().enableHook(HOOK_KEY);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/hooks/${HOOK_KEY}/enabled`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBeUndefined();
    });

    it('disableHook() sends DELETE to /enabled with no body', async () => {
      mockOk(mockHook);
      await project().disableHook(HOOK_KEY);
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/hooks/${HOOK_KEY}/enabled`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });

    it('hookSettings() sends GET to /settings', async () => {
      mockOk({ maxSize: 10 });
      expect(await project().hookSettings(HOOK_KEY)).toEqual({ maxSize: 10 });
      const [url] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/hooks/${HOOK_KEY}/settings`);
    });

    it('updateHookSettings() sends PUT with the settings object', async () => {
      mockOk({ maxSize: 20 });
      await project().updateHookSettings(HOOK_KEY, { maxSize: 20 });
      const [url, init] = lastCall();

      expect(url).toBe(`${PROJECT_BASE}/settings/hooks/${HOOK_KEY}/settings`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ maxSize: 20 }));
    });
  });

  describe('default tasks', () => {
    const DT_BASE = `${API_URL}/rest/default-tasks/latest/projects/PROJ`;
    const payload = { description: 'Update the changelog' };

    it('defaultTasks() sends GET with params against the default-tasks API', async () => {
      mockOk({ values: [] });
      await project().defaultTasks({ markup: 'true' });
      const [url] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks?markup=true`);
    });

    it('createDefaultTask() sends POST with the payload', async () => {
      mockOk({ id: 9, ...payload });
      await project().createDefaultTask(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('updateDefaultTask() sends PUT to the task id', async () => {
      mockOk({ id: 9, ...payload });
      await project().updateDefaultTask(9, payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks/9`);
      expect(init.method).toBe('PUT');
    });

    it('deleteDefaultTask() sends DELETE to the task id with no body', async () => {
      mockNoContent();
      await project().deleteDefaultTask(9);
      const [url, init] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks/9`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });

    it('deleteAllDefaultTasks() sends DELETE to the collection with no body', async () => {
      mockNoContent();
      await project().deleteAllDefaultTasks();
      const [url, init] = lastCall();

      expect(url).toBe(`${DT_BASE}/tasks`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });
});
