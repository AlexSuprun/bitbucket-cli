# PipelineSshKeyPair


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**private_key** | **string** | The SSH private key. This value will be empty when retrieving the SSH key pair. | [optional] [default to undefined]
**public_key** | **string** | The SSH public key. | [optional] [default to undefined]

## Example

```typescript
import { PipelineSshKeyPair } from './api';

const instance: PipelineSshKeyPair = {
    private_key,
    public_key,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
