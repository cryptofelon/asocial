const POLICY_ATTRIBUTES = [
  "data-asocial-hide-account-suggestions",
  "data-asocial-hide-premium",
  "data-asocial-hide-recommended-posts",
  "data-asocial-hide-trends",
  "data-asocial-message-badges",
  "data-asocial-metric-scope",
  "data-asocial-mode",
  "data-asocial-notification-badges",
  "data-asocial-route",
] as const;

export function clearPolicyState(html: HTMLElement): void {
  for (const attribute of POLICY_ATTRIBUTES) html.removeAttribute(attribute);
}
