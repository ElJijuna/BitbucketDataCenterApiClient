# [1.12.0](https://github.com/ElJijuna/BitbucketDataCenterApiClient/compare/v1.11.0...v1.12.0) (2026-03-31)


### Features

* add buildStatuses() method to fetch the build statuses associated with commit, update BitbucketClient and type RequestFn with options params for override apiPath. ([6f09875](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/6f0987520416277a8aac196e8f71d65bc5e1230e))
* add comments() method to fetch comments on commit. ([94721ea](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/94721ea36591392280e33b1ee389eeca228d83b9))
* add comments() method to fetch comments on pull request. ([8f8cb77](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/8f8cb77820ccac7fb21adae2edd1aa2258e56cfe))
* add currentUser() method to fetch the authenticated user. ([420d852](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/420d852f4db90272face769fc8dcea877d8834e4))
* add defaultBranch() method to return default branch on repository. ([d073bad](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/d073bad2eba0429b9dc527653098f8b3d094001c))
* add diff() method to fetch diff on pull request. ([b7631c8](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/b7631c8bb4cb8e6af06907a13ac6560fd1219887))
* add groups() method to fetch the explicits permissions on this project. ([2453fe7](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/2453fe75c100589e517fa98f207d1bfe9af4012a))
* add reviewers() method to fetch the reviewers on pull request. ([121cd64](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/121cd6409d3749168685077b3a524eda9a9a5374))
* add settings() method to fetch settings for repository. ([07d2a60](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/07d2a605138a5851f0c64ec1e82f96c2f499236e))
* add settings() method to fetch user settings. ([5b64889](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/5b648894970c93a5f7f27b5dd8c1674f007f806b))
* add sshKeys() method to fetch SSH keys with user. ([35a2832](https://github.com/ElJijuna/BitbucketDataCenterApiClient/commit/35a28323663a0ba41c17e95e0df993824e5f8cdc))

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
