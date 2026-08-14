import type { ActiveAccount } from "./active-account";
import { handleFromHref } from "./routes";

export type Ownership = "self" | "other" | "unknown";

export function classifyPostOwnership(
  article: ParentNode,
  activeAccount: ActiveAccount,
): Ownership {
  if (activeAccount.status !== "known") return "unknown";
  const authorLink = article.querySelector<HTMLAnchorElement>('[data-testid="User-Name"] a[href]');
  const author = handleFromHref(authorLink?.getAttribute("href") ?? null);
  if (!author) return "unknown";
  return author === activeAccount.handle ? "self" : "other";
}

export function classifyProfileOwnership(
  pathname: string,
  activeAccount: ActiveAccount,
): Ownership {
  if (activeAccount.status !== "known") return "unknown";
  const profile = handleFromHref(pathname);
  if (!profile) return "unknown";
  return profile === activeAccount.handle ? "self" : "other";
}
