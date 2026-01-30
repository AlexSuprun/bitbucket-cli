# UsersApi

All URIs are relative to *https://api.bitbucket.org/2.0*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userEmailsEmailGet**](#useremailsemailget) | **GET** /user/emails/{email} | Get an email address for current user|
|[**userEmailsGet**](#useremailsget) | **GET** /user/emails | List email addresses for current user|
|[**userGet**](#userget) | **GET** /user | Get current user|
|[**usersSelectedUserGet**](#usersselecteduserget) | **GET** /users/{selected_user} | Get a user|

# **userEmailsEmailGet**
> ModelError userEmailsEmailGet()

Returns details about a specific one of the authenticated user\'s email addresses.  Details describe whether the address has been confirmed by the user and whether it is the user\'s primary address or not.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let email: string; //Email address of the user. (default to undefined)

const { status, data } = await apiInstance.userEmailsEmailGet(
    email
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **email** | [**string**] | Email address of the user. | defaults to undefined|


### Return type

**ModelError**

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** | Unexpected error. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userEmailsGet**
> ModelError userEmailsGet()

Returns all the authenticated user\'s email addresses. Both confirmed and unconfirmed.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.userEmailsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ModelError**

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** | Unexpected error. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userGet**
> Account userGet()

Returns the currently logged in user.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.userGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Account**

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | The current user. |  -  |
|**401** | When the request wasn\&#39;t authenticated. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **usersSelectedUserGet**
> Account usersSelectedUserGet()

Gets the public information associated with a user account.  If the user\'s profile is private, `location`, `website` and `created_on` elements are omitted.  Note that the user object returned by this operation is changing significantly, due to privacy changes. See the [announcement](https://developer.atlassian.com/cloud/bitbucket/bitbucket-api-changes-gdpr/#changes-to-bitbucket-user-objects) for details.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let selectedUser: string; //This can either be an Atlassian Account ID OR the UUID of the account, surrounded by curly-braces, for example: `{account UUID}`.  (default to undefined)

const { status, data } = await apiInstance.usersSelectedUserGet(
    selectedUser
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **selectedUser** | [**string**] | This can either be an Atlassian Account ID OR the UUID of the account, surrounded by curly-braces, for example: &#x60;{account UUID}&#x60;.  | defaults to undefined|


### Return type

**Account**

### Authorization

[api_key](../README.md#api_key), [oauth2](../README.md#oauth2), [basic](../README.md#basic)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | The user object |  -  |
|**404** | If no user exists for the specified UUID, or if the specified account is a team account, not a personal account. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

