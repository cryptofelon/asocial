import { readFile } from "node:fs/promises";

const manifestUrl = new URL("../.output/chrome-mv3/manifest.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));

const expectedHosts = ["https://x.com/*", "https://twitter.com/*"];
const failures = [];
const sameValues = (actual, expected) =>
  Array.isArray(actual) &&
  actual.length === expected.length &&
  expected.every((value) => actual.includes(value));

if (manifest.manifest_version !== 3) failures.push("manifest_version must be 3");
if (JSON.stringify(manifest.permissions) !== JSON.stringify(["storage"])) {
  failures.push("permissions must contain only storage");
}
if (!sameValues(manifest.host_permissions, expectedHosts)) {
  failures.push("host_permissions must contain only X and Twitter");
}
if (manifest.background) failures.push("background service worker is not allowed");
if (manifest.externally_connectable) failures.push("externally_connectable is not allowed");

const contentScripts = manifest.content_scripts ?? [];
if (contentScripts.length !== 1) failures.push("exactly one content script is required");
const [contentScript] = contentScripts;
if (contentScript?.run_at !== "document_start") {
  failures.push("content script must run at document_start");
}
if (!sameValues(contentScript?.matches, expectedHosts)) {
  failures.push("content script matches must contain only X and Twitter");
}

if (failures.length > 0) {
  throw new Error(`Unsafe generated manifest:\n- ${failures.join("\n- ")}`);
}

console.log("Manifest permission boundary verified.");
