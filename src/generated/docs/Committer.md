# Committer


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**raw** | **string** | The raw committer value from the repository. This may be the only value available if the committer does not match a user in Bitbucket. | [optional] [default to undefined]
**user** | [**Account**](Account.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Committer } from './api';

const instance: Committer = {
    raw,
    user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
