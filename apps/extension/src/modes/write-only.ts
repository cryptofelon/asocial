import { classifyRoute, type XRoute } from "../x-adapter/routes";
const EDITOR_SELECTOR = '[data-testid^="tweetTextarea_"]';
const SUBMIT_SELECTOR = '[data-testid="tweetButton"], [data-testid="tweetButtonInline"]';

function findComposerContainer(editor: HTMLElement, document: Document): HTMLElement | undefined {
  const dialog = editor.closest<HTMLElement>('[role="dialog"]');
  if (dialog?.querySelector(SUBMIT_SELECTOR)) return dialog;

  let candidate = editor.parentElement;
  while (candidate && candidate !== document.body) {
    if (candidate.querySelector(SUBMIT_SELECTOR)) return candidate;
    candidate = candidate.parentElement;
  }
  return undefined;
}

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
  document
    .querySelectorAll<HTMLElement>('[data-asocial-allowed="composer"]')
    .forEach((element) => element.removeAttribute("data-asocial-allowed"));
  document.querySelectorAll<HTMLElement>(EDITOR_SELECTOR).forEach((editor) => {
    const composer = findComposerContainer(editor, document);
    if (composer) composer.dataset.asocialAllowed = "composer";
  });

  for (const root of roots) {
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
