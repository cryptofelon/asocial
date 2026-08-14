interface NativeActionDefinition {
  key: "reply" | "repost" | "analytics" | "bookmark" | "share";
  selectors: string;
  label: (element: HTMLElement) => string;
}

interface ResolvedAction {
  definition: NativeActionDefinition;
  element: HTMLElement;
  label: string;
}

const POST_SELECTOR = 'article[data-testid="tweet"]';

const ACTIONS: readonly NativeActionDefinition[] = [
  {
    key: "reply",
    selectors: '[data-testid="reply"]',
    label: () => "Reply",
  },
  {
    key: "repost",
    selectors: '[data-testid="retweet"], [data-testid="unretweet"]',
    label: () => "Repost / quote",
  },
  {
    key: "analytics",
    selectors: 'a[href$="/analytics"], [data-testid="analytics"]',
    label: () => "View analytics",
  },
  {
    key: "bookmark",
    selectors: '[data-testid="bookmark"], [data-testid="removeBookmark"]',
    label: (element) =>
      element.getAttribute("data-testid") === "removeBookmark" ? "Remove bookmark" : "Bookmark",
  },
  {
    key: "share",
    selectors: '[data-testid="share"]',
    label: () => "Share",
  },
];

function belongsToArticle(element: Element, article: HTMLElement): boolean {
  return element.closest(POST_SELECTOR) === article;
}

function findNativeAction(
  article: HTMLElement,
  definition: NativeActionDefinition,
): HTMLElement | undefined {
  return [...article.querySelectorAll<HTMLElement>(definition.selectors)].find((element) =>
    belongsToArticle(element, article),
  );
}

function resolveActions(article: HTMLElement): ResolvedAction[] {
  const resolved: ResolvedAction[] = [];
  for (const definition of ACTIONS) {
    const element = findNativeAction(article, definition);
    if (element) resolved.push({ definition, element, label: definition.label(element) });
  }
  return resolved;
}

function findActionBar(
  article: HTMLElement,
  actions: readonly ResolvedAction[],
): HTMLElement | undefined {
  const scores = new Map<HTMLElement, number>();
  for (const action of actions) {
    const group = action.element.closest<HTMLElement>('[role="group"]');
    if (!group || !belongsToArticle(group, article)) continue;
    scores.set(group, (scores.get(group) ?? 0) + 1);
  }

  let best: HTMLElement | undefined;
  let bestScore = 1;
  for (const [group, score] of scores) {
    if (score > bestScore) {
      best = group;
      bestScore = score;
    }
  }
  return best;
}

function getTrigger(wrapper: HTMLElement): HTMLButtonElement {
  const trigger = wrapper.querySelector<HTMLButtonElement>("[data-asocial-compact-trigger]");
  if (!trigger) throw new Error("Compact action trigger is missing");
  return trigger;
}

function getMenu(wrapper: HTMLElement): HTMLElement {
  const menu = wrapper.querySelector<HTMLElement>("[data-asocial-compact-menu]");
  if (!menu) throw new Error("Compact action menu is missing");
  return menu;
}
function positionMenu(wrapper: HTMLElement, menu: HTMLElement): void {
  menu.dataset.asocialCompactPlacement = "below";
  const wrapperRect = wrapper.getBoundingClientRect();
  const menuHeight = menu.getBoundingClientRect().height;
  const viewportHeight =
    wrapper.ownerDocument.defaultView?.innerHeight ??
    wrapper.ownerDocument.documentElement.clientHeight;
  const gap = 4;
  if (
    viewportHeight - wrapperRect.bottom < menuHeight + gap &&
    wrapperRect.top >= menuHeight + gap
  ) {
    menu.dataset.asocialCompactPlacement = "above";
  }
}

function setOpen(wrapper: HTMLElement, open: boolean, focusFirst = false): void {
  const trigger = getTrigger(wrapper);
  const menu = getMenu(wrapper);
  if (open) {
    wrapper.ownerDocument
      .querySelectorAll<HTMLElement>("[data-asocial-compact-actions]")
      .forEach((other) => {
        if (other !== wrapper) setOpen(other, false);
      });
  }
  trigger.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
  if (open) positionMenu(wrapper, menu);
  if (open && focusFirst) menu.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
}

function handleKeyboard(event: KeyboardEvent, wrapper: HTMLElement): void {
  const trigger = getTrigger(wrapper);
  const menu = getMenu(wrapper);
  if (event.key === "Escape") {
    if (menu.hidden) return;
    event.preventDefault();
    setOpen(wrapper, false);
    trigger.focus();
    return;
  }

  if (
    event.key !== "ArrowDown" &&
    event.key !== "ArrowUp" &&
    event.key !== "Home" &&
    event.key !== "End"
  ) {
    return;
  }
  event.preventDefault();
  if (menu.hidden) setOpen(wrapper, true);
  const items = [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
  if (items.length === 0) return;
  const current = items.indexOf(wrapper.ownerDocument.activeElement as HTMLButtonElement);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : event.key === "ArrowDown"
          ? (current + 1 + items.length) % items.length
          : (current - 1 + items.length) % items.length;
  items[next]?.focus();
}

function createWrapper(article: HTMLElement): HTMLElement {
  const document = article.ownerDocument;
  const wrapper = document.createElement("div");
  wrapper.dataset.asocialCompactActions = "";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.dataset.asocialCompactTrigger = "";
  trigger.setAttribute("aria-label", "asocial post actions");
  trigger.title = "asocial post actions";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.textContent = "•••";

  const menu = document.createElement("div");
  menu.dataset.asocialCompactMenu = "";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "asocial post actions");
  menu.hidden = true;

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const opening = menu.hidden !== false;
    setOpen(wrapper, opening, opening);
  });
  wrapper.addEventListener("click", (event) => event.stopPropagation());
  wrapper.addEventListener("keydown", (event) => handleKeyboard(event, wrapper));
  wrapper.addEventListener("focusout", () => {
    queueMicrotask(() => {
      if (!wrapper.contains(document.activeElement)) setOpen(wrapper, false);
    });
  });
  wrapper.append(trigger, menu);
  return wrapper;
}

function renderMenu(
  wrapper: HTMLElement,
  article: HTMLElement,
  actions: readonly ResolvedAction[],
): void {
  const signature = actions.map((action) => `${action.definition.key}:${action.label}`).join("|");
  if (wrapper.dataset.asocialCompactSignature === signature) return;

  const menu = getMenu(wrapper);
  setOpen(wrapper, false);
  menu.replaceChildren();
  for (const action of actions) {
    const item = article.ownerDocument.createElement("button");
    item.type = "button";
    item.setAttribute("role", "menuitem");
    item.dataset.asocialCompactAction = action.definition.key;
    item.textContent = action.label;
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(wrapper, false);
      getTrigger(wrapper).focus();
      findNativeAction(article, action.definition)?.click();
    });
    menu.append(item);
  }
  wrapper.dataset.asocialCompactSignature = signature;
}

function clearArticle(article: HTMLElement): void {
  article.querySelectorAll<HTMLElement>("[data-asocial-native-action-cell]").forEach((element) => {
    if (belongsToArticle(element, article))
      element.removeAttribute("data-asocial-native-action-cell");
  });
  article.querySelectorAll<HTMLElement>("[data-asocial-action-bar]").forEach((element) => {
    if (belongsToArticle(element, article)) element.removeAttribute("data-asocial-action-bar");
  });
  article.querySelectorAll<HTMLElement>("[data-asocial-compact-actions]").forEach((element) => {
    if (belongsToArticle(element, article)) element.remove();
  });
}

export function syncCompactActionMenu(article: HTMLElement, enabled: boolean): boolean {
  if (!enabled) {
    clearArticle(article);
    return false;
  }

  const actions = resolveActions(article);
  const actionBar = findActionBar(article, actions);
  if (!actionBar || actions.length === 0) {
    clearArticle(article);
    return false;
  }

  let wrapper = [...article.querySelectorAll<HTMLElement>("[data-asocial-compact-actions]")].find(
    (element) => belongsToArticle(element, article),
  );
  if (wrapper && wrapper.parentElement !== actionBar) {
    wrapper.remove();
    wrapper = undefined;
  }
  wrapper ??= createWrapper(article);

  article.querySelectorAll<HTMLElement>("[data-asocial-native-action-cell]").forEach((element) => {
    if (belongsToArticle(element, article))
      element.removeAttribute("data-asocial-native-action-cell");
  });
  for (const child of actionBar.children) {
    if (child !== wrapper && child instanceof HTMLElement) {
      child.dataset.asocialNativeActionCell = "";
    }
  }
  actionBar.dataset.asocialActionBar = "";
  if (!wrapper.isConnected) actionBar.append(wrapper);
  renderMenu(wrapper, article, actions);
  return true;
}

export function removeCompactActionMenus(document: Document): void {
  document
    .querySelectorAll("[data-asocial-compact-actions]")
    .forEach((element) => element.remove());
  document.querySelectorAll("[data-asocial-native-action-cell]").forEach((element) => {
    element.removeAttribute("data-asocial-native-action-cell");
  });
  document.querySelectorAll("[data-asocial-action-bar]").forEach((element) => {
    element.removeAttribute("data-asocial-action-bar");
  });
}
