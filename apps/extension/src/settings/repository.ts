import type { SettingsPatch, SettingsV1 } from "./model";
import { normalizeSettings } from "./normalize";

const SETTINGS_KEY = "settings";

export async function readSettings(): Promise<SettingsV1> {
  const stored = await browser.storage.local.get(SETTINGS_KEY);
  return normalizeSettings(stored[SETTINGS_KEY]);
}

export async function updateSettings(patch: SettingsPatch): Promise<SettingsV1> {
  const current = await readSettings();
  const next = normalizeSettings({ ...current, ...patch });
  await browser.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

export function subscribeToSettings(onChange: (settings: SettingsV1) => void): () => void {
  const listener: Parameters<typeof browser.storage.onChanged.addListener>[0] = (
    changes,
    areaName,
  ) => {
    if (areaName !== "local") return;
    const change = changes[SETTINGS_KEY];
    if (!change) return;
    onChange(normalizeSettings(change.newValue));
  };

  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
