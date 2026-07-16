import type { BitbucketScope } from './Scope';

/**
 * Auto-decline settings: whether inactive pull requests are declined
 * automatically, and after how many weeks of inactivity.
 */
export interface AutoDeclineSettings {
  enabled: boolean;
  /** Weeks of inactivity after which pull requests are declined */
  inactivityWeeks: number;
  /** The scope the settings apply to */
  scope?: BitbucketScope;
}

/**
 * Payload for `PUT …/settings/auto-decline`.
 */
export interface AutoDeclineSettingsRequest {
  enabled?: boolean;
  /** Weeks of inactivity after which pull requests are declined; Bitbucket accepts `1`, `2`, `4`, `8`, or `12` */
  inactivityWeeks?: number;
}
