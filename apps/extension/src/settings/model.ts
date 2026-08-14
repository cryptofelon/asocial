export const MODES = ["normal", "low-dopamine", "write-only"] as const;
export type Mode = (typeof MODES)[number];

export const METRIC_SCOPES = ["self", "all"] as const;
export type MetricScope = (typeof METRIC_SCOPES)[number];

export const ATTENTION_LEVELS = ["normal", "quiet", "hidden"] as const;
export type AttentionLevel = (typeof ATTENTION_LEVELS)[number];

export interface SettingsV1 {
  schemaVersion: 1;
  mode: Mode;
  metricScope: MetricScope;
  notificationBadges: AttentionLevel;
  messageBadges: AttentionLevel;
  mentionsShortcut: boolean;
  hideTrends: boolean;
  hideRecommendedPosts: boolean;
  hideAccountSuggestions: boolean;
  hidePremiumAndAnalytics: boolean;
}

export const DEFAULT_SETTINGS: Readonly<SettingsV1> = Object.freeze({
  schemaVersion: 1,
  mode: "normal",
  metricScope: "self",
  notificationBadges: "quiet",
  messageBadges: "quiet",
  mentionsShortcut: true,
  hideTrends: true,
  hideRecommendedPosts: false,
  hideAccountSuggestions: false,
  hidePremiumAndAnalytics: true,
});

export type SettingsPatch = Partial<Omit<SettingsV1, "schemaVersion">>;
