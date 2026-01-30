# Deployment


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID identifying the deployment. | [optional] [default to undefined]
**state** | [**DeploymentState**](DeploymentState.md) |  | [optional] [default to undefined]
**environment** | [**DeploymentEnvironment**](DeploymentEnvironment.md) |  | [optional] [default to undefined]
**release** | [**DeploymentRelease**](DeploymentRelease.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Deployment } from './api';

const instance: Deployment = {
    uuid,
    state,
    environment,
    release,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
