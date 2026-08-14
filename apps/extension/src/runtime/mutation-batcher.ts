export class MutationBatcher {
  readonly #pending = new Set<Element>();
  readonly #flush: (roots: readonly Element[]) => void;
  #scheduled = false;

  constructor(flush: (roots: readonly Element[]) => void) {
    this.#flush = flush;
  }

  add(root: Element): void {
    for (const pending of this.#pending) {
      if (pending.contains(root)) return;
      if (root.contains(pending)) this.#pending.delete(pending);
    }
    this.#pending.add(root);
    if (this.#scheduled) return;
    this.#scheduled = true;
    queueMicrotask(() => {
      this.#scheduled = false;
      const roots = [...this.#pending];
      this.#pending.clear();
      this.#flush(roots);
    });
  }

  clear(): void {
    this.#pending.clear();
  }
}
