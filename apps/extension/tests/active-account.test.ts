import { afterEach, describe, expect, it } from "vitest";
import { detectActiveAccount } from "../src/x-adapter/active-account";

afterEach(() => {
  document.body.replaceChildren();
});

describe("detectActiveAccount", () => {
  it("requires two agreeing live DOM signals", () => {
    document.body.innerHTML = `
      <a data-testid="AppTabBar_Profile_Link" href="/alpha_user">Profile</a>
      <button data-testid="SideNav_AccountSwitcher_Button">Name @Alpha_User</button>
    `;

    expect(detectActiveAccount(document)).toEqual({
      status: "known",
      handle: "alpha_user",
    });
  });

  it("fails calm when signals disagree or one is missing", () => {
    document.body.innerHTML = `
      <a data-testid="AppTabBar_Profile_Link" href="/alpha_user">Profile</a>
      <button data-testid="SideNav_AccountSwitcher_Button">Name @beta_user</button>
    `;
    expect(detectActiveAccount(document)).toEqual({
      status: "unknown",
      reason: "disagreement",
    });

    document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]')?.remove();
    expect(detectActiveAccount(document)).toEqual({
      status: "unknown",
      reason: "missing-signals",
    });
  });
});
