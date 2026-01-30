# AppUser


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**account_id** | **string** | The user\&#39;s Atlassian account ID. | [optional] [default to undefined]
**account_status** | **string** | The status of the account. Currently the only possible value is \&quot;active\&quot;, but more values may be added in the future. | [optional] [default to undefined]
**kind** | **string** | The kind of App User. | [optional] [default to undefined]

## Example

```typescript
import { AppUser } from './api';

const instance: AppUser = {
    account_id,
    account_status,
    kind,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
