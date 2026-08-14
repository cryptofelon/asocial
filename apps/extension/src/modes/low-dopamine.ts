import type { SettingsV1 } from "../settings/model";

export function applyLowDopamineSettings(html: HTMLElement, settings: SettingsV1): void {
  html.dataset.asocialMode = "low-dopamine";
  html.dataset.asocialMetricScope = settings.metricScope;
  html.dataset.asocialNotificationBadges = settings.notificationBadges;
  html.dataset.asocialMessageBadges = settings.messageBadges;
  html.dataset.asocialHideTrends = String(settings.hideTrends);
  html.dataset.asocialHideRecommendedPosts = String(settings.hideRecommendedPosts);
  html.dataset.asocialHideAccountSuggestions = String(settings.hideAccountSuggestions);
  html.dataset.asocialHidePremium = String(settings.hidePremiumAndAnalytics);
}
