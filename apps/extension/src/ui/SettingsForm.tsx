import type { AttentionLevel, SettingsPatch, SettingsV1 } from "../settings/model";
import styles from "./settings-form.module.scss";

const BOOLEAN_OPTIONS: ReadonlyArray<{
  key:
    | "mentionsShortcut"
    | "hideTrends"
    | "hideRecommendedPosts"
    | "hideAccountSuggestions"
    | "hidePremiumAndAnalytics";
  label: string;
  description: string;
}> = [
  {
    key: "mentionsShortcut",
    label: "Mentions shortcut",
    description: "Keep a direct route to replies and mentions.",
  },
  {
    key: "hideTrends",
    label: "Hide trends",
    description: "Remove trending topics and trend suggestions.",
  },
  {
    key: "hideRecommendedPosts",
    label: "Hide recommended posts",
    description: "Remove recommendation modules identified by the adapter.",
  },
  {
    key: "hideAccountSuggestions",
    label: "Hide account suggestions",
    description: "Remove who-to-follow modules.",
  },
  {
    key: "hidePremiumAndAnalytics",
    label: "Hide Premium and analytics links",
    description: "Remove commercial scorekeeping shortcuts.",
  },
];

interface SettingsFormProps {
  value: SettingsV1;
  disabled?: boolean;
  onChange: (patch: SettingsPatch) => void;
}

export function SettingsForm({ value, disabled = false, onChange }: SettingsFormProps) {
  return (
    <div className={styles.form} aria-disabled={disabled}>
      <section>
        <h2>Metrics</h2>
        <label className={styles.selectRow}>
          <span>
            <strong>Hide vanity metrics</strong>
            <small>Unknown ownership stays hidden to avoid accidental leaks.</small>
          </span>
          <select
            disabled={disabled}
            onChange={(event) => onChange({ metricScope: event.target.value as "self" | "all" })}
            value={value.metricScope}
          >
            <option value="self">My posts and profile</option>
            <option value="all">Every post and profile</option>
          </select>
        </label>
      </section>

      <section>
        <h2>Attention</h2>
        {(
          [
            ["notificationBadges", "Notification badges"],
            ["messageBadges", "Message badges"],
          ] as const
        ).map(([key, label]) => (
          <label className={styles.selectRow} key={key}>
            <strong>{label}</strong>
            <select
              disabled={disabled}
              onChange={(event) => onChange({ [key]: event.target.value as AttentionLevel })}
              value={value[key]}
            >
              <option value="normal">Normal</option>
              <option value="quiet">Quiet</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        ))}
      </section>

      <section className={styles.checks}>
        <h2>Surfaces</h2>
        {BOOLEAN_OPTIONS.map((option) => (
          <label key={option.key}>
            <input
              checked={value[option.key]}
              disabled={disabled}
              onChange={(event) => onChange({ [option.key]: event.target.checked })}
              type="checkbox"
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </section>
    </div>
  );
}
