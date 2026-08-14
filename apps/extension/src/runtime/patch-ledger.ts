interface AttributePatch {
  original: string | null;
  replacement: string;
}

export class PatchLedger {
  readonly #ariaLabels = new Map<Element, AttributePatch>();

  setAriaLabel(element: Element, replacement: string): void {
    const current = element.getAttribute("aria-label");
    const existing = this.#ariaLabels.get(element);
    if (!existing) {
      this.#ariaLabels.set(element, { original: current, replacement });
    } else if (current !== existing.replacement && current !== replacement) {
      existing.original = current;
      existing.replacement = replacement;
    }
    if (current !== replacement) element.setAttribute("aria-label", replacement);
  }

  restoreAll(): void {
    for (const [element, patch] of this.#ariaLabels) {
      if (patch.original === null) element.removeAttribute("aria-label");
      else element.setAttribute("aria-label", patch.original);
    }
    this.#ariaLabels.clear();
  }
}
