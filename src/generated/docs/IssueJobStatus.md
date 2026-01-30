# IssueJobStatus

The status of an import or export job

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [optional] [default to undefined]
**status** | **string** | The status of the import/export job | [optional] [default to undefined]
**phase** | **string** | The phase of the import/export job | [optional] [default to undefined]
**total** | **number** | The total number of issues being imported/exported | [optional] [default to undefined]
**count** | **number** | The total number of issues already imported/exported | [optional] [default to undefined]
**pct** | **number** | The percentage of issues already imported/exported | [optional] [default to undefined]

## Example

```typescript
import { IssueJobStatus } from './api';

const instance: IssueJobStatus = {
    type,
    status,
    phase,
    total,
    count,
    pct,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
