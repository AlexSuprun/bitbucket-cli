# PipelineKnownHost


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the known host. | [optional] [default to undefined]
**hostname** | **string** | The hostname of the known host. | [optional] [default to undefined]
**public_key** | [**PipelineSshPublicKey**](PipelineSshPublicKey.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PipelineKnownHost } from './api';

const instance: PipelineKnownHost = {
    uuid,
    hostname,
    public_key,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
