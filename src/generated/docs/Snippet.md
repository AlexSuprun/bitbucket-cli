# Snippet


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**scm** | **string** | The DVCS used to store the snippet. | [optional] [default to undefined]
**created_on** | **string** |  | [optional] [default to undefined]
**updated_on** | **string** |  | [optional] [default to undefined]
**owner** | [**Account**](Account.md) |  | [optional] [default to undefined]
**creator** | [**Account**](Account.md) |  | [optional] [default to undefined]
**is_private** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { Snippet } from './api';

const instance: Snippet = {
    id,
    title,
    scm,
    created_on,
    updated_on,
    owner,
    creator,
    is_private,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
