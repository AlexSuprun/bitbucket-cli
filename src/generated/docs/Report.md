# Report


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uuid** | **string** | The UUID that can be used to identify the report. | [optional] [default to undefined]
**title** | **string** | The title of the report. | [optional] [default to undefined]
**details** | **string** | A string to describe the purpose of the report. | [optional] [default to undefined]
**external_id** | **string** | ID of the report provided by the report creator. It can be used to identify the report as an alternative to it\&#39;s generated uuid. It is not used by Bitbucket, but only by the report creator for updating or deleting this specific report. Needs to be unique. | [optional] [default to undefined]
**reporter** | **string** | A string to describe the tool or company who created the report. | [optional] [default to undefined]
**link** | **string** | A URL linking to the results of the report in an external tool. | [optional] [default to undefined]
**remote_link_enabled** | **boolean** | If enabled, a remote link is created in Jira for the work item associated with the commit the report belongs to. | [optional] [default to undefined]
**logo_url** | **string** | A URL to the report logo. If none is provided, the default insights logo will be used. | [optional] [default to undefined]
**report_type** | **string** | The type of the report. | [optional] [default to undefined]
**result** | **string** | The state of the report. May be set to PENDING and later updated. | [optional] [default to undefined]
**data** | [**Array&lt;ReportData&gt;**](ReportData.md) | An array of data fields to display information on the report. Maximum 10. | [optional] [default to undefined]
**created_on** | **string** | The timestamp when the report was created. | [optional] [default to undefined]
**updated_on** | **string** | The timestamp when the report was updated. | [optional] [default to undefined]

## Example

```typescript
import { Report } from './api';

const instance: Report = {
    uuid,
    title,
    details,
    external_id,
    reporter,
    link,
    remote_link_enabled,
    logo_url,
    report_type,
    result,
    data,
    created_on,
    updated_on,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
