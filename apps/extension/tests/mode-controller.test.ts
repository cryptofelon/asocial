import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/settings/model";
import { ModeController } from "../src/runtime/mode-controller";

afterEach(() => {
  document.body.replaceChildren();
  for (const attribute of document.documentElement.getAttributeNames()) {
    if (attribute.startsWith("data-asocial-")) {
      document.documentElement.removeAttribute(attribute);
    }
  }
  window.history.replaceState(null, "", "/");
});

describe("ModeController", () => {
  it("restores the original DOM exactly when returning to Normal", () => {
    document.body.innerHTML = `
      <a data-testid="AppTabBar_Profile_Link" href="/alpha_user">Profile</a>
      <button data-testid="SideNav_AccountSwitcher_Button">@alpha_user</button>
      <article data-testid="tweet">
        <div data-testid="User-Name"><a href="/alpha_user">Alpha</a></div>
        <button data-testid="like" aria-label="9 Likes. Like">
          <span data-testid="app-text-transition-container">9</span>
        </button>
      </article>
    `;
    const controller = new ModeController(document);
    controller.apply({ ...DEFAULT_SETTINGS, mode: "low-dopamine" });

    expect(document.documentElement.dataset.asocialMode).toBe("low-dopamine");
    expect(
      document.querySelector('[data-testid="tweet"]')?.getAttribute("data-asocial-owner"),
    ).toBe("self");
    expect(document.querySelector('[data-testid="like"]')?.getAttribute("aria-label")).toBe("Like");

    controller.apply({ ...DEFAULT_SETTINGS, mode: "normal" });
    expect(document.documentElement.hasAttribute("data-asocial-mode")).toBe(false);
    expect(document.querySelector("[data-asocial-owner]")).toBeNull();
    expect(document.querySelector('[data-testid="like"]')?.getAttribute("aria-label")).toBe(
      "9 Likes. Like",
    );
    expect(document.querySelector("#asocial-root")).toBeNull();
    controller.dispose();
  });

  it("reveals only a validated native composer without mounting extension UI", async () => {
    window.history.replaceState(null, "", "/compose/post");
    document.body.innerHTML = `
      <div id="react-root">
        X content
        <button data-testid="SideNav_AccountSwitcher_Button">@alpha_user</button>
      </div>
    `;
    const controller = new ModeController(document);
    controller.apply({ ...DEFAULT_SETTINGS, mode: "write-only" });

    expect(document.querySelector("#asocial-root")).toBeNull();
    expect(document.documentElement.dataset.asocialStartup).toBe("ready");

    const composer = document.createElement("div");
    composer.innerHTML = `
      <section><div data-testid="tweetTextarea_0" contenteditable="true"></div></section>
      <footer><button data-testid="tweetButton">Post</button></footer>
    `;
    document.querySelector("#react-root")?.append(composer);

    await vi.waitFor(() => {
      expect(composer.dataset.asocialAllowed).toBe("composer");
    });

    const accountMenu = document.createElement("div");
    accountMenu.setAttribute("role", "menu");
    accountMenu.innerHTML =
      '<button data-testid="AccountSwitcher_AddAccount_Button">Add account</button>';
    document.querySelector("#react-root")?.append(accountMenu);
    await vi.waitFor(() => {
      expect(accountMenu.dataset.asocialAllowed).toBe("account-switcher");
    });

    controller.apply({ ...DEFAULT_SETTINGS, mode: "normal" });
    expect(composer.hasAttribute("data-asocial-allowed")).toBe(false);
    expect(accountMenu.hasAttribute("data-asocial-allowed")).toBe(false);
    controller.dispose();
  });
});
