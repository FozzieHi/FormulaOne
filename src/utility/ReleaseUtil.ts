import fs from "fs";

export async function getReleaseHash() {
  const hash = await fs.promises.readFile(".git/HEAD", "utf8");
  if (hash.indexOf(":") === -1) {
    return hash;
  }
  const refPath = `.git/${hash.substring(5).trim()}`;
  return fs.promises.readFile(refPath, "utf8");
}
