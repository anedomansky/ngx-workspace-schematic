import { normalize } from "@angular-devkit/core";
import {
  apply,
  applyTemplates,
  move,
  noop,
  Source,
  strings,
  url,
} from "@angular-devkit/schematics";

/**
 * Copies a path to a specified destination with applied templates.
 *
 * @template T - The type of the options object.
 * @param options - The options to be used in the templates.
 * @param path - The path to the source files.
 * @param pathToCopyTo - The destination path to copy the files to. If null, no move operation is performed.
 *
 * @return - The source with applied templates and optional move operation.
 */
export function copyPath<T>(
  options: T,
  path: string,
  pathToCopyTo: string | null
): Source {
  return apply(url(`./files/${path}`), [
    applyTemplates({
      ...options,
      ...strings,
      dot: ".",
    }),
    pathToCopyTo ? move(normalize(pathToCopyTo)) : noop,
  ]);
}
