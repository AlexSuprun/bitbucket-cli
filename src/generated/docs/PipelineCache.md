# PipelineCache


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the pipeline cache. | [optional] [default to undefined]
**pipeline_uuid** | **string** | The UUID of the pipeline that created the cache. | [optional] [default to undefined]
**step_uuid** | **string** | The uuid of the step that created the cache. | [optional] [default to undefined]
**name** | **string** | The name of the cache. | [optional] [default to undefined]
**key_hash** | **string** | The key hash of the cache version. | [optional] [default to undefined]
**path** | **string** | The path where the cache contents were retrieved from. | [optional] [default to undefined]
**file_size_bytes** | **number** | The size of the file containing the archive of the cache. | [optional] [default to undefined]
**created_on** | **string** | The timestamp when the cache was created. | [optional] [default to undefined]

## Example

```typescript
import { PipelineCache } from './api';

const instance: PipelineCache = {
    uuid,
    pipeline_uuid,
    step_uuid,
    name,
    key_hash,
    path,
    file_size_bytes,
    created_on,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
