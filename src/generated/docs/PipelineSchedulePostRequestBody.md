# PipelineSchedulePostRequestBody


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**target** | [**RequestBodyForPipelineSchedulePOSTRequestTarget**](RequestBodyForPipelineSchedulePOSTRequestTarget.md) |  | [default to undefined]
**enabled** | **boolean** | Whether the schedule is enabled. | [optional] [default to undefined]
**cron_pattern** | **string** | The cron expression with second precision (7 fields) that the schedule applies. For example, for expression: 0 0 12 * * ? *, will execute at 12pm UTC every day. | [default to undefined]

## Example

```typescript
import { PipelineSchedulePostRequestBody } from './api';

const instance: PipelineSchedulePostRequestBody = {
    target,
    enabled,
    cron_pattern,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
