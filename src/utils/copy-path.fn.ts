import { normalize } from "@angular-devkit/core";
import {
  apply,
  applyTemplates,
  move,
  Source,
  strings,
  url,
} from "@angular-devkit/schematics";

export function copyPath<T>(
  options: T,
  path: string,
  pathToCopyTo: string
): Source {
  return apply(url(`./files/${path}`), [
    applyTemplates({
      ...options,
      ...strings,
      dot: ".",
    }),
    move(normalize(pathToCopyTo)),
  ]);
}
