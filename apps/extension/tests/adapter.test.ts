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
      <button data-testid="like" aria-label="7 Likes. Like">
        <span data-testid="app-text-transition-container">7</span>
      </button>
    </article>
    <article data-testid="tweet" id="other-post">
      <div data-testid="User-Name"><a href="/beta_user">Beta</a></div>
      <button data-testid="retweet" aria-label="3 reposts. Repost">
        <span data-testid="app-text-transition-container">3</span>
      </button>
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
    expect(
      document.querySelector('#self-post [data-testid="like"]')?.getAttribute("aria-label"),
    ).toBe("7 Likes. Like");
  });
});
