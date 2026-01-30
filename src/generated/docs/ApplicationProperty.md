# ApplicationProperty

An application property. It is a caller defined JSON object that Bitbucket will store and return.  The `_attributes` field at its top level can be used to control who is allowed to read and update the property.  The keys of the JSON object must match an allowed pattern. For details,  see [Application properties](/cloud/bitbucket/application-properties/). 

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**_attributes** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { ApplicationProperty } from './api';

const instance: ApplicationProperty = {
    _attributes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
