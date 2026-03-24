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
export interface ReportsParams extends PaginationParams {}
