/** Pull request email categories supported by Bitbucket Data Center 10.4. */
export type PullRequestNotificationSubscription =
  | 'STATE_CHANGES'
  | 'COMMENTS'
  | 'MENTIONS'
  | 'CODE_CHANGES';

/** Email notification preferences for the currently authenticated user. */
export interface NotificationSettings {
  /** Emails received when the user is the pull request author. */
  authorNotificationSubscriptions?: PullRequestNotificationSubscription[];
  /** Emails received when the user watches the pull request. */
  watcherNotificationSubscriptions?: PullRequestNotificationSubscription[];
}

/** Payload accepted by `PUT /rest/notification/1.0/settings`. */
export type UpdateNotificationSettingsData = NotificationSettings;
