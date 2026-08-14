import { ATTENTION_LEVELS, DEFAULT_SETTINGS, METRIC_SCOPES, MODES, type SettingsV1 } from "./model";

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function readBoolean(
  source: Partial<Record<keyof SettingsV1, unknown>>,
  key: keyof SettingsV1,
  fallback: boolean,
): boolean {
  const value = source[key];
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeSettings(input: unknown): SettingsV1 {
  const source =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Partial<Record<keyof SettingsV1, unknown>>)
      : {};

  return {
    schemaVersion: 1,
    mode: isOneOf(source.mode, MODES) ? source.mode : DEFAULT_SETTINGS.mode,
    metricScope: isOneOf(source.metricScope, METRIC_SCOPES)
      ? source.metricScope
      : DEFAULT_SETTINGS.metricScope,
    notificationBadges: isOneOf(source.notificationBadges, ATTENTION_LEVELS)
      ? source.notificationBadges
      : DEFAULT_SETTINGS.notificationBadges,
    messageBadges: isOneOf(source.messageBadges, ATTENTION_LEVELS)
      ? source.messageBadges
      : DEFAULT_SETTINGS.messageBadges,
    mentionsShortcut: readBoolean(source, "mentionsShortcut", DEFAULT_SETTINGS.mentionsShortcut),
    hideTrends: readBoolean(source, "hideTrends", DEFAULT_SETTINGS.hideTrends),
    hideRecommendedPosts: readBoolean(
      source,
      "hideRecommendedPosts",
      DEFAULT_SETTINGS.hideRecommendedPosts,
    ),
    hideAccountSuggestions: readBoolean(
      source,
      "hideAccountSuggestions",
      DEFAULT_SETTINGS.hideAccountSuggestions,
    ),
    hidePremiumAndAnalytics: readBoolean(
      source,
      "hidePremiumAndAnalytics",
      DEFAULT_SETTINGS.hidePremiumAndAnalytics,
    ),
  };
}
