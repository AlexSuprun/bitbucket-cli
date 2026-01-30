# DeploymentStateInProgress


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | The name of deployment state (IN_PROGRESS). | [optional] [default to undefined]
**url** | **string** | Link to the deployment result. | [optional] [default to undefined]
**deployer** | [**Account**](Account.md) |  | [optional] [default to undefined]
**start_date** | **string** | The timestamp when the deployment was started. | [optional] [default to undefined]

## Example

```typescript
import { DeploymentStateInProgress } from './api';

const instance: DeploymentStateInProgress = {
    name,
    url,
    deployer,
    start_date,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
