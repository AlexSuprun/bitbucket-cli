# PipelineVariable


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the variable. | [optional] [default to undefined]
**key** | **string** | The unique name of the variable. | [optional] [default to undefined]
**value** | **string** | The value of the variable. If the variable is secured, this will be empty. | [optional] [default to undefined]
**secured** | **boolean** | If true, this variable will be treated as secured. The value will never be exposed in the logs or the REST API. | [optional] [default to undefined]

## Example

```typescript
import { PipelineVariable } from './api';

const instance: PipelineVariable = {
    uuid,
    key,
    value,
    secured,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
