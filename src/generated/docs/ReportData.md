# ReportData

A key-value element that will be displayed along with the report.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** | The type of data contained in the value field. If not provided, then the value will be detected as a boolean, number or string. | [optional] [default to undefined]
**title** | **string** | A string describing what this data field represents. | [optional] [default to undefined]
**value** | **object** | The value of the data element. | [optional] [default to undefined]

## Example

```typescript
import { ReportData } from './api';

const instance: ReportData = {
    type,
    title,
    value,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
