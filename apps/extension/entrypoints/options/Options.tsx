import { useEffect, useState } from "react";
import type { SettingsPatch, SettingsV1 } from "../../src/settings/model";
import { readSettings, subscribeToSettings, updateSettings } from "../../src/settings/repository";
import { ModePicker } from "../../src/ui/ModePicker";
import { SettingsForm } from "../../src/ui/SettingsForm";
import styles from "./options.module.scss";

export function Options() {
  const [settings, setSettings] = useState<SettingsV1>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void readSettings().then((value) => {
      if (active) setSettings(value);
    });
    const unsubscribe = subscribeToSettings((value) => {
      if (active) setSettings(value);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const apply = async (patch: SettingsPatch) => {
    setSaving(true);
    try {
      setSettings(await updateSettings(patch));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <header>
        <span>asocial</span>
        <h1>Attention settings</h1>
        <p>
          Everything stays in extension-local storage. No accounts, backend, telemetry, analytics,
          or post content collection.
        </p>
      </header>

      {settings ? (
        <div className={styles.layout}>
          <aside>
            <ModePicker
              disabled={saving}
              onChange={(mode) => void apply({ mode })}
              value={settings.mode}
            />
            <p>
              Journal mode never makes a public X post private. X still owns audience selection,
              validation, media, and publishing.
            </p>
          </aside>
          <section className={styles.panel}>
            <SettingsForm
              disabled={saving}
              onChange={(patch) => void apply(patch)}
              value={settings}
            />
          </section>
        </div>
      ) : (
        <p>Loading local settings…</p>
      )}

      <footer aria-live="polite">
        {saving ? "Saving…" : "Changes apply to every open X tab without reload."}
      </footer>
    </main>
  );
}
