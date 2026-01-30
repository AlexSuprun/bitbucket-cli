# CommitFile

A file object, representing a file at a commit in a repository

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]
**path** | **string** | The path in the repository | [optional] [default to undefined]
**commit** | [**Commit**](Commit.md) |  | [optional] [default to undefined]
**attributes** | **string** |  | [optional] [default to undefined]
**escaped_path** | **string** | The escaped version of the path as it appears in a diff. If the path does not require escaping this will be the same as path. | [optional] [default to undefined]

## Example

```typescript
import { CommitFile } from './api';

const instance: CommitFile = {
    type,
    path,
    commit,
    attributes,
    escaped_path,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
