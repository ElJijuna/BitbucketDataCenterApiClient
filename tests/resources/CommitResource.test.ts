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

  describe('getBuild() / addBuild() / deleteBuild()', () => {
    const mockBuild = {
      key: 'BUILD-1',
      state: 'SUCCESSFUL' as const,
      url: 'https://ci.example.com/build/1',
    };

    it('getBuild() calls GET .../builds with the key as a query param', async () => {
      mockOk(mockBuild);
      const result = await commit().getBuild('BUILD-1');
      const [url] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/builds?key=BUILD-1`);
      expect(result).toEqual(mockBuild);
    });

    it('addBuild() sends POST with the payload', async () => {
      mockNoContent();
      await commit().addBuild(mockBuild);
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/builds`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(mockBuild));
    });

    it('deleteBuild() sends DELETE with the key as a query param', async () => {
      mockNoContent();
      await commit().deleteBuild('BUILD-1');
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/builds?key=BUILD-1`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('getDeployment() / addDeployment() / deleteDeployment()', () => {
    const lookup = { deploymentSequenceNumber: 1, key: 'DEPLOY-1', environmentKey: 'prod' };
    const mockDeployment = {
      deploymentSequenceNumber: 1,
      description: 'Deploy to prod',
      displayName: 'Deploy #1',
      environment: { key: 'prod', displayName: 'Production' },
      key: 'DEPLOY-1',
      state: 'SUCCESSFUL',
      url: 'https://ci.example.com/deploy/1',
    };

    it('getDeployment() calls GET .../deployments with lookup params', async () => {
      mockOk(mockDeployment);
      const result = await commit().getDeployment(lookup);
      const [url] = lastCall();

      expect(url).toBe(
        `${COMMIT_BASE}/deployments?deploymentSequenceNumber=1&key=DEPLOY-1&environmentKey=prod`,
      );
      expect(result).toEqual(mockDeployment);
    });

    it('addDeployment() sends POST with the payload', async () => {
      mockOk(mockDeployment);
      const result = await commit().addDeployment(mockDeployment);
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/deployments`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(mockDeployment));
      expect(result).toEqual(mockDeployment);
    });

    it('deleteDeployment() sends DELETE with lookup params as query', async () => {
      mockNoContent();
      await commit().deleteDeployment(lookup);
      const [url, init] = lastCall();

      expect(url).toBe(
        `${COMMIT_BASE}/deployments?deploymentSequenceNumber=1&key=DEPLOY-1&environmentKey=prod`,
      );
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });
  });

  describe('insight reports', () => {
    const INSIGHTS_BASE = `${API_URL}/rest/insights/latest/projects/PROJ/repos/my-repo/commits/abc123`;
    const REPORT_KEY = 'com.example.coverage';
    const mockReport = { key: REPORT_KEY, title: 'Coverage', result: 'PASS' };

    it('insightReports() sends GET against the insights API with pagination', async () => {
      mockOk({ values: [mockReport] });
      await commit().insightReports({ limit: 10 });
      const [url] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports?limit=10`);
    });

    it('insightReport() sends GET to the report key', async () => {
      mockOk(mockReport);
      expect(await commit().insightReport(REPORT_KEY)).toEqual(mockReport);
      const [url] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}`);
    });

    it('setInsightReport() sends PUT with the payload', async () => {
      const payload = {
        title: 'Coverage',
        data: [{ title: 'Lines', type: 'PERCENTAGE' as const, value: 85 }],
        result: 'PASS' as const,
      };

      mockOk(mockReport);
      await commit().setInsightReport(REPORT_KEY, payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify(payload));
    });

    it('deleteInsightReport() sends DELETE with no body', async () => {
      mockNoContent();
      await commit().deleteInsightReport(REPORT_KEY);
      const [url, init] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });

    it('insightAnnotations() sends GET to the commit-level annotations with filters', async () => {
      mockOk({ annotations: [] });
      await commit().insightAnnotations({ severity: 'HIGH', type: 'BUG' });
      const [url] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/annotations?severity=HIGH&type=BUG`);
    });

    it('insightReportAnnotations() sends GET to the report annotations', async () => {
      mockOk({ annotations: [] });
      expect(await commit().insightReportAnnotations(REPORT_KEY)).toEqual({ annotations: [] });
      const [url] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}/annotations`);
    });

    it('addInsightAnnotations() sends POST wrapping the array in an annotations object', async () => {
      const annotations = [{ message: 'Bug here', severity: 'HIGH' as const, line: 4 }];

      mockNoContent();
      await commit().addInsightAnnotations(REPORT_KEY, annotations);
      const [url, init] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}/annotations`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ annotations }));
    });

    it('setInsightAnnotation() sends PUT to the external id', async () => {
      const annotation = { message: 'Bug here', severity: 'MEDIUM' as const };

      mockNoContent();
      await commit().setInsightAnnotation(REPORT_KEY, 'finding-1', annotation);
      const [url, init] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}/annotations/finding-1`);
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify(annotation));
    });

    it('deleteInsightAnnotations() sends DELETE with externalId as a query param', async () => {
      mockNoContent();
      await commit().deleteInsightAnnotations(REPORT_KEY, 'finding-1');
      const [url, init] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}/annotations?externalId=finding-1`);
      expect(init.method).toBe('DELETE');
      expect(init.body).toBeUndefined();
    });

    it('deleteInsightAnnotations() omits the query string to delete all annotations', async () => {
      mockNoContent();
      await commit().deleteInsightAnnotations(REPORT_KEY);
      const [url, init] = lastCall();

      expect(url).toBe(`${INSIGHTS_BASE}/reports/${REPORT_KEY}/annotations`);
      expect(init.method).toBe('DELETE');
    });
  });

  describe('comments() / addComment()', () => {
    it('comments() calls GET .../comments with pagination params', async () => {
      mockOk({ values: [] });
      await commit().comments({ limit: 50 });
      const [url] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/comments?limit=50`);
    });

    it('addComment() sends POST with the payload', async () => {
      const payload = { text: 'Nice fix' };

      mockOk({ id: 1, ...payload }, 201);
      const result = await commit().addComment(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${COMMIT_BASE}/comments`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
      expect(result).toEqual({ id: 1, ...payload });
    });
  });

  describe('buildStatuses() / addBuildStatus()', () => {
    it('buildStatuses() calls GET /rest/build-status/latest/commits/{id}', async () => {
      mockOk({ values: [] });
      await commit().buildStatuses({ limit: 10 });
      const [url] = lastCall();

      expect(url).toBe(`${API_URL}/rest/build-status/latest/commits/abc123?limit=10`);
    });

    it('addBuildStatus() sends POST with the payload', async () => {
      const payload = { state: 'SUCCESSFUL', key: 'CI', url: 'https://ci.example.com/1' } as const;

      mockNoContent();
      await commit().addBuildStatus(payload);
      const [url, init] = lastCall();

      expect(url).toBe(`${API_URL}/rest/build-status/latest/commits/abc123`);
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
    });
  });
});
