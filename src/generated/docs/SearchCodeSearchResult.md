# SearchCodeSearchResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [optional] [readonly] [default to undefined]
**content_match_count** | **number** |  | [optional] [readonly] [default to undefined]
**content_matches** | [**Array&lt;SearchContentMatch&gt;**](SearchContentMatch.md) |  | [optional] [readonly] [default to undefined]
**path_matches** | [**Array&lt;SearchSegment&gt;**](SearchSegment.md) |  | [optional] [readonly] [default to undefined]
**file** | [**CommitFile**](CommitFile.md) |  | [optional] [default to undefined]

## Example

```typescript
import { SearchCodeSearchResult } from './api';

const instance: SearchCodeSearchResult = {
    type,
    content_match_count,
    content_matches,
    path_matches,
    file,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
