# [1.21.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.20.0...v1.21.0) (2026-08-18)


### Features

* update CI and release workflows to verify source and documentation; enhance README and ROADMAP with endpoint details; improve typings and tests for access tokens and user settings ([e333197](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/e3331978cb4a68bc4ca3d70a6ac260926be74b27))
* update to support Bitbucket Data Center REST API v10.4; add change-author settings for pull requests, related repositories functionality, and email notification preferences; enhance documentation and tests ([1c592b9](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/1c592b9db459a77a7656589ebddd4f566fd651a6))

# [1.20.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.19.0...v1.20.0) (2026-07-16)


### Features

* add support for pull request suggestions, markup preview, groups retrieval, and code search; include tests for new functionalities ([790083f](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/790083fb4b761b31c9f12670abf4b96433eb8288))
* add support for SSH and GPG key management, including add, delete, and retrieval methods; implement access token management with create, update, and delete functionalities; include tests for new features ([bf36b3b](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/bf36b3b774f308df81377da370af93c76ae31f01))
* enhance API documentation and typings for project, repository, and user management; add support for build and deployment functionalities ([1540a2e](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/1540a2e55f7bdcbdfadd1d5afbf679564a50ed33))

# [1.19.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.18.0...v1.19.0) (2026-07-16)


### Features

* add Code Insights report and annotation management to CommitResource; include tests for new functionality ([55acaec](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/55acaec3207a106d22b8b186a5e9321bb74b796d))
* add comprehensive tests for repository resource operations ([f0c0ca9](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/f0c0ca99cff05fed24f9ee64612c8aea7b3638fa))
* add default tasks, hooks, permissions search, and reviewer groups to ProjectResource ([54892c1](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/54892c10b61c5aed419b3c33593cf70ed494380c))
* implement binary response support and add archive functionality to RepositoryResource; include tests for new method ([1648902](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/164890277de159f1c132be82e259adb6fba37dda))

# [1.18.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.17.0...v1.18.0) (2026-07-15)


### Features

* add CRUD operations for repositories, branches, and tags; implement corresponding types and tests ([799a3bb](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/799a3bb2185409c673a032ff9e0bcff62bd099a3))
* enhance CommitResource with new methods for diff stats, comment updates, and pull request retrieval; add tests for new functionalities ([6e5a419](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/6e5a419be759bc74cf841d01c6ecb0141a7f0bf0))
* implement modern builds and deployments API in CommitResource; add corresponding types and tests ([93370b8](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/93370b8e3fb1261fd61b14f4839cebd2a6d15381))
* implement project management API with update, delete, and permission management; add webhook operations and tests ([2a168d9](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/2a168d9d6d563c4fbd1c099b5779c27a7d3d39fe))

# [1.17.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.16.0...v1.17.0) (2026-07-14)


### Features

* add dashboard and inbox pull request methods with corresponding types and tests ([dfec509](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/dfec509d1b51e2420c57f0b560531710b3591e19))
* implement webhook event parsing with typed payloads and utility functions; add tests for parsing logic ([7c94ef2](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/7c94ef2671bd5d4856bcd05124a78ca462f54e2e))

# [1.15.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.14.0...v1.15.0) (2026-07-14)


### Features

* add repos() method to fetch repositories with optional filters and update related types ([2c791fe](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/2c791fe315ea1f5c9681b8424e8cb2eb7a4e93c6))
* update Bitbucket API interactions and improve user fetching ([dd6640a](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/dd6640a508236e3e17a791a2a6386ac2e55a7cf9))

# [1.14.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.13.1...v1.14.0) (2026-04-30)


### Features

* implement editFile() on RepositoryResource (closes [#2](https://github.com/ElJijuna/BitbucketDataCenterApiClient/issues/2)) ([6da4bce](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/6da4bce9e32e72f97c6c87be3dded1d12a3bb1fd))

# [1.13.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.12.0...v1.13.0) (2026-04-01)


### Features

* implement CommitResource roadmap. ([2cfd0c3](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/2cfd0c3c50b4508c9640ef93bb1af2caea876cbf))

# [1.11.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.10.0...v1.11.0) (2026-03-26)


### Features

* add .on('request', callback) method and listeners for subscribe in all events. ([b032452](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/b0324527356a734e9fc05aa3897cfadb1dd68faa))

# [1.10.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.9.0...v1.10.0) (2026-03-25)


### Features

* add method browe in repository. ([6f3b877](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/6f3b87776bb73c9ae6369f6d899d2f55bdb3a5c9))

# [1.9.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.8.0...v1.9.0) (2026-03-25)


### Features

* add search method to filter repos. ([0d0a0d4](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/0d0a0d4c2120a4ce1742b23612d3d1806946a6b6))

# [1.8.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.7.0...v1.8.0) (2026-03-25)


### Features

* add methos to return repos and raw file from user. ([8ad11c6](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/8ad11c642c7ac79626af1431538fb77455273638))
* add srcPath in commit diff. ([802ff84](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/802ff843f54c72fc5d9f7cbd6c2d2f1305a585f3))

# [1.7.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.6.0...v1.7.0) (2026-03-24)


### Features

* add commit methos and diff and changes per commit. ([7f81e89](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/7f81e89aea5f9353a884d4585ed098953093c61c))
* update .tagsByCommits to enable override apiPath. ([201cdaf](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/201cdaf0c113af0b417cd6d5e8884d5f9f871dff))

# [1.6.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.5.0...v1.6.0) (2026-03-24)


### Features

* add method to return tags with. commits. ([aa54cb3](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/aa54cb30a0f44e765eb8463db68b6739be41215b))

# [1.5.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.4.0...v1.5.0) (2026-03-24)


### Features

* add webhooks method to return webhooks list from project and repository. ([c7a9867](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/c7a9867022fd0254d8ce0437ad0335258f424505))

# [1.4.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.3.0...v1.4.0) (2026-03-24)


### Features

* add BitbucketApiError to control all errors. ([a3a04c9](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/a3a04c96c9d88cb331167c4f44283f80708bd91a))

# [1.3.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.2.1...v1.3.0) (2026-03-24)


### Features

* add mehtos to return tags in repository. ([0f047f1](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/0f047f1ea14ffb8648f37fa33143a7aaf13e6a28))

# [1.2.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.1.0...v1.2.0) (2026-03-24)


### Features

* add apiPath to customize or override in future implementations the path in some requests. ([396e583](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/396e5833c223e623280b9fd8b4c02dcac7f7abf6))
* add changes method to return changes of pull request. ([74f7725](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/74f7725de5ebfb18cfe0afaed85824ea908629db))
* add lastModifid method in repository to return list of modifications by commit. ([4512d9c](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/4512d9cb874bfcef79cc53ddb67dcfe94ff4d44a))
* add method and service to return branches from repository. ([f122f60](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/f122f60d80b2f3210eaedb14ceba31b00af5c099))
* add method to return build summaries from pull request. ([d052096](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/d05209696caa0732cb7ce2cce88b5aee142335cf))
* add method to return commits from pull request. ([4b954e2](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/4b954e2fa834b8dacf257862e11fedac88c65a7d))
* add method to return users from bitbucket and project scope. ([2205f4f](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/2205f4f6eb4e40b75e1fa6e4739ae7d4cd6adff9))
* add methos and service to return repository size. ([b337e67](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/b337e67ed645d0c7f8ae869ae8a9b411e70f99e7))
* add pull reuests tasks. ([362cc39](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/362cc39555d161c318135ff73d4d15c960a682e2))
* add raw method to return content file in repository. ([80bfb73](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/80bfb73285f9a9d2d91a7f6439bb2ef8f9c11555))
* add reports from pull request. ([6c3a009](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/6c3a0096f488f0dd19ad900b83050a8dca0cf5b3))
* add service to return issues. ([a1f2bf0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/a1f2bf0ca75a83fdeeeadb700d451dc131fc6998))

# [1.1.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.0.0...v1.1.0) (2026-03-24)


### Features

* add implementation to call activities from pull request. ([b7e955d](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/b7e955d49971c136660039de9a31d36fe26daa61))

# 1.0.0 (2026-03-24)


### Features

* add capacity to obtain commits and pull requests, add github actions to publish in NPM and GITHUB. ([c0fe6f3](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/c0fe6f35a5e4173940f94516dc4bf7e63a0e51a7))
* add implementation to wrap calls to bitbucket server in custom api library, add security to control autenticacion and bitbucket client to instantiate to use in others projects. ([4a1b307](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/4a1b30727c9be9bb2011b4879ce552f327876d7c))
* add params to paginate and filter with query params, add implementations to obtains pull requests and commits per repository. ([cf5e70e](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/cf5e70eefd6249281dd23109b838bf3da5647eee))
