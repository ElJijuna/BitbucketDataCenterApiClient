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
});
