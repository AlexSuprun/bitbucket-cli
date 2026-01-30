# PipelineSchedule


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the schedule. | [optional] [default to undefined]
**enabled** | **boolean** | Whether the schedule is enabled. | [optional] [default to undefined]
**target** | [**PipelineRefTarget**](PipelineRefTarget.md) |  | [optional] [default to undefined]
**cron_pattern** | **string** | The cron expression with second precision (7 fields) that the schedule applies. For example, for expression: 0 0 12 * * ? *, will execute at 12pm UTC every day. | [optional] [default to undefined]
**created_on** | **string** | The timestamp when the schedule was created. | [optional] [default to undefined]
**updated_on** | **string** | The timestamp when the schedule was updated. | [optional] [default to undefined]

## Example

```typescript
import { PipelineSchedule } from './api';

const instance: PipelineSchedule = {
    uuid,
    enabled,
    target,
    cron_pattern,
    created_on,
    updated_on,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
