# PullrequestMergeParameters

The metadata that describes a pull request merge.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]
**message** | **string** | The commit message that will be used on the resulting commit. Note that the size of the message is limited to 128 KiB. | [optional] [default to undefined]
**close_source_branch** | **boolean** | Whether the source branch should be deleted. If this is not provided, we fallback to the value used when the pull request was created, which defaults to False | [optional] [default to undefined]
**merge_strategy** | **string** | The merge strategy that will be used to merge the pull request. | [optional] [default to MergeStrategyEnum_MergeCommit]

## Example

```typescript
import { PullrequestMergeParameters } from './api';

const instance: PullrequestMergeParameters = {
    type,
    message,
    close_source_branch,
    merge_strategy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
