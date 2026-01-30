# CommentResolution

The resolution object for a Comment.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]
**user** | [**Account**](Account.md) |  | [optional] [default to undefined]
**created_on** | **string** | The ISO8601 timestamp the resolution was created. | [optional] [default to undefined]

## Example

```typescript
import { CommentResolution } from './api';

const instance: CommentResolution = {
    type,
    user,
    created_on,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
