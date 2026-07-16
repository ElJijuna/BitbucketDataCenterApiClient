import type { PaginationParams } from './Pagination';

/** The overall result of a Code Insights report. */
export type ReportResult = 'PASS' | 'FAIL';

/** The data types supported for report data items. */
export type ReportDataType =
  | 'BOOLEAN'
  | 'DATE'
  | 'DURATION'
  | 'LINK'
  | 'NUMBER'
  | 'PERCENTAGE'
  | 'TEXT';

/** A single data point included in a Code Insights report. */
export interface BitbucketReportData {
  title: string;
  type: ReportDataType;
  value: string | number | boolean | { href: string; text?: string };
}

/**
 * Represents a Code Insights report attached to a pull request in Bitbucket Data Center.
 *
 * Reports are created by external tools (CI, static analysis, coverage) and
 * displayed in the pull request overview.
 */
export interface BitbucketReport {
  /** Unique key identifying the report */
  key: string;
  title: string;
  details?: string;
  /** Overall result of the report */
  result?: ReportResult;
  /** Name of the tool or service that created the report */
  reporter?: string;
  /** Link to the full external report */
  link?: string;
  /** URL of the logo shown in the Bitbucket UI */
  logoUrl?: string;
  /** Structured data points displayed in the report */
  data?: BitbucketReportData[];
  createdDate: number;
  updatedDate: number;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/reports`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-code-insights/#api-insights-latest-projects-projectkey-repos-repositoryslug-pull-requests-pullrequestid-reports-get}
 */
export type ReportsParams = PaginationParams;

/**
 * Payload for `PUT /rest/insights/latest/…/commits/{commitId}/reports/{key}`
 * (creates or replaces a Code Insights report).
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-builds-and-deployments/#api-insights-latest-projects-projectkey-repos-repositoryslug-commits-commitid-reports-key-put}
 */
export interface SetInsightReportData {
  /** Report title, max 450 characters */
  title: string;
  /** Data points shown in the report; at most 6 */
  data: BitbucketReportData[];
  details?: string;
  result?: ReportResult;
  /** Name of the tool or service creating the report, max 450 characters */
  reporter?: string;
  /** Link to the full external report */
  link?: string;
  /** URL of the logo shown in the Bitbucket UI */
  logoUrl?: string;
  /** Epoch millisecond timestamp; defaults to the server's current time */
  createdDate?: number;
  /** Set when the report carries code-coverage information */
  coverageProviderKey?: string;
}

/** Severity of a Code Insights annotation. */
export type InsightAnnotationSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

/** Classification of a Code Insights annotation. */
export type InsightAnnotationType = 'VULNERABILITY' | 'CODE_SMELL' | 'BUG';

/**
 * A Code Insights annotation: a finding attached to a file/line of a commit,
 * belonging to a report.
 */
export interface BitbucketInsightAnnotation {
  message: string;
  severity: InsightAnnotationSeverity;
  type?: InsightAnnotationType;
  /** Identifier assigned by the reporting tool; unique within the report */
  externalId?: string;
  /** Path of the annotated file, relative to the repository root */
  path?: string;
  /** Line the annotation refers to; `0` (or absent) annotates the whole file */
  line?: number;
  /** Link to the finding in the reporting tool */
  link?: string;
  /** Key of the report the annotation belongs to */
  reportKey?: string;
}

/** Response of the Code Insights annotation list endpoints (not paged). */
export interface InsightAnnotationsResponse {
  annotations: BitbucketInsightAnnotation[];
}

/**
 * Payload for adding or replacing a single Code Insights annotation.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-builds-and-deployments/#api-insights-latest-projects-projectkey-repos-repositoryslug-commits-commitid-reports-key-annotations-post}
 */
export interface AddInsightAnnotationData {
  /** The finding's message, max 2000 characters */
  message: string;
  severity: InsightAnnotationSeverity;
  type?: InsightAnnotationType;
  /** Identifier assigned by the reporting tool; unique within the report */
  externalId?: string;
  /** Path of the annotated file, relative to the repository root */
  path?: string;
  /** Line to annotate; omit (or `0`) to annotate the whole file */
  line?: number;
  /** Link to the finding in the reporting tool */
  link?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/insights/latest/…/commits/{commitId}/annotations` (annotations
 * across all of the commit's reports).
 */
export interface CommitAnnotationsParams {
  /** Filter by report key */
  key?: string;
  /** Filter by the annotation's external id */
  externalId?: string;
  /** Filter by annotated file path */
  path?: string;
  /** Filter by severity */
  severity?: InsightAnnotationSeverity;
  /** Filter by annotation type */
  type?: InsightAnnotationType;
}
