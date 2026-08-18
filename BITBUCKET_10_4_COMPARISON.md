# Bitbucket Data Center REST API 10.4 comparison

Compared on 2026-08-18 using Atlassian's official [10.3](https://developer.atlassian.com/server/bitbucket/rest/v1003/) and [10.4](https://developer.atlassian.com/server/bitbucket/rest/v1004/) REST API specifications, plus the official [API changelog](https://developer.atlassian.com/server/bitbucket/reference/api-changelog/).

## Executive summary

Bitbucket 10.4 is additive at the REST-contract level: no operation or schema was removed. The main OpenAPI document grows from 366 paths and 566 operations to 368 paths and 572 operations.

For this client, the v1.21 update is concentrated in pull request author changes, six settings operations, notification preferences, and one repository query. Existing 10.3 calls remain source-compatible; the updated pull request types now represent `creator` and the `CREATOR` participant role returned by 10.4.

| Metric | 10.3 | 10.4 | Delta |
| --- | ---: | ---: | ---: |
| Paths | 366 | 368 | +2 |
| Operations | 566 | 572 | +6 |
| Component schemas | 292 | 295 | +3 |

## Added operations

All six new operations configure whether pull request authors may be changed:

| Scope | Method | Path |
| --- | --- | --- |
| Project | `GET` | `/rest/api/latest/projects/{projectKey}/settings/change-author` |
| Project | `PUT` | `/rest/api/latest/projects/{projectKey}/settings/change-author` |
| Project | `DELETE` | `/rest/api/latest/projects/{projectKey}/settings/change-author` |
| Repository | `GET` | `/rest/api/latest/projects/{projectKey}/repos/{repositorySlug}/settings/change-author` |
| Repository | `PUT` | `/rest/api/latest/projects/{projectKey}/repos/{repositorySlug}/settings/change-author` |
| Repository | `DELETE` | `/rest/api/latest/projects/{projectKey}/repos/{repositorySlug}/settings/change-author` |

Project updates accept `enabled` and a `restrictionAction` of `CREATE`, `DELETE`, or `NONE`. Repository updates accept `enabled`. Both reads return the effective setting together with its restriction state and scope.

## Changed operations

### Related repositories

`GET /rest/api/latest/projects/{projectKey}/repos/{repositorySlug}/related` adds an optional `permission` query parameter with values `REPO_READ`, `REPO_WRITE`, or `REPO_ADMIN`, plus a `400` response for invalid permissions. v1.21 wraps the operation with pagination and the 10.4 permission parameter.

### Default reviewer condition update

`PUT /rest/default-reviewers/latest/projects/{projectKey}/repos/{repositorySlug}/condition/{id}` changed only in how nested matchers are expressed (`inline` versus `$ref`) in the generated OpenAPI. The effective fields are unchanged, so no client change is required.

## Changed pull request contract

The important schema changes are:

- Pull request responses add `creator`, preserving who originally created a pull request after its author changes.
- Participant roles add `CREATOR`.
- Pull request update requests may include `author`.
- The new settings schemas describe `enabled`, project restriction actions, effective restriction state, and scope.

The other changed component schemas propagate the updated pull request and participant shapes through comments, default tasks/reviewers, auto-merge results, and user reactions. They do not introduce separate client features.

## Release features outside the main OpenAPI diff

Atlassian's 10.4 announcement also highlights merged-pull-request reverts and finer email controls. They need different treatment:

- **Email notifications:** the API changelog adds optional `authorNotificationSubscriptions` and `watcherNotificationSubscriptions` fields to `GET` and `PUT /rest/notification/1.0/settings`. That API module is absent from both main OpenAPI documents, but the changelog is an official REST contract, so v1.21 exposes both operations with the documented subscription groups.
- **Revert merged pull requests:** neither main OpenAPI document adds a revert operation. The API changelog records a Java SPI method, `PluginMergeStrategy#isRevertible`, while the release announcement describes the product feature. This client should not invent a REST wrapper without a documented endpoint.

## Implemented v1.21 scope

1. Extended pull request types with `creator`, `CREATOR`, and writable `author` support.
2. Added typed project and repository change-author settings resources, covering all six operations.
3. Added related-repositories support with pagination and the 10.4 permission filter.
4. Added the two officially announced notification settings operations with typed subscription groups; other undocumented fields remain outside the public client contract.
5. Kept merged-PR revert out of scope unless Atlassian publishes a REST contract.

This is an additive minor release. It should not require a breaking change to existing public method signatures.

## Reproducing the OpenAPI comparison

Download the two official OpenAPI JSON documents and run:

```sh
npm run openapi:compare -- bitbucket-10.3-openapi.json bitbucket-10.4-openapi.json
```

The comparison script reports operation and component-schema additions, removals, and contract changes. Descriptions and summaries are intentionally ignored so wording-only changes do not appear as API changes.
