import { applyLowDopamineSettings } from "../modes/low-dopamine";
import { clearPolicyState } from "../modes/normal";
import { applyWriteOnlyAllowlist, clearWriteOnlyAllowlist } from "../modes/write-only";
import type { SettingsV1 } from "../settings/model";
import { XAdapter } from "../x-adapter/adapter";
import { classifyRoute } from "../x-adapter/routes";
import { MutationBatcher } from "./mutation-batcher";
import type { RuntimeStatus } from "./status";

export class ModeController {
  readonly #document: Document;
  readonly #adapter: XAdapter;
  readonly #batcher: MutationBatcher;
  #observer: MutationObserver | undefined;
  #settings: SettingsV1 | undefined;
  #pathname = "";
  #composerTimer: ReturnType<typeof setTimeout> | undefined;
  #composerNavigationRequested = false;

  constructor(document: Document) {
    this.#document = document;
    this.#adapter = new XAdapter(document);
    this.#batcher = new MutationBatcher((roots) => this.#processRoots(roots));
  }
  status(): RuntimeStatus {
    const html = this.#document.documentElement;
    const adapter = html.dataset.asocialAdapter;
    return {
      mode:
        this.#settings?.mode ??
        (html.dataset.asocialMode === "write-only" ? "write-only" : "normal"),
      adapter:
        adapter === "inactive" || adapter === "ready" || adapter === "degraded"
          ? adapter
          : "inactive",
      route: html.dataset.asocialRoute ?? classifyRoute(this.#document.location.pathname),
    };
  }

  apply(settings: SettingsV1): void {
    this.#settings = settings;
    this.#pathname = this.#document.location.pathname;
    clearTimeout(this.#composerTimer);
    this.#composerTimer = undefined;
    this.#composerNavigationRequested = false;
    this.#adapter.reset();
    clearWriteOnlyAllowlist(this.#document);
    clearPolicyState(this.#document.documentElement);

    if (settings.mode === "normal") {
      this.#stopObserver();
      this.#document.documentElement.dataset.asocialAdapter = "inactive";
      this.#document.documentElement.dataset.asocialStartup = "ready";
      return;
    }

    this.#startObserver();
    if (settings.mode === "low-dopamine") {
      applyLowDopamineSettings(this.#document.documentElement, settings);
      const status = this.#adapter.apply(settings, [this.#document.documentElement]);
      this.#document.documentElement.dataset.asocialAdapter = status.degraded
        ? "degraded"
        : "ready";
      this.#document.documentElement.dataset.asocialStartup = "ready";
      return;
    }

    this.#applyWriteOnly([this.#document.documentElement]);
    this.#document.documentElement.dataset.asocialStartup = "ready";
  }

  recover(): void {
    this.#document.documentElement.dataset.asocialStartup = "recovery";
    this.#document.documentElement.dataset.asocialMode = "write-only";
    this.#document.documentElement.dataset.asocialAdapter = "degraded";
  }

  dispose(): void {
    clearTimeout(this.#composerTimer);
    this.#composerTimer = undefined;
    this.#stopObserver();
    this.#batcher.clear();
    this.#adapter.reset();
    clearWriteOnlyAllowlist(this.#document);
    clearPolicyState(this.#document.documentElement);
  }

  #startObserver(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        let queuedAddedElement = false;
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          this.#batcher.add(node);
          queuedAddedElement = true;
        });
        if (!queuedAddedElement && mutation.target instanceof Element) {
          this.#batcher.add(mutation.target);
        }
      }
    });
    this.#observer.observe(this.#document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  #stopObserver(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#batcher.clear();
  }

  #processRoots(roots: readonly Element[]): void {
    const settings = this.#settings;
    if (!settings || settings.mode === "normal") return;
    const routeChanged = this.#pathname !== this.#document.location.pathname;
    if (routeChanged) this.#pathname = this.#document.location.pathname;
    const scanRoots = routeChanged ? [this.#document.documentElement] : roots;

    if (settings.mode === "low-dopamine") {
      const status = this.#adapter.apply(settings, scanRoots);
      this.#document.documentElement.dataset.asocialAdapter = status.degraded
        ? "degraded"
        : "ready";
      return;
    }
    this.#applyWriteOnly(scanRoots);
  }

  #applyWriteOnly(roots: readonly Element[]): void {
    const html = this.#document.documentElement;
    const route = classifyRoute(this.#document.location.pathname);
    html.dataset.asocialMode = "write-only";
    html.dataset.asocialRoute = route;

    if (route === "auth") {
      html.dataset.asocialAdapter = "ready";
      clearTimeout(this.#composerTimer);
      this.#composerTimer = undefined;
      return;
    }

    if (route !== "compose") {
      html.dataset.asocialAdapter = "ready";
      clearTimeout(this.#composerTimer);
      this.#composerTimer = undefined;
      if (!this.#composerNavigationRequested) {
        this.#composerNavigationRequested = true;
        this.#document.location.assign("/compose/post");
      }
      return;
    }

    this.#composerNavigationRequested = false;
    const status = applyWriteOnlyAllowlist(this.#document, roots);
    html.dataset.asocialAdapter = "ready";
    if (status.composerReady) {
      clearTimeout(this.#composerTimer);
      this.#composerTimer = undefined;
      return;
    }

    if (this.#composerTimer) return;
    this.#composerTimer = setTimeout(() => {
      this.#composerTimer = undefined;
      if (
        this.#settings?.mode === "write-only" &&
        !this.#document.querySelector('[data-asocial-allowed="composer"]')
      ) {
        html.dataset.asocialAdapter = "degraded";
      }
    }, 2500);
  }
}
