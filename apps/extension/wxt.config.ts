import type { PluginOption } from "vite";
import styletyper from "vite-plugin-styletyper";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "asocial",
    description: "Write on X without the feed, or hide vanity metrics and attention traps.",
    permissions: ["storage"],
    host_permissions: ["https://x.com/*", "https://twitter.com/*"],
  },
  vite: () => ({
    plugins: [styletyper() as unknown as PluginOption],
  }),
});
