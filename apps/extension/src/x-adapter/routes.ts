export type XRoute = "auth" | "compose" | "status" | "reading";

const RESERVED_SEGMENTS: Readonly<Record<string, true>> = {
  compose: true,
  explore: true,
  home: true,
  i: true,
  login: true,
  messages: true,
  notifications: true,
  search: true,
  settings: true,
};

export function classifyRoute(pathname: string): XRoute {
  if (
    pathname === "/login" ||
    pathname.startsWith("/i/flow/login") ||
    pathname.startsWith("/account/access") ||
    pathname.startsWith("/i/flow/signup")
  ) {
    return "auth";
  }
  if (pathname.startsWith("/compose/post")) return "compose";
  if (/^\/[A-Za-z0-9_]+\/status\/\d+/.test(pathname)) return "status";
  return "reading";
}

export function handleFromHref(href: string | null): string | undefined {
  if (!href) return undefined;
  let pathname: string;
  try {
    pathname = new URL(href, "https://x.com").pathname;
  } catch {
    return undefined;
  }

  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0]?.toLowerCase();
  if (
    segments.length === 0 ||
    !candidate ||
    RESERVED_SEGMENTS[candidate] ||
    !/^[a-z0-9_]{1,15}$/.test(candidate)
  ) {
    return undefined;
  }
  return candidate;
}
