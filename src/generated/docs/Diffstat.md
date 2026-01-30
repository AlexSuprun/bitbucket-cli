# Diffstat

A diffstat object that includes a summary of changes made to a file between two commits.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**lines_added** | **number** |  | [optional] [default to undefined]
**lines_removed** | **number** |  | [optional] [default to undefined]
**old** | [**CommitFile**](CommitFile.md) |  | [optional] [default to undefined]
**_new** | [**CommitFile**](CommitFile.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Diffstat } from './api';

const instance: Diffstat = {
    type,
    status,
    lines_added,
    lines_removed,
    old,
    _new,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
