# PipelineStep


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the step. | [optional] [default to undefined]
**started_on** | **string** | The timestamp when the step execution was started. This is not set when the step hasn\&#39;t executed yet. | [optional] [default to undefined]
**completed_on** | **string** | The timestamp when the step execution was completed. This is not set if the step is still in progress. | [optional] [default to undefined]
**state** | [**PipelineStepState**](PipelineStepState.md) |  | [optional] [default to undefined]
**image** | [**PipelineImage**](PipelineImage.md) |  | [optional] [default to undefined]
**setup_commands** | [**Array&lt;PipelineCommand&gt;**](PipelineCommand.md) | The list of commands that are executed as part of the setup phase of the build. These commands are executed outside the build container. | [optional] [default to undefined]
**script_commands** | [**Array&lt;PipelineCommand&gt;**](PipelineCommand.md) | The list of build commands. These commands are executed in the build container. | [optional] [default to undefined]

## Example

```typescript
import { PipelineStep } from './api';

const instance: PipelineStep = {
    uuid,
    started_on,
    completed_on,
    state,
    image,
    setup_commands,
    script_commands,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
