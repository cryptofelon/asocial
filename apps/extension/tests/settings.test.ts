import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings/model";
import { normalizeSettings } from "../src/settings/normalize";

describe("normalizeSettings", () => {
  it("uses calm defaults for missing or corrupt storage", () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(
      normalizeSettings({
        mode: "turbo",
        metricScope: 42,
        hideTrends: "yes",
        notificationBadges: "loud",
      }),
    ).toEqual(DEFAULT_SETTINGS);
  });

  it("preserves every valid user decision and migrates the schema version", () => {
    expect(
      normalizeSettings({
        schemaVersion: 0,
        mode: "write-only",
        metricScope: "all",
        notificationBadges: "hidden",
        messageBadges: "normal",
        mentionsShortcut: false,
        hideTrends: false,
        hideRecommendedPosts: true,
        hideAccountSuggestions: true,
        hidePremiumAndAnalytics: false,
      }),
    ).toEqual({
      schemaVersion: 1,
      mode: "write-only",
      metricScope: "all",
      notificationBadges: "hidden",
      messageBadges: "normal",
      mentionsShortcut: false,
      hideTrends: false,
      hideRecommendedPosts: true,
      hideAccountSuggestions: true,
      hidePremiumAndAnalytics: false,
    });
  });
});
