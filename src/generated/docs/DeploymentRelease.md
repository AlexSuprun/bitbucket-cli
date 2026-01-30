# DeploymentRelease


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the release. | [optional] [default to undefined]
**name** | **string** | The name of the release. | [optional] [default to undefined]
**url** | **string** | Link to the pipeline that produced the release. | [optional] [default to undefined]
**commit** | [**Commit**](Commit.md) |  | [optional] [default to undefined]
**created_on** | **string** | The timestamp when the release was created. | [optional] [default to undefined]

## Example

```typescript
import { DeploymentRelease } from './api';

const instance: DeploymentRelease = {
    uuid,
    name,
    url,
    commit,
    created_on,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
