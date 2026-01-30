# Participant


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**user** | [**Account**](Account.md) |  | [optional] [default to undefined]
**role** | **string** |  | [optional] [default to undefined]
**approved** | **boolean** |  | [optional] [default to undefined]
**state** | **string** |  | [optional] [default to undefined]
**participated_on** | **string** | The ISO8601 timestamp of the participant\&#39;s action. For approvers, this is the time of their approval. For commenters and pull request reviewers who are not approvers, this is the time they last commented, or null if they have not commented. | [optional] [default to undefined]

## Example

```typescript
import { Participant } from './api';

const instance: Participant = {
    user,
    role,
    approved,
    state,
    participated_on,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
