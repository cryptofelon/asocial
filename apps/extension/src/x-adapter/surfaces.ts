import type { SettingsV1 } from "../settings/model";
import type { PatchLedger } from "../runtime/patch-ledger";
import type { ActiveAccount } from "./active-account";
import { classifyPostOwnership, type Ownership } from "./ownership";
import { syncCompactActionMenu } from "./compact-actions";
import { handleFromHref } from "./routes";

const ACTION_LABEL_BY_TEST_ID: Readonly<Record<string, string>> = {
  bookmark: "Bookmark",
  like: "Like",
  removeBookmark: "Remove bookmark",
  reply: "Reply",
  retweet: "Repost",
  unlike: "Unlike",
  unretweet: "Undo repost",
};

function forEachMatch(root: Element, selector: string, visit: (element: Element) => void): void {
  if (root.matches(selector)) visit(root);
  root.querySelectorAll(selector).forEach(visit);
}

function annotateActionMetrics(
  article: HTMLElement,
  ownership: Ownership,
  hideMetrics: boolean,
  ledger: PatchLedger,
): void {
  article.dataset.asocialOwner = ownership;
  forEachMatch(article, "[data-testid]", (candidate) => {
    const testId = candidate.getAttribute("data-testid");
    if (!testId) return;
    const actionLabel = ACTION_LABEL_BY_TEST_ID[testId];
    if (!actionLabel) return;
    candidate.querySelectorAll('[data-testid="app-text-transition-container"]').forEach((count) => {
      (count as HTMLElement).dataset.asocialMetric = "count";
    });
    if (hideMetrics) ledger.setAriaLabel(candidate, actionLabel);
  });

  forEachMatch(article, 'a[href$="/analytics"]', (analyticsLink) => {
    analyticsLink
      .querySelectorAll('[data-testid="app-text-transition-container"]')
      .forEach((count) => {
        (count as HTMLElement).dataset.asocialMetric = "views";
      });
    if (hideMetrics) ledger.setAriaLabel(analyticsLink, "View post analytics");
  });
}

export function annotatePosts(
  root: Element,
  activeAccount: ActiveAccount,
  settings: SettingsV1,
  ledger: PatchLedger,
): number {
  const articles = new Set<HTMLElement>();
  const containingArticle = root.closest<HTMLElement>('article[data-testid="tweet"]');
  if (containingArticle) articles.add(containingArticle);
  forEachMatch(root, 'article[data-testid="tweet"]', (element) => {
    articles.add(element as HTMLElement);
  });

  for (const article of articles) {
    const ownership = classifyPostOwnership(article, activeAccount);
    const hideMetrics = settings.metricScope === "all" || ownership !== "other";
    annotateActionMetrics(article, ownership, hideMetrics, ledger);
    syncCompactActionMenu(article, settings.mode === "low-dopamine" && ownership === "self");
  }
  return articles.size;
}

export function annotateProfileMetrics(root: Element, activeAccount: ActiveAccount): number {
  let count = 0;
  forEachMatch(
    root,
    'a[href$="/following"], a[href$="/followers"], a[href$="/verified_followers"]',
    (element) => {
      const link = element as HTMLAnchorElement;
      const profileHandle = handleFromHref(link.getAttribute("href"));
      let ownership: Ownership = "unknown";
      if (activeAccount.status === "known" && profileHandle) {
        ownership = profileHandle === activeAccount.handle ? "self" : "other";
      }
      link.dataset.asocialProfileMetric = "connections";
      link.dataset.asocialOwner = ownership;
      count += 1;
    },
  );
  return count;
}

export function annotateAttentionSurfaces(root: Element): void {
  const navBadges: ReadonlyArray<{
    selector: string;
    kind: "notifications" | "messages";
  }> = [
    {
      selector: '[data-testid="AppTabBar_Notifications_Link"]',
      kind: "notifications",
    },
    { selector: '[data-testid="AppTabBar_DirectMessage_Link"]', kind: "messages" },
  ];

  for (const target of navBadges) {
    forEachMatch(root, target.selector, (link) => {
      link.querySelectorAll('[data-testid="app-text-transition-container"]').forEach((badge) => {
        (badge as HTMLElement).dataset.asocialBadge = target.kind;
      });
    });
  }

  forEachMatch(root, '[data-testid="trend"]', (trend) => {
    (trend as HTMLElement).dataset.asocialSurface = "trends";
  });
  forEachMatch(root, 'aside [data-testid="UserCell"]', (cell) => {
    (cell as HTMLElement).dataset.asocialSurface = "account-suggestions";
  });
  forEachMatch(
    root,
    'a[href="/i/premium_sign_up"], a[href="/i/premium"], a[href="/i/account_analytics"], a[href="/i/monetization"]',
    (link) => {
      (link as HTMLElement).dataset.asocialSurface = "premium";
    },
  );
}

export function annotateRecommendedPosts(document: Document): number {
  let count = 0;
  const headings = document.querySelectorAll(
    '[data-testid="primaryColumn"] [data-testid="cellInnerDiv"] h2[role="heading"]',
  );
  for (const heading of headings) {
    const description = heading.nextElementSibling;
    if (
      !(description instanceof HTMLElement) ||
      description.tagName !== "DIV" ||
      !description.hasAttribute("dir")
    ) {
      continue;
    }
    let cell = heading.closest<HTMLElement>('[data-testid="cellInnerDiv"]')?.nextElementSibling;
    while (cell) {
      const next = cell.nextElementSibling;
      if (cell.querySelector('article[data-testid="tweet"]')) {
        (cell as HTMLElement).dataset.asocialSurface = "recommended-posts";
        count += 1;
      }
      cell = next;
    }
  }
  return count;
}
