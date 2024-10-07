import {
  apply,
  chain,
  empty,
  mergeWith,
  noop,
  Rule,
  schematic,
  SchematicContext,
  strings,
  Tree,
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";

import { Schema } from "./schema";
import { Schema as LibrarySchema } from "../library/schema";
import { Schema as ApplicationSchema } from "../application/schema";
import { Schema as WorkspaceSchema } from "../workspace/schema";

export default function (options: Schema): Rule {
  const workspaceOptions: WorkspaceSchema = {
    name: options.name,
  };

  const libraryOptions: LibrarySchema = {
    name: options.libraryName,
    namespace: options.libraryNamespace,
  };

  const applicationOptions: ApplicationSchema = {
    name: options.name,
    appName: options.appName,
    withLibrary: options.withLibrary,
  };

  options.name = strings.dasherize(options.name);

  switch (options.type) {
    case "complete":
      options.appName = options.appName
        ? options.appName
        : `${options.name}-app`;
      options.libraryPackageName = `${
        options.libraryNamespace
      }/${strings.dasherize(options.libraryName)}`;
      break;
    case "application":
      options.appName = options.appName
        ? options.appName
        : `${options.name}-app`;
      break;
    case "library":
      options.libraryPackageName = `${
        options.libraryNamespace
      }/${strings.dasherize(options.libraryName)}`;
      break;
  }

  return (tree: Tree, context: SchematicContext) => {
    const rule = chain([
      mergeWith(
        apply(empty(), [
          schematic("workspace", workspaceOptions),
          options.withApplication
            ? schematic("application", applicationOptions)
            : noop,
          options.withLibrary ? schematic("library", libraryOptions) : noop,
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

// TODO: tests
// TODO: update README.md
// TODO: release 2.0.0
