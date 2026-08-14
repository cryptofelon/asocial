import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings/model";
import { XAdapter } from "../src/x-adapter/adapter";

function renderFixture(): void {
  document.body.innerHTML = `
    <nav>
      <a data-testid="AppTabBar_Profile_Link" href="/alpha_user">Profile</a>
      <button data-testid="SideNav_AccountSwitcher_Button">Name @alpha_user</button>
    </nav>
    <article data-testid="tweet" id="self-post">
      <div data-testid="User-Name"><a href="/alpha_user">Alpha</a></div>
      <div id="self-actions" role="group" aria-label="Post actions">
        <div><button data-testid="reply">Reply</button></div>
        <div><button data-testid="retweet">Repost</button></div>
        <div>
          <button data-testid="like" aria-label="7 Likes. Like">
            <span data-testid="app-text-transition-container">7</span>
          </button>
        </div>
        <div><a href="/alpha_user/status/1/analytics">Analytics</a></div>
        <div><button data-testid="bookmark">Bookmark</button></div>
        <div><button data-testid="share">Share</button></div>
      </div>
    </article>
    <article data-testid="tweet" id="other-post">
      <div data-testid="User-Name"><a href="/beta_user">Beta</a></div>
      <div id="other-actions" role="group" aria-label="Post actions">
        <div><button data-testid="reply">Reply</button></div>
        <div>
          <button data-testid="retweet" aria-label="3 reposts. Repost">
            <span data-testid="app-text-transition-container">3</span>
          </button>
        </div>
        <div><button data-testid="like">Like</button></div>
      </div>
    </article>
    <a id="followers" href="/alpha_user/followers">42 followers</a>
  `;
}

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute("data-asocial-mode");
});

describe("XAdapter", () => {
  it("classifies ownership, hides only numeric nodes, and restores exact labels", () => {
    renderFixture();
    const adapter = new XAdapter(document);
    const status = adapter.apply({ ...DEFAULT_SETTINGS, mode: "low-dopamine" }, [
      document.documentElement,
    ]);

    expect(status).toMatchObject({
      activeAccount: "known",
      degraded: false,
      postCount: 2,
      metricCount: 2,
    });
    expect(document.querySelector("#self-post")?.getAttribute("data-asocial-owner")).toBe("self");
    expect(document.querySelector("#other-post")?.getAttribute("data-asocial-owner")).toBe("other");
    expect(
      document.querySelector('#self-post [data-testid="like"]')?.getAttribute("aria-label"),
    ).toBe("Like");
    expect(
      document.querySelector('#other-post [data-testid="retweet"]')?.getAttribute("aria-label"),
    ).toBe("3 reposts. Repost");
    expect(document.querySelector("#followers")?.getAttribute("data-asocial-owner")).toBe("self");

    adapter.reset();
    expect(document.querySelector("[data-asocial-owner]")).toBeNull();
    expect(document.querySelector("[data-asocial-metric]")).toBeNull();
    expect(
      document.querySelector('#self-post [data-testid="like"]')?.getAttribute("aria-label"),
    ).toBe("7 Likes. Like");
    expect(document.querySelector("[data-asocial-compact-actions]")).toBeNull();
    expect(document.querySelector("[data-asocial-native-action-cell]")).toBeNull();
  });

  it("replaces only self-post actions with an accessible native-action proxy", () => {
    renderFixture();
    const adapter = new XAdapter(document);
    const settings = { ...DEFAULT_SETTINGS, mode: "low-dopamine" } as const;
    const nativeRepost = document.querySelector<HTMLButtonElement>(
      '#self-post [data-testid="retweet"]',
    );
    let repostClicks = 0;
    nativeRepost?.addEventListener("click", () => {
      repostClicks += 1;
    });

    adapter.apply(settings, [document.documentElement]);

    const wrapper = document.querySelector<HTMLElement>(
      "#self-post [data-asocial-compact-actions]",
    );
    const trigger = wrapper?.querySelector<HTMLButtonElement>("[data-asocial-compact-trigger]");
    const menu = wrapper?.querySelector<HTMLElement>("[data-asocial-compact-menu]");
    expect(wrapper?.parentElement?.id).toBe("self-actions");
    expect(
      document.querySelectorAll("#self-actions [data-asocial-native-action-cell]"),
    ).toHaveLength(6);
    expect(document.querySelector("#other-post [data-asocial-compact-actions]")).toBeNull();
    expect(
      [...(menu?.querySelectorAll("[data-asocial-compact-action]") ?? [])].map((item) =>
        item.getAttribute("data-asocial-compact-action"),
      ),
    ).toEqual(["reply", "repost", "analytics", "bookmark", "share"]);

    trigger?.click();
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    expect(menu?.hidden).toBe(false);
    menu?.querySelector<HTMLButtonElement>('[data-asocial-compact-action="repost"]')?.click();
    expect(repostClicks).toBe(1);
    expect(menu?.hidden).toBe(true);

    const nativeBookmark = document.querySelector<HTMLElement>(
      '#self-post [data-testid="bookmark"]',
    );
    nativeBookmark?.setAttribute("data-testid", "removeBookmark");
    adapter.apply(settings, [nativeBookmark ?? document.documentElement]);
    expect(document.querySelector('[data-asocial-compact-action="bookmark"]')?.textContent).toBe(
      "Remove bookmark",
    );

    trigger?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
    expect(menu?.hidden).toBe(false);
    expect(document.activeElement?.getAttribute("data-asocial-compact-action")).toBe("reply");
    trigger?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    expect(menu?.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it("compacts a self-authored quote post without absorbing quoted-post actions", () => {
    document.body.innerHTML = `
      <a data-testid="AppTabBar_Profile_Link" href="/alpha_user">Profile</a>
      <button data-testid="SideNav_AccountSwitcher_Button">@alpha_user</button>
      <article data-testid="tweet" id="self-quote">
        <div data-testid="User-Name"><a href="/alpha_user">Alpha</a></div>
        <div id="outer-actions" role="group">
          <div><button data-testid="reply">Reply</button></div>
          <div><button data-testid="share">Share</button></div>
        </div>
        <article data-testid="tweet" id="quoted-post">
          <div data-testid="User-Name"><a href="/beta_user">Beta</a></div>
          <div id="quoted-actions" role="group">
            <div><button data-testid="retweet">Repost</button></div>
            <div><button data-testid="bookmark">Bookmark</button></div>
          </div>
        </article>
      </article>
    `;
    const adapter = new XAdapter(document);
    adapter.apply({ ...DEFAULT_SETTINGS, mode: "low-dopamine" }, [document.documentElement]);

    expect(
      [...document.querySelectorAll("#outer-actions [data-asocial-compact-action]")].map((item) =>
        item.getAttribute("data-asocial-compact-action"),
      ),
    ).toEqual(["reply", "share"]);
    expect(document.querySelector("#quoted-post [data-asocial-compact-actions]")).toBeNull();
    expect(document.querySelector("#quoted-actions [data-asocial-native-action-cell]")).toBeNull();
  });

  it("reclassifies the full page during an account switch", () => {
    renderFixture();
    const adapter = new XAdapter(document);
    adapter.apply({ ...DEFAULT_SETTINGS, mode: "low-dopamine" }, [document.documentElement]);

    const profile = document.querySelector<HTMLAnchorElement>(
      '[data-testid="AppTabBar_Profile_Link"]',
    );
    const switcher = document.querySelector<HTMLElement>(
      '[data-testid="SideNav_AccountSwitcher_Button"]',
    );
    profile?.setAttribute("href", "/beta_user");
    if (switcher) switcher.textContent = "Name @beta_user";
    adapter.apply({ ...DEFAULT_SETTINGS, mode: "low-dopamine" }, [
      switcher ?? document.documentElement,
    ]);

    expect(document.querySelector("#self-post")?.getAttribute("data-asocial-owner")).toBe("other");
    expect(document.querySelector("#other-post")?.getAttribute("data-asocial-owner")).toBe("self");
    expect(document.querySelector("#self-post [data-asocial-compact-actions]")).toBeNull();
    expect(document.querySelector("#other-post [data-asocial-compact-actions]")).not.toBeNull();
    expect(
      document.querySelector('#self-post [data-testid="like"]')?.getAttribute("aria-label"),
    ).toBe("7 Likes. Like");
  });
});
