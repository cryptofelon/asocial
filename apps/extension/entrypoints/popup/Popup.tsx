import { useEffect, useState } from "react";
import { ModePicker } from "../../src/ui/ModePicker";
import type { Mode, SettingsV1 } from "../../src/settings/model";
import { readSettings, updateSettings } from "../../src/settings/repository";
import styles from "./popup.module.scss";
import { GET_RUNTIME_STATUS, isRuntimeStatus, type RuntimeStatus } from "../../src/runtime/status";

async function readActiveTabStatus(): Promise<RuntimeStatus | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return null;
  try {
    const status: unknown = await browser.tabs.sendMessage(tab.id, {
      type: GET_RUNTIME_STATUS,
    });
    return isRuntimeStatus(status) ? status : null;
  } catch {
    return null;
  }
}

export function Popup() {
  const [settings, setSettings] = useState<SettingsV1>();
  const [saving, setSaving] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>();

  useEffect(() => {
    void readSettings().then(setSettings);
    void readActiveTabStatus().then(setRuntimeStatus);
  }, []);

  const changeMode = async (mode: Mode) => {
    setSaving(true);
    try {
      setSettings(await updateSettings({ mode }));
      setRuntimeStatus(await readActiveTabStatus());
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.popup}>
      <header>
        <span className={styles.wordmark}>asocial</span>
        <button onClick={() => void browser.runtime.openOptionsPage()} type="button">
          Settings
        </button>
      </header>

      {settings ? (
        <>
          <ModePicker
            disabled={saving}
            onChange={(mode) => void changeMode(mode)}
            value={settings.mode}
          />
          {settings.mode === "write-only" && (
            <p className={styles.notice}>
              Posts still use your current X audience. Journal mode is quiet, not private.
            </p>
          )}
          {settings.mode === "low-dopamine" && settings.mentionsShortcut && (
            <button
              className={styles.shortcut}
              onClick={() =>
                void browser.tabs.create({
                  url: "https://x.com/notifications/mentions",
                })
              }
              type="button"
            >
              Open mentions without the feed
            </button>
          )}
          {runtimeStatus !== undefined && (
            <p className={styles.diagnostic} data-health={runtimeStatus?.adapter ?? "unavailable"}>
              {runtimeStatus === null
                ? "Open X to inspect adapter health."
                : runtimeStatus.adapter === "degraded"
                  ? "X changed or a protected control is unavailable. Use Settings to return to Normal."
                  : runtimeStatus.mode === "normal"
                    ? "Normal mode is active on this X tab."
                    : "Protection is active on this X tab."}
            </p>
          )}
          <p className={styles.status} aria-live="polite">
            {saving ? "Applying to open X tabs…" : "Saved locally"}
          </p>
        </>
      ) : (
        <p className={styles.loading}>Loading local settings…</p>
      )}
    </main>
  );
}
