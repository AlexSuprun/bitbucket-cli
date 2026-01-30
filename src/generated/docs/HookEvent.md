# HookEvent

An event, associated with a resource or subject type.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event** | **string** | The event identifier. | [optional] [default to undefined]
**category** | **string** | The category this event belongs to. | [optional] [default to undefined]
**label** | **string** | Summary of the webhook event type. | [optional] [default to undefined]
**description** | **string** | More detailed description of the webhook event type. | [optional] [default to undefined]

## Example

```typescript
import { HookEvent } from './api';

const instance: HookEvent = {
    event,
    category,
    label,
    description,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
