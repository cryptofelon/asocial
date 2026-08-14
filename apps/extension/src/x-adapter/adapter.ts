import type { SettingsV1 } from "../settings/model";
import { PatchLedger } from "../runtime/patch-ledger";
import { detectActiveAccount } from "./active-account";
import { classifyRoute, type XRoute } from "./routes";
import {
  annotateAttentionSurfaces,
  annotatePosts,
  annotateProfileMetrics,
  annotateRecommendedPosts,
} from "./surfaces";

const ANNOTATION_ATTRIBUTES = [
  "data-asocial-badge",
  "data-asocial-metric",
  "data-asocial-owner",
  "data-asocial-profile-metric",
  "data-asocial-surface",
] as const;

export interface AdapterStatus {
  adapterVersion: "x-dom-1";
  activeAccount: "known" | "unknown";
  route: XRoute;
  postCount: number;
  metricCount: number;
  degraded: boolean;
}

export class XAdapter {
  readonly #document: Document;
  readonly #ledger = new PatchLedger();
  #accountSignature = "";

  constructor(document: Document) {
    this.#document = document;
  }

  apply(settings: SettingsV1, roots: readonly Element[]): AdapterStatus {
    const activeAccount = detectActiveAccount(this.#document);
    const accountSignature =
      activeAccount.status === "known"
        ? `known:${activeAccount.handle}`
        : `unknown:${activeAccount.reason}`;
    if (this.#accountSignature !== "" && accountSignature !== this.#accountSignature) {
      this.reset();
    }
    const scanRoots =
      accountSignature === this.#accountSignature ? roots : [this.#document.documentElement];
    this.#accountSignature = accountSignature;

    for (const root of scanRoots) {
      annotatePosts(root, activeAccount, settings, this.#ledger);
      annotateProfileMetrics(root, activeAccount);
      annotateAttentionSurfaces(root);
    }

    const route = classifyRoute(this.#document.location.pathname);
    if (route === "status") annotateRecommendedPosts(this.#document);

    const postCount = this.#document.querySelectorAll(
      '[data-asocial-owner][data-testid="tweet"]',
    ).length;
    const metricCount = this.#document.querySelectorAll("[data-asocial-metric]").length;

    return {
      adapterVersion: "x-dom-1",
      activeAccount: activeAccount.status,
      route,
      postCount,
      metricCount,
      degraded: settings.metricScope === "self" && activeAccount.status === "unknown",
    };
  }

  reset(): void {
    this.#ledger.restoreAll();
    this.#accountSignature = "";
    const selector = ANNOTATION_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",");
    this.#document.querySelectorAll(selector).forEach((element) => {
      for (const attribute of ANNOTATION_ATTRIBUTES) {
        element.removeAttribute(attribute);
      }
    });
  }
}
