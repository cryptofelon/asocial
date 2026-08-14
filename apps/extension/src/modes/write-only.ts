import { classifyRoute, type XRoute } from "../x-adapter/routes";

function forEachMatch(
  root: Element,
  selector: string,
  visit: (element: HTMLElement) => void,
): void {
  if (root.matches(selector)) visit(root as HTMLElement);
  root.querySelectorAll<HTMLElement>(selector).forEach(visit);
}

export interface WriteOnlyStatus {
  route: XRoute;
  composerReady: boolean;
  accountSwitcherReady: boolean;
}

export function applyWriteOnlyAllowlist(
  document: Document,
  roots: readonly Element[],
): WriteOnlyStatus {
  for (const root of roots) {
    forEachMatch(root, '[role="dialog"]', (dialog) => {
      const hasEditor = Boolean(dialog.querySelector('[data-testid="tweetTextarea_0"]'));
      const hasSubmit = Boolean(
        dialog.querySelector('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]'),
      );
      if (hasEditor && hasSubmit) dialog.dataset.asocialAllowed = "composer";
    });

    forEachMatch(root, '[data-testid="Dropdown"], [role="menu"]', (menu) => {
      const hasAccountAction = Boolean(
        menu.querySelector(
          '[data-testid="AccountSwitcher_AddAccount_Button"], a[href^="/i/flow/login"], a[href^="/settings/manage_accounts"]',
        ),
      );
      if (hasAccountAction) menu.dataset.asocialAllowed = "account-switcher";
    });

    forEachMatch(root, '[role="alert"]', (alert) => {
      alert.dataset.asocialAllowed = "alert";
    });
  }

  return {
    route: classifyRoute(document.location.pathname),
    composerReady: Boolean(document.querySelector('[data-asocial-allowed="composer"]')),
    accountSwitcherReady: Boolean(
      document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]'),
    ),
  };
}

export function clearWriteOnlyAllowlist(document: Document): void {
  document.querySelectorAll("[data-asocial-allowed]").forEach((element) => {
    element.removeAttribute("data-asocial-allowed");
  });
}
