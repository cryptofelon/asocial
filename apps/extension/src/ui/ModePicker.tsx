import type { Mode } from "../settings/model";
import styles from "./mode-picker.module.scss";

const MODE_COPY: ReadonlyArray<{
  mode: Mode;
  label: string;
  description: string;
}> = [
  {
    mode: "write-only",
    label: "Journal",
    description: "Only writing and account controls",
  },
  {
    mode: "low-dopamine",
    label: "Low dopamine",
    description: "X without vanity metrics and attention traps",
  },
  {
    mode: "normal",
    label: "Normal",
    description: "Restore X exactly",
  },
];

interface ModePickerProps {
  value: Mode;
  disabled?: boolean;
  onChange: (mode: Mode) => void;
}

export function ModePicker({ value, disabled = false, onChange }: ModePickerProps) {
  return (
    <fieldset className={styles.group} disabled={disabled}>
      <legend>Mode</legend>
      {MODE_COPY.map((option) => (
        <label className={styles.option} data-selected={option.mode === value} key={option.mode}>
          <input
            checked={option.mode === value}
            name="mode"
            onChange={() => onChange(option.mode)}
            type="radio"
            value={option.mode}
          />
          <span>
            <strong>{option.label}</strong>
            <small>{option.description}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
