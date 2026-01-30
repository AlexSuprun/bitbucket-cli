# Pipeline


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the pipeline. | [optional] [default to undefined]
**build_number** | **number** | The build number of the pipeline. | [optional] [default to undefined]
**creator** | [**Account**](Account.md) |  | [optional] [default to undefined]
**repository** | [**Repository**](Repository.md) |  | [optional] [default to undefined]
**target** | [**PipelineTarget**](PipelineTarget.md) |  | [optional] [default to undefined]
**trigger** | [**PipelineTrigger**](PipelineTrigger.md) |  | [optional] [default to undefined]
**state** | [**PipelineState**](PipelineState.md) |  | [optional] [default to undefined]
**variables** | [**Array&lt;PipelineVariable&gt;**](PipelineVariable.md) | The variables for the pipeline. | [optional] [default to undefined]
**created_on** | **string** | The timestamp when the pipeline was created. | [optional] [default to undefined]
**completed_on** | **string** | The timestamp when the Pipeline was completed. This is not set if the pipeline is still in progress. | [optional] [default to undefined]
**build_seconds_used** | **number** | The number of build seconds used by this pipeline. | [optional] [default to undefined]
**configuration_sources** | [**Array&lt;PipelineConfigurationSource&gt;**](PipelineConfigurationSource.md) | An ordered list of sources of the pipeline configuration | [optional] [default to undefined]
**links** | [**PipelinesPipelineLinks**](PipelinesPipelineLinks.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Pipeline } from './api';

const instance: Pipeline = {
    uuid,
    build_number,
    creator,
    repository,
    target,
    trigger,
    state,
    variables,
    created_on,
    completed_on,
    build_seconds_used,
    configuration_sources,
    links,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
