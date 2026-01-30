# RequestBodyForPipelineSchedulePOSTRequestTarget

The target on which the schedule will be executed.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**selector** | [**PipelineSelector**](PipelineSelector.md) |  | [default to undefined]
**ref_name** | **string** | The name of the reference. | [default to undefined]
**ref_type** | **string** | The type of reference (branch only). | [default to undefined]

## Example

```typescript
import { RequestBodyForPipelineSchedulePOSTRequestTarget } from './api';

const instance: RequestBodyForPipelineSchedulePOSTRequestTarget = {
    selector,
    ref_name,
    ref_type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
