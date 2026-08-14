import { updateSettings } from "../settings/repository";
import cssText from "./journal-shell.scss?inline";

export class JournalShell {
  readonly #document: Document;
  #host: HTMLElement | undefined;
  #status: HTMLElement | undefined;
  #title: HTMLElement | undefined;
  #lead: HTMLElement | undefined;
  #actions: HTMLElement | undefined;

  constructor(document: Document) {
    this.#document = document;
  }

  mount(): void {
    if (this.#host?.isConnected) return;
    const host = this.#document.createElement("div");
    host.id = "asocial-root";
    const shadow = host.attachShadow({ mode: "open" });
    const stylesheet = this.#document.createElement("style");
    stylesheet.textContent = cssText;
    shadow.append(stylesheet);

    const shell = this.#document.createElement("main");
    shell.className = "shell";
    const card = this.#document.createElement("section");
    card.className = "card";

    const header = this.#document.createElement("header");
    header.className = "header";
    const wordmark = this.#document.createElement("span");
    wordmark.className = "wordmark";
    wordmark.textContent = "asocial";
    const status = this.#document.createElement("span");
    status.className = "status";
    status.textContent = "Journal ready";
    header.append(wordmark, status);

    const title = this.#document.createElement("h1");
    title.className = "title";
    title.textContent = "Write without the scoreboard.";
    const lead = this.#document.createElement("p");
    lead.className = "lead";
    lead.textContent =
      "X still handles drafts, media, audience controls, validation, and publishing. asocial keeps the reading surfaces out of sight.";
    const warning = this.#document.createElement("p");
    warning.className = "warning";
    warning.textContent =
      "Posts use your current X audience. Journal mode is intentionally quiet, not private.";

    const actions = this.#document.createElement("div");
    actions.className = "actions";
    actions.append(
      this.#button("Write on X", "primary", () => {
        this.#document.location.assign("/compose/post");
      }),
      this.#button("Switch account", undefined, () => {
        const switcher = this.#document.querySelector<HTMLElement>(
          '[data-testid="SideNav_AccountSwitcher_Button"]',
        );
        if (!switcher) {
          this.setStatus("Account switcher unavailable", true);
          return;
        }
        switcher.click();
      }),
    );

    const footer = this.#document.createElement("footer");
    footer.className = "footer";
    footer.append(
      this.#button("Settings", undefined, () => {
        void browser.runtime.openOptionsPage();
      }),
      this.#button("Return to Normal", undefined, () => {
        void updateSettings({ mode: "normal" });
      }),
    );

    card.append(header, title, lead, warning, actions, footer);
    shell.append(card);
    shadow.append(shell);
    this.#document.body.append(host);
    this.#host = host;
    this.#status = status;
    this.#title = title;
    this.#lead = lead;
    this.#actions = actions;
  }

  setStatus(message: string, degraded = false): void {
    if (!this.#status) return;
    this.#status.textContent = message;
    this.#status.dataset.degraded = String(degraded);
  }

  showRecovery(): void {
    this.mount();
    if (this.#title) this.#title.textContent = "X changed underneath asocial.";
    if (this.#lead) {
      this.#lead.textContent =
        "The page remains covered because asocial could not establish a safe journal state. Open settings, return to Normal, or disable the extension.";
    }
    if (this.#actions) this.#actions.hidden = true;
    this.setStatus("Recovery mode", true);
  }

  unmount(): void {
    this.#host?.remove();
    this.#host = undefined;
    this.#status = undefined;
    this.#title = undefined;
    this.#lead = undefined;
    this.#actions = undefined;
  }

  #button(label: string, className: string | undefined, onClick: () => void): HTMLButtonElement {
    const button = this.#document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (className) button.className = className;
    button.addEventListener("click", onClick);
    return button;
  }
}
