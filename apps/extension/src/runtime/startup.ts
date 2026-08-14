import { readSettings, subscribeToSettings } from "../settings/repository";
import { ModeController } from "./mode-controller";
import { isRuntimeStatusRequest } from "./status";

function waitForBody(document: Document): Promise<HTMLElement> {
  if (document.body) return Promise.resolve(document.body);
  const { promise, resolve } = Promise.withResolvers<HTMLElement>();
  const observer = new MutationObserver(() => {
    if (!document.body) return;
    observer.disconnect();
    resolve(document.body);
  });
  observer.observe(document.documentElement, { childList: true });
  return promise;
}

export async function startRuntime(document: Document): Promise<() => void> {
  const controller = new ModeController(document);
  const onMessage = (message: unknown) =>
    isRuntimeStatusRequest(message) ? Promise.resolve(controller.status()) : undefined;
  browser.runtime.onMessage.addListener(onMessage);
  const dispose = () => {
    browser.runtime.onMessage.removeListener(onMessage);
    controller.dispose();
  };
  let timedOut = false;
  const recoveryTimer = setTimeout(() => {
    timedOut = true;
    void waitForBody(document).then(() => controller.recover());
  }, 1500);

  try {
    const [settings] = await Promise.all([readSettings(), waitForBody(document)]);
    clearTimeout(recoveryTimer);
    if (timedOut) {
      controller.recover();
      return dispose;
    }
    controller.apply(settings);
    const unsubscribe = subscribeToSettings((next) => controller.apply(next));
    return () => {
      unsubscribe();
      dispose();
    };
  } catch {
    clearTimeout(recoveryTimer);
    await waitForBody(document);
    controller.recover();
    return dispose;
  }
}
