/**
 * API response types for Bitbucket Cloud API
 */

export interface PaginatedResponse<T> {
  values: T[];
  pagelen: number;
  size?: number;
  page?: number;
  next?: string;
  previous?: string;
}

export interface BitbucketUser {
  uuid: string;
  username: string;
  display_name: string;
  nickname: string;
  account_id: string;
  links: {
    html: LinkObject;
    avatar: LinkObject;
  };
}

export interface BitbucketWorkspace {
  uuid: string;
  slug: string;
  name: string;
  links: {
    html: LinkObject;
    avatar: LinkObject;
  };
}

export interface BitbucketRepository {
  uuid: string;
  full_name: string;
  name: string;
  slug: string;
  description: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
  size: number;
  language: string;
  mainbranch?: {
    name: string;
    type: string;
  };
  links: {
    html: LinkObject;
    clone: CloneLinkObject[];
    avatar: LinkObject;
  };
  owner: BitbucketUser;
  workspace: BitbucketWorkspace;
  project?: BitbucketProject;
}

export interface BitbucketProject {
  key: string;
  uuid: string;
  name: string;
  links: {
    html: LinkObject;
    avatar: LinkObject;
  };
}

export interface BitbucketPullRequest {
  id: number;
  title: string;
  description: string;
  state: PullRequestState;
  draft?: boolean;
  author: BitbucketUser;
  source: {
    branch: { name: string };
    repository: { full_name: string };
    commit?: { hash: string };
  };
  destination: {
    branch: { name: string };
    repository: { full_name: string };
    commit?: { hash: string };
  };
  merge_commit?: { hash: string };
  created_on: string;
  updated_on: string;
  closed_by?: BitbucketUser;
  close_source_branch: boolean;
  comment_count: number;
  task_count: number;
  links: {
    html: LinkObject;
    diff: LinkObject;
    commits: LinkObject;
    comments: LinkObject;
    approve: LinkObject;
    decline: LinkObject;
    merge: LinkObject;
  };
  participants: BitbucketParticipant[];
  reviewers: BitbucketUser[];
}

export interface BitbucketParticipant {
  user: BitbucketUser;
  role: "PARTICIPANT" | "REVIEWER";
  approved: boolean;
  state: "approved" | "changes_requested" | null;
  participated_on: string;
}

export interface BitbucketApproval {
  approved: boolean;
  user: BitbucketUser;
  date: string;
}

export type PullRequestState = "OPEN" | "MERGED" | "DECLINED" | "SUPERSEDED";

export type MergeStrategy = "merge_commit" | "squash" | "fast_forward";

export interface BitbucketComment {
  id: number;
  content: {
    raw: string;
  };
  user?: BitbucketUser;
  created_on: string;
  updated_on: string;
  links: {
    self: LinkObject;
    html: LinkObject;
    parent?: LinkObject;
  };
  deleted?: boolean;
}

export interface BitbucketPullRequestSummary {
  id: number;
  title?: string;
  links?: {
    html?: LinkObject;
    self?: LinkObject;
  };
}

export interface BitbucketPullRequestActivityComment {
  id: number;
  content: {
    raw: string;
  };
  user?: BitbucketUser;
  author?: BitbucketUser;
  created_on?: string;
  updated_on?: string;
  links?: {
    self?: LinkObject;
    html?: LinkObject;
  };
}

export interface BitbucketPullRequestActivityApproval {
  date?: string;
  user?: BitbucketUser;
  pullrequest?: BitbucketPullRequestSummary;
}

export interface BitbucketPullRequestActivityChangeRequest {
  date?: string;
  user?: BitbucketUser;
  reason?: string;
}

export interface BitbucketPullRequestActivityUpdate {
  date?: string;
  state?: PullRequestState;
  title?: string;
  description?: string;
  reason?: string;
  author?: BitbucketUser;
}

export interface BitbucketPullRequestActivityCommit {
  hash?: string;
  date?: string;
  message?: string;
  author?: {
    user?: BitbucketUser;
    raw?: string;
  };
}

export interface BitbucketPullRequestActivity {
  type?: string;
  comment?: BitbucketPullRequestActivityComment;
  approval?: BitbucketPullRequestActivityApproval;
  changes_requested?: BitbucketPullRequestActivityChangeRequest;
  update?: BitbucketPullRequestActivityUpdate;
  commit?: BitbucketPullRequestActivityCommit;
  merge?: {
    date?: string;
    user?: BitbucketUser;
    commit?: BitbucketPullRequestActivityCommit;
  };
  decline?: {
    date?: string;
    user?: BitbucketUser;
  };
  pull_request?: BitbucketPullRequestSummary;
  pullrequest?: BitbucketPullRequestSummary;
  user?: BitbucketUser;
}

export interface LinkObject {
  href: string;
}

export interface CloneLinkObject {
  name: string;
  href: string;
}

export interface CreateRepositoryRequest {
  scm: "git";
  name: string;
  description?: string;
  is_private?: boolean;
  project?: { key: string };
  fork_policy?: "allow_forks" | "no_public_forks" | "no_forks";
}

export interface CreatePullRequestRequest {
  title: string;
  description?: string;
  source: {
    branch: { name: string };
  };
  destination: {
    branch: { name: string };
  };
  draft?: boolean;
  close_source_branch?: boolean;
  reviewers?: Array<{ uuid: string }>;
}

export interface MergePullRequestRequest {
  message?: string;
  close_source_branch?: boolean;
  merge_strategy?: MergeStrategy;
}

export interface UpdatePullRequestRequest {
  title?: string;
  description?: string;
  draft?: boolean;
  reviewers?: Array<{ uuid: string }>;
}

export interface DiffStatFile {
  type: string;
  status: string;
  lines_removed: number;
  lines_added: number;
  old?: {
    path: string;
    escaped_path?: string;
  };
  new?: {
    path: string;
    escaped_path?: string;
  };
}

export interface DiffStat {
  values: DiffStatFile[];
  pagelen?: number;
  size?: number;
  page?: number;
  next?: string;
}
