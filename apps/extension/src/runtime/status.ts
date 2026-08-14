import type { Mode } from "../settings/model";

export const GET_RUNTIME_STATUS = "asocial:get-runtime-status" as const;

export interface RuntimeStatus {
  mode: Mode;
  adapter: "inactive" | "ready" | "degraded";
  route: string;
}

export function isRuntimeStatus(value: unknown): value is RuntimeStatus {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<RuntimeStatus>;
  return (
    (candidate.mode === "normal" ||
      candidate.mode === "low-dopamine" ||
      candidate.mode === "write-only") &&
    (candidate.adapter === "inactive" ||
      candidate.adapter === "ready" ||
      candidate.adapter === "degraded") &&
    typeof candidate.route === "string"
  );
}

export function isRuntimeStatusRequest(
  message: unknown,
): message is { type: typeof GET_RUNTIME_STATUS } {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === GET_RUNTIME_STATUS
  );
}
