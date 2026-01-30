# PipelineRefTarget


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ref_type** | **string** | The type of reference (branch/tag). | [optional] [default to undefined]
**ref_name** | **string** | The name of the reference. | [optional] [default to undefined]
**commit** | [**Commit**](Commit.md) |  | [optional] [default to undefined]
**selector** | [**PipelineSelector**](PipelineSelector.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PipelineRefTarget } from './api';

const instance: PipelineRefTarget = {
    ref_type,
    ref_name,
    commit,
    selector,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
