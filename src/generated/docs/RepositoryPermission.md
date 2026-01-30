# RepositoryPermission

A user\'s permission for a given repository.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]
**permission** | **string** |  | [optional] [default to undefined]
**user** | [**User**](User.md) |  | [optional] [default to undefined]
**repository** | [**Repository**](Repository.md) |  | [optional] [default to undefined]

## Example

```typescript
import { RepositoryPermission } from './api';

const instance: RepositoryPermission = {
    type,
    permission,
    user,
    repository,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
