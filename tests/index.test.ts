import * as pkg from '../src';

describe('package entry point', () => {
  it('exposes the client, resources, and helpers', () => {
    expect(pkg.BitbucketClient).toBeDefined();
    expect(pkg.BitbucketApiError).toBeDefined();
    expect(pkg.Security).toBeDefined();
    expect(pkg.paginate).toBeDefined();
    expect(pkg.ProjectResource).toBeDefined();
    expect(pkg.RepositoryResource).toBeDefined();
    expect(pkg.PullRequestResource).toBeDefined();
    expect(pkg.CommitResource).toBeDefined();
    expect(pkg.UserResource).toBeDefined();
  });

  it('exposes the webhook parsing utilities', () => {
    expect(pkg.parseWebhookEvent).toBeDefined();
    expect(pkg.getWebhookEventKey).toBeDefined();
    expect(pkg.isWebhookEventKey).toBeDefined();
  });
});
