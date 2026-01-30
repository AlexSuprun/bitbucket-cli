# Author


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**raw** | **string** | The raw author value from the repository. This may be the only value available if the author does not match a user in Bitbucket. | [optional] [default to undefined]
**user** | [**Account**](Account.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Author } from './api';

const instance: Author = {
    raw,
    user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
