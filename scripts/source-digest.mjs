import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

export function sdkDigest(root) {
  const walk = (dir) =>
    readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`],
    );
  const hash = createHash("sha256");
  for (const path of [...walk("src"), "package.json", "tsconfig.json", "tsup.config.ts"].sort()) {
    hash.update(path + "\0");
    hash.update(readFileSync(resolve(root, path), "utf8").replaceAll("\r\n", "\n"));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function fileDigest(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
