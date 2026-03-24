---
name: Feature request
about: Suggest a new endpoint or capability
labels: enhancement
---

## What endpoint or feature do you need?

Describe the Bitbucket Data Center API endpoint or behavior you want added.
Include the HTTP method and path if applicable (e.g., `GET /rest/api/latest/projects/{key}/repos/{slug}/tags`).

## Proposed API

```typescript
// How you'd like to call it
const tags = await bb.project('PROJ').repo('my-repo').tags();
```

## Why is this useful?

Explain your use case.
