# DownloadsApi

All URIs are relative to *https://api.bitbucket.org/2.0*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**repositoriesWorkspaceRepoSlugDownloadsFilenameDelete**](#repositoriesworkspacereposlugdownloadsfilenamedelete) | **DELETE** /repositories/{workspace}/{repo_slug}/downloads/{filename} | Delete a download artifact|
|[**repositoriesWorkspaceRepoSlugDownloadsFilenameGet**](#repositoriesworkspacereposlugdownloadsfilenameget) | **GET** /repositories/{workspace}/{repo_slug}/downloads/{filename} | Get a download artifact link|
|[**repositoriesWorkspaceRepoSlugDownloadsGet**](#repositoriesworkspacereposlugdownloadsget) | **GET** /repositories/{workspace}/{repo_slug}/downloads | List download artifacts|
|[**repositoriesWorkspaceRepoSlugDownloadsPost**](#repositoriesworkspacereposlugdownloadspost) | **POST** /repositories/{workspace}/{repo_slug}/downloads | Upload a download artifact|

# **repositoriesWorkspaceRepoSlugDownloadsFilenameDelete**
> repositoriesWorkspaceRepoSlugDownloadsFilenameDelete()

Deletes the specified download artifact from the repository.

### Example

```typescript
import {
    DownloadsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DownloadsApi(configuration);

let filename: string; //Name of the file. (default to undefined)
let repoSlug: string; //This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: `{repository UUID}`.  (default to undefined)
let workspace: string; //This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: `{workspace UUID}`.  (default to undefined)

const { status, data } = await apiInstance.repositoriesWorkspaceRepoSlugDownloadsFilenameDelete(
    filename,
    repoSlug,
    workspace
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **filename** | [**string**] | Name of the file. | defaults to undefined|
| **repoSlug** | [**string**] | This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: &#x60;{repository UUID}&#x60;.  | defaults to undefined|
| **workspace** | [**string**] | This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: &#x60;{workspace UUID}&#x60;.  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | The specified download artifact was deleted. |  -  |
|**403** | User is not authorized to write to the repository. |  -  |
|**404** | The specified download does not exist. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **repositoriesWorkspaceRepoSlugDownloadsFilenameGet**
> repositoriesWorkspaceRepoSlugDownloadsFilenameGet()

Return a redirect to the contents of a download artifact.  This endpoint returns the actual file contents and not the artifact\'s metadata.      $ curl -s -L https://api.bitbucket.org/2.0/repositories/evzijst/git-tests/downloads/hello.txt     Hello World

### Example

```typescript
import {
    DownloadsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DownloadsApi(configuration);

let filename: string; //Name of the file. (default to undefined)
let repoSlug: string; //This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: `{repository UUID}`.  (default to undefined)
let workspace: string; //This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: `{workspace UUID}`.  (default to undefined)

const { status, data } = await apiInstance.repositoriesWorkspaceRepoSlugDownloadsFilenameGet(
    filename,
    repoSlug,
    workspace
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **filename** | [**string**] | Name of the file. | defaults to undefined|
| **repoSlug** | [**string**] | This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: &#x60;{repository UUID}&#x60;.  | defaults to undefined|
| **workspace** | [**string**] | This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: &#x60;{workspace UUID}&#x60;.  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**302** | Redirects to the url of the specified download artifact. |  -  |
|**403** | User is not authorized to read from the repository. |  -  |
|**404** | The specified download artifact does not exist. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **repositoriesWorkspaceRepoSlugDownloadsGet**
> repositoriesWorkspaceRepoSlugDownloadsGet()

Returns a list of download links associated with the repository.

### Example

```typescript
import {
    DownloadsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DownloadsApi(configuration);

let repoSlug: string; //This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: `{repository UUID}`.  (default to undefined)
let workspace: string; //This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: `{workspace UUID}`.  (default to undefined)

const { status, data } = await apiInstance.repositoriesWorkspaceRepoSlugDownloadsGet(
    repoSlug,
    workspace
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **repoSlug** | [**string**] | This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: &#x60;{repository UUID}&#x60;.  | defaults to undefined|
| **workspace** | [**string**] | This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: &#x60;{workspace UUID}&#x60;.  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns a paginated list of the downloads associated with the repository. |  -  |
|**403** | User is not authorized to read from the repository. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **repositoriesWorkspaceRepoSlugDownloadsPost**
> repositoriesWorkspaceRepoSlugDownloadsPost()

Upload new download artifacts.  To upload files, perform a `multipart/form-data` POST containing one or more `files` fields:      $ echo Hello World > hello.txt     $ curl -s -u evzijst -X POST https://api.bitbucket.org/2.0/repositories/evzijst/git-tests/downloads -F files=@hello.txt  When a file is uploaded with the same name as an existing artifact, then the existing file will be replaced.

### Example

```typescript
import {
    DownloadsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DownloadsApi(configuration);

let repoSlug: string; //This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: `{repository UUID}`.  (default to undefined)
let workspace: string; //This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: `{workspace UUID}`.  (default to undefined)

const { status, data } = await apiInstance.repositoriesWorkspaceRepoSlugDownloadsPost(
    repoSlug,
    workspace
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **repoSlug** | [**string**] | This can either be the repository slug or the UUID of the repository, surrounded by curly-braces, for example: &#x60;{repository UUID}&#x60;.  | defaults to undefined|
| **workspace** | [**string**] | This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces, for example: &#x60;{workspace UUID}&#x60;.  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | The artifact was uploaded sucessfully. |  -  |
|**400** | Bad Request. |  -  |
|**403** | User is not authorized to write to the repository. |  -  |
|**406** | Unsupported Content-Type. Use multiplart/form-data. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

