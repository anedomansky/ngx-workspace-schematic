import {
  apply,
  chain,
  empty,
  mergeWith,
  noop,
  Rule,
  schematic,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";

import { Schema } from "./schema";
import { Schema as LibrarySchema } from "../library/schema";
import { Schema as ApplicationSchema } from "../application/schema";
import { Schema as WorkspaceSchema } from "../workspace/schema";
import { dasherize } from "@angular-devkit/core/src/utils/strings";

export default function (options: Schema): Rule {
  options.name = dasherize(options.name);

  const workspaceOptions: WorkspaceSchema = {
    name: options.name,
  };

  const libraryOptions: LibrarySchema = {
    name: options.name,
    libraryName: options.libraryName ?? "",
  };

  const applicationOptions: ApplicationSchema = {
    name: options.name,
    appName: options.appName ?? "",
  };

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      mergeWith(
        apply(empty(), [
          schematic("workspace", workspaceOptions),
          libraryOptions.libraryName
            ? schematic("library", libraryOptions)
            : noop,
          applicationOptions.appName
            ? schematic("application", applicationOptions)
            : noop,
        ])
      ),
    ]);

    context.addTask(
      new NodePackageInstallTask({
        workingDirectory: `/${options.name}`,
        allowScripts: true,
      })
    );

    return rule(tree, context);
  };
}
