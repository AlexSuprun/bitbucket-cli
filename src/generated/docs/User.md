# User


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**links** | [**UserLinks**](UserLinks.md) |  | [optional] [default to undefined]
**account_id** | **string** | The user\&#39;s Atlassian account ID. | [optional] [default to undefined]
**account_status** | **string** | The status of the account. Currently the only possible value is \&quot;active\&quot;, but more values may be added in the future. | [optional] [default to undefined]
**has_2fa_enabled** | **boolean** |  | [optional] [default to undefined]
**nickname** | **string** | Account name defined by the owner. Should be used instead of the \&quot;username\&quot; field. Note that \&quot;nickname\&quot; cannot be used in place of \&quot;username\&quot; in URLs and queries, as \&quot;nickname\&quot; is not guaranteed to be unique. | [optional] [default to undefined]
**is_staff** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { User } from './api';

const instance: User = {
    links,
    account_id,
    account_status,
    has_2fa_enabled,
    nickname,
    is_staff,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
