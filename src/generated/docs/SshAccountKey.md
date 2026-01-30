# SshAccountKey


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**owner** | [**Account**](Account.md) |  | [optional] [default to undefined]
**expires_on** | **string** |  | [optional] [default to undefined]
**fingerprint** | **string** | The SSH key fingerprint in SHA-256 format. | [optional] [default to undefined]

## Example

```typescript
import { SshAccountKey } from './api';

const instance: SshAccountKey = {
    owner,
    expires_on,
    fingerprint,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
