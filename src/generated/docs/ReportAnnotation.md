# ReportAnnotation


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**external_id** | **string** | ID of the annotation provided by the annotation creator. It can be used to identify the annotation as an alternative to it\&#39;s generated uuid. It is not used by Bitbucket, but only by the annotation creator for updating or deleting this specific annotation. Needs to be unique. | [optional] [default to undefined]
**uuid** | **string** | The UUID that can be used to identify the annotation. | [optional] [default to undefined]
**annotation_type** | **string** | The type of the report. | [optional] [default to undefined]
**path** | **string** | The path of the file on which this annotation should be placed. This is the path of the file relative to the git repository. If no path is provided, then it will appear in the overview modal on all pull requests where the tip of the branch is the given commit, regardless of which files were modified. | [optional] [default to undefined]
**line** | **number** | The line number that the annotation should belong to. If no line number is provided, then it will default to 0 and in a pull request it will appear at the top of the file specified by the path field. | [optional] [default to undefined]
**summary** | **string** | The message to display to users. | [optional] [default to undefined]
**details** | **string** | The details to show to users when clicking on the annotation. | [optional] [default to undefined]
**result** | **string** | The state of the report. May be set to PENDING and later updated. | [optional] [default to undefined]
**severity** | **string** | The severity of the annotation. | [optional] [default to undefined]
**link** | **string** | A URL linking to the annotation in an external tool. | [optional] [default to undefined]
**created_on** | **string** | The timestamp when the report was created. | [optional] [default to undefined]
**updated_on** | **string** | The timestamp when the report was updated. | [optional] [default to undefined]

## Example

```typescript
import { ReportAnnotation } from './api';

const instance: ReportAnnotation = {
    external_id,
    uuid,
    annotation_type,
    path,
    line,
    summary,
    details,
    result,
    severity,
    link,
    created_on,
    updated_on,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
