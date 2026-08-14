import { handleFromHref } from "./routes";

export type ActiveAccount =
  | { status: "known"; handle: string }
  | { status: "unknown"; reason: "missing-signals" | "disagreement" };

function handleFromText(text: string | null): string | undefined {
  const match = text?.match(/@([A-Za-z0-9_]{1,15})(?:\b|$)/);
  return match?.[1]?.toLowerCase();
}

export function detectActiveAccount(root: ParentNode): ActiveAccount {
  const profileLink = root.querySelector<HTMLAnchorElement>(
    'a[data-testid="AppTabBar_Profile_Link"][href]',
  );
  const profileHandle = handleFromHref(profileLink?.getAttribute("href") ?? null);

  const switcher = root.querySelector<HTMLElement>(
    '[data-testid="SideNav_AccountSwitcher_Button"]',
  );
  const switcherLink = switcher?.querySelector<HTMLAnchorElement>("a[href]");
  const switcherHandle =
    handleFromHref(switcherLink?.getAttribute("href") ?? null) ??
    handleFromText(switcher?.textContent ?? null);

  if (!profileHandle || !switcherHandle) {
    return { status: "unknown", reason: "missing-signals" };
  }
  if (profileHandle !== switcherHandle) {
    return { status: "unknown", reason: "disagreement" };
  }
  return { status: "known", handle: profileHandle };
}
