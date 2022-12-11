import { dirname } from "path";
import { fileURLToPath } from "url";

export const rootDir = dirname(fileURLToPath(import.meta.url));
