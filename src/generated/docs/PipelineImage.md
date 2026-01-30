# PipelineImage

The definition of a Docker image that can be used for a Bitbucket Pipelines step execution context.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | The name of the image. If the image is hosted on DockerHub the short name can be used, otherwise the fully qualified name is required here. | [optional] [default to undefined]
**username** | **string** | The username needed to authenticate with the Docker registry. Only required when using a private Docker image. | [optional] [default to undefined]
**password** | **string** | The password needed to authenticate with the Docker registry. Only required when using a private Docker image. | [optional] [default to undefined]
**email** | **string** | The email needed to authenticate with the Docker registry. Only required when using a private Docker image. | [optional] [default to undefined]

## Example

```typescript
import { PipelineImage } from './api';

const instance: PipelineImage = {
    name,
    username,
    password,
    email,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
