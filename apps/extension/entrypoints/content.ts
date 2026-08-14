import { startRuntime } from "../src/runtime/startup";
import "../styles/startup-mask.scss";
import "../styles/x-policies.scss";

export default defineContentScript({
  matches: ["https://x.com/*", "https://twitter.com/*"],
  runAt: "document_start",
  cssInjectionMode: "manifest",
  main() {
    void startRuntime(document);
  },
});
