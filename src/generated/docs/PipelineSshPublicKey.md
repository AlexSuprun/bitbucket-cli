# PipelineSshPublicKey


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key_type** | **string** | The type of the public key. | [optional] [default to undefined]
**key** | **string** | The base64 encoded public key. | [optional] [default to undefined]
**md5_fingerprint** | **string** | The MD5 fingerprint of the public key. | [optional] [default to undefined]
**sha256_fingerprint** | **string** | The SHA-256 fingerprint of the public key. | [optional] [default to undefined]

## Example

```typescript
import { PipelineSshPublicKey } from './api';

const instance: PipelineSshPublicKey = {
    key_type,
    key,
    md5_fingerprint,
    sha256_fingerprint,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
