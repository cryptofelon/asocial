import { expect, test, chromium, type BrowserContext, type Page } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
declare const chrome: {
  tabs: {
    query: (query: { url: string }) => Promise<Array<{ id?: number }>>;
    sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
  };
};

const extensionPath = path.resolve(import.meta.dirname, "../../.output/chrome-mv3");
const bravePath = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";

function fixtureHtml(includeComposer = false): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Synthetic X fixture</title></head>
  <body>
    <div id="react-root">
      <nav>
        <a data-testid="AppTabBar_Profile_Link" href="/alpha_user">Profile</a>
        <button data-testid="SideNav_AccountSwitcher_Button">@alpha_user</button>
        <a data-testid="AppTabBar_Notifications_Link" href="/notifications">
          Notifications <span data-testid="app-text-transition-container">3</span>
        </a>
        <a data-testid="AppTabBar_DirectMessage_Link" href="/messages">
          Messages <span data-testid="app-text-transition-container">2</span>
        </a>
      </nav>
      <main data-testid="primaryColumn">
        <a id="following" href="/alpha_user/following">15 Following</a>
        <a id="followers" href="/alpha_user/followers">20 Followers</a>
        <article id="self-post" data-testid="tweet">
          <div data-testid="User-Name"><a href="/alpha_user">Alpha</a></div>
          <button data-testid="like" aria-label="7 Likes. Like">
            Like <span data-testid="app-text-transition-container">7</span>
          </button>
        </article>
        <article id="other-post" data-testid="tweet">
          <div data-testid="User-Name"><a href="/other_user">Other</a></div>
          <button data-testid="like" aria-label="9 Likes. Like">
            Like <span data-testid="app-text-transition-container">9</span>
          </button>
        </article>
        <section data-testid="trend">Trending topic</section>
        <aside><div data-testid="UserCell">Suggested account</div></aside>
        <a href="/i/premium">Premium</a>
      </main>
        ${
          includeComposer
            ? `<div id="native-composer">
                 <section><div data-testid="tweetTextarea_0" contenteditable="true"></div></section>
                 <footer><button data-testid="tweetButton">Post</button></footer>
               </div>`
            : ""
        }
    </div>
  </body>
</html>`;
}

async function findExtensionId(page: Page): Promise<string> {
  await page.goto("chrome://extensions/");
  const handle = await page.waitForFunction(() => {
    const manager = document.querySelector("extensions-manager");
    const list = manager?.shadowRoot?.querySelector("extensions-item-list");
    const items = list?.shadowRoot?.querySelectorAll("extensions-item") ?? [];
    for (const item of items) {
      const name = item.shadowRoot?.querySelector("#name")?.textContent?.trim();
      if (name === "asocial") return item.getAttribute("id");
    }
    return false;
  });
  const id = await handle.jsonValue();
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Brave did not load the unpacked asocial extension");
  }
  return id;
}

async function selectMode(optionsPage: Page, value: string): Promise<void> {
  const radio = optionsPage.locator(`input[name="mode"][value="${value}"]`);
  await radio.click();
  await expect(radio).toBeChecked();
  await expect(radio).toBeEnabled();
}

async function computed(page: Page, selector: string, property: string): Promise<string> {
  return page
    .locator(selector)
    .evaluate(
      (element, propertyName) => getComputedStyle(element).getPropertyValue(propertyName),
      property,
    );
}

test("applies and restores real extension modes in isolated Brave", async () => {
  const profilePath = await mkdtemp(path.join(tmpdir(), "asocial-e2e-"));
  let context: BrowserContext | undefined;

  try {
    const useBrave = process.env.ASOCIAL_E2E_BROWSER === "brave";
    context = await chromium.launchPersistentContext(profilePath, {
      ...(useBrave ? { executablePath: bravePath } : {}),
      headless: false,
      viewport: { width: 1280, height: 900 },
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--no-first-run",
        "--disable-default-apps",
      ],
    });

    await context.route("https://x.com/**", async (route) => {
      if (route.request().isNavigationRequest()) {
        const includeComposer = new URL(route.request().url()).pathname === "/compose/post";
        await route.fulfill({
          status: 200,
          contentType: "text/html",
          body: fixtureHtml(includeComposer),
        });
      } else {
        await route.abort();
      }
    });

    const managerPage = context.pages()[0] ?? (await context.newPage());
    const extensionId = await findExtensionId(managerPage);
    const optionsPage = await context.newPage();
    await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
    await expect(optionsPage.getByRole("heading", { name: "Attention settings" })).toBeVisible();

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popupPage.locator("main")).toBeVisible();
    await selectMode(optionsPage, "low-dopamine");
    const xPage = await context.newPage();
    await xPage.goto("https://x.com/home");
    await xPage.waitForFunction(() => document.documentElement.dataset.asocialAdapter === "ready");

    const lowDopamineStatus = await optionsPage.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ url: "https://x.com/*" });
      if (tab?.id === undefined) throw new Error("Synthetic X tab not found");
      return chrome.tabs.sendMessage(tab.id, {
        type: "asocial:get-runtime-status",
      });
    });
    expect(lowDopamineStatus).toMatchObject({
      mode: "low-dopamine",
      adapter: "ready",
      route: "reading",
    });

    await expect(xPage.locator("#self-post")).toHaveAttribute("data-asocial-owner", "self");
    await expect(xPage.locator("#other-post")).toHaveAttribute("data-asocial-owner", "other");
    await expect(xPage.locator("#self-post [data-testid=like]")).toHaveAttribute(
      "aria-label",
      "Like",
    );
    expect(await computed(xPage, "#self-post [data-asocial-metric]", "display")).toBe("none");
    expect(await computed(xPage, "#other-post [data-asocial-metric]", "display")).not.toBe("none");
    expect(await computed(xPage, "#following", "display")).toBe("none");
    expect(await computed(xPage, '[data-testid="trend"]', "display")).toBe("none");
    expect(await computed(xPage, 'aside [data-testid="UserCell"]', "display")).not.toBe("none");
    expect(await computed(xPage, 'a[href="/i/premium"]', "display")).toBe("none");
    expect(
      Number(await computed(xPage, '[data-asocial-badge="notifications"]', "opacity")),
    ).toBeLessThan(1);

    await xPage.locator("#self-post [data-testid=like]").evaluate((button) => {
      button.addEventListener("click", () => {
        (button as HTMLElement).dataset.clicked = "true";
      });
    });
    await xPage.locator("#self-post [data-testid=like]").click();
    await expect(xPage.locator("#self-post [data-testid=like]")).toHaveAttribute(
      "data-clicked",
      "true",
    );

    await selectMode(popupPage, "write-only");
    await expect(xPage).toHaveURL("https://x.com/compose/post");
    await xPage.waitForFunction(
      () =>
        document.documentElement.dataset.asocialMode === "write-only" &&
        document.documentElement.dataset.asocialAdapter === "ready",
    );
    await expect(xPage.locator("#asocial-root")).toHaveCount(0);
    await expect(xPage.locator("#native-composer")).toHaveAttribute(
      "data-asocial-allowed",
      "composer",
    );
    expect(await computed(xPage, "#react-root", "visibility")).toBe("hidden");
    expect(await computed(xPage, "#native-composer", "visibility")).toBe("visible");

    const editor = xPage.locator('#native-composer [contenteditable="true"]');
    const submit = xPage.locator('#native-composer [data-testid="tweetButton"]');
    await submit.evaluate((button) => {
      button.addEventListener("click", () => {
        (button as HTMLElement).dataset.clicked = "true";
      });
    });
    await editor.fill("Journal entry");
    await expect(editor).toHaveText("Journal entry");
    await submit.click();
    await expect(submit).toHaveAttribute("data-clicked", "true");

    await selectMode(popupPage, "normal");
    await xPage.waitForFunction(() => !document.documentElement.hasAttribute("data-asocial-mode"));
    await expect(xPage.locator("#native-composer")).not.toHaveAttribute(
      "data-asocial-allowed",
      /.+/,
    );
    await expect(xPage.locator("#self-post")).not.toHaveAttribute("data-asocial-owner", /.+/);
    await expect(xPage.locator("#self-post [data-testid=like]")).toHaveAttribute(
      "aria-label",
      "7 Likes. Like",
    );
    expect(await computed(xPage, '[data-testid="trend"]', "display")).not.toBe("none");
  } finally {
    await context?.close();
    await rm(profilePath, { recursive: true, force: true });
  }
});
