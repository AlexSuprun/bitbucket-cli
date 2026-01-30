# ModelObject

Base type for most resource objects. It defines the common `type` element that identifies an object\'s type. It also identifies the element as Swagger\'s `discriminator`.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]

## Example

```typescript
import { ModelObject } from './api';

const instance: ModelObject = {
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
