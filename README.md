# bitbucket-datacenter-api-client

[![CI](https://github.com/ElJijuna/BitbucketDataCenterApiClient/actions/workflows/ci.yml/badge.svg)](https://github.com/ElJijuna/BitbucketDataCenterApiClient/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/bitbucket-datacenter-api-client)](https://www.npmjs.com/package/bitbucket-datacenter-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript client for the [Bitbucket Data Center REST API](https://developer.atlassian.com/server/bitbucket/rest/v819/intro/).
Works in **Node.js** and the **browser** (isomorphic). Fully typed, zero runtime dependencies.

---

## Installation

```bash
npm install bitbucket-datacenter-api-client
```

---

## Quick start

```typescript
import { BitbucketClient } from 'bitbucket-datacenter-api-client';

const bb = new BitbucketClient({
  apiUrl:  'https://bitbucket.example.com',
  apiPath: 'rest/api/latest',
  user:    'your-username',
  token:   'your-personal-access-token',
});
```

---

## API reference

### Projects

```typescript
// List all accessible projects
const projects = await bb.projects();
const projects = await bb.projects({ limit: 50, name: 'platform' });

// Get a single project
const project = await bb.project('PROJ');
```

### Repositories

```typescript
// List repositories in a project
const repos = await bb.project('PROJ').repos();
const repos = await bb.project('PROJ').repos({ limit: 25, name: 'api' });

// Get a single repository
const repo = await bb.project('PROJ').repo('my-repo');

// Repository size (bytes)
const size = await bb.project('PROJ').repo('my-repo').size();
// { repository: 1048576, attachments: 0 }

// Files last modified (with the commit that touched each)
const entries = await bb.project('PROJ').repo('my-repo').lastModified();
const entries = await bb.project('PROJ').repo('my-repo').lastModified({ at: 'main' });

// Raw file content
const content = await bb.project('PROJ').repo('my-repo').raw('src/index.ts');
const content = await bb.project('PROJ').repo('my-repo').raw('src/index.ts', { at: 'feature/my-branch' });
```

### Branches

```typescript
const branches = await bb.project('PROJ').repo('my-repo').branches();
const branches = await bb.project('PROJ').repo('my-repo').branches({
  filterText: 'feature',
  orderBy:    'MODIFICATION',
  details:    true,
});
```

### Commits

```typescript
// Repository commits
const commits = await bb.project('PROJ').repo('my-repo').commits();
const commits = await bb.project('PROJ').repo('my-repo').commits({
  limit:        25,
  until:        'main',
  path:         'src/index.ts',
  followRenames: true,
});
```

### Pull requests

```typescript
// List pull requests
const prs = await bb.project('PROJ').repo('my-repo').pullRequests();
const prs = await bb.project('PROJ').repo('my-repo').pullRequests({
  state:  'OPEN',
  order:  'NEWEST',
  limit:  10,
});

// Get a single pull request
const pr = await bb.project('PROJ').repo('my-repo').pullRequest(42);

// Pull request sub-resources
const activities = await bb.project('PROJ').repo('my-repo').pullRequest(42).activities();
const tasks      = await bb.project('PROJ').repo('my-repo').pullRequest(42).tasks();
const commits    = await bb.project('PROJ').repo('my-repo').pullRequest(42).commits();
const changes    = await bb.project('PROJ').repo('my-repo').pullRequest(42).changes();
const reports    = await bb.project('PROJ').repo('my-repo').pullRequest(42).reports();
const summaries  = await bb.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
const issues     = await bb.project('PROJ').repo('my-repo').pullRequest(42).issues();
```

### Users

```typescript
// List all users
const users = await bb.users();
const users = await bb.users({ filter: 'john', limit: 20 });

// Get a single user
const user = await bb.user('pilmee');

// Users with access to a project
const members = await bb.project('PROJ').users();
const members = await bb.project('PROJ').users({ permission: 'PROJECT_WRITE' });
```

---

## Chainable resource pattern

Every resource that maps to a single entity (project, repo, pull request, user) implements `PromiseLike`, so you can **await it directly** to fetch the entity, or **chain methods** to access sub-resources — without an extra `.get()` call:

```typescript
// Await directly → fetches the project
const project = await bb.project('PROJ');

// Chain → fetches the repositories list
const repos = await bb.project('PROJ').repos({ limit: 10 });

// Deep chain → fetches PR activities
const activities = await bb.project('PROJ').repo('my-repo').pullRequest(42).activities();
```

---

## Authentication

The client uses **HTTP Basic Authentication** with a Personal Access Token (PAT). Generate one in Bitbucket under **Profile → Manage account → Personal access tokens**.

```typescript
const bb = new BitbucketClient({
  apiUrl:  'https://bitbucket.example.com',
  apiPath: 'rest/api/latest',
  user:    'your-username',
  token:   'your-personal-access-token',
});
```

---

## TypeScript types

All domain types are exported and fully typed:

```typescript
import type {
  BitbucketProject,
  BitbucketRepository,
  BitbucketBranch,
  BitbucketCommit,
  BitbucketPullRequest,
  BitbucketPullRequestActivity,
  BitbucketPullRequestTask,
  BitbucketChange,
  BitbucketReport,
  BitbucketBuildSummaries,
  BitbucketIssue,
  BitbucketUser,
  BitbucketRepositorySize,
  BitbucketLastModifiedEntry,
} from 'bitbucket-datacenter-api-client';
```

---

## Documentation

Full API documentation is published at:
**[https://eljijuna.github.io/BitbucketDataCenterApiClient](https://eljijuna.github.io/BitbucketDataCenterApiClient)**

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

---

## License

[MIT](LICENSE)
